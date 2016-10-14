'use strict';

angular.module('ASPEn.directives')
    .directive('repositories', function () {
        return {
            restrict: 'EA',
            templateUrl: 'directives/ManageRepositories/repositories.html',
            controller: repositoriesCtrl
        }
    });
repositoriesCtrl.$inject = ['$scope', '$rootScope', '$http', '$modal', 'permissionsService', 'graphService', '$stateParams', 'fsAgentConfigService', '$state', 'adminService', '$q'];
function repositoriesCtrl($scope, $rootScope, $http, $modal, permissionsService, graphService, $stateParams, fsAgentConfigService, $state, adminService, $q) {
    adminService.loadSetup()
        .then(function() {
            $scope.repositories = $scope.repositories || {};
            $scope.repositories.sortOptions = $rootScope.resource.repositories.sortOptions;
            $scope.repositories.sortDefault= $scope.repositories.sortOptions[0].text;

            for(var i=0;i<$scope.repositories.sortOptions.length;i++){
                if($scope.repositories.sortOptions[0].default){
                    $scope.defaultOption=$scope.repositories.sortOptions[0].text;
                    break;
                }

            }
            $rootScope.otherPage = $stateParams.otherPage;

            $scope.selectedIndex=0;
            $scope.selectedIndex1=0;
            $scope.selectedIndex2=0;
            $scope.statusNames=$rootScope.resource.repositories.filterStatus.all;
            $scope.typeNames=$rootScope.resource.repositories.filterAllTypes;
            $scope.repositoriesrows = [];
            $scope.repository = [];
            $scope.repository.baseJournalingAddress = "";
            $scope.repository.baseSmtpRelayAddress = "";
            $scope.repository.currentJournalingCounter = 0;
            $scope.repository.spinner = true;
            $scope.reverse=false;
            $scope.deleteError = false; //determines message format in confirmation
            $scope.containsData = false; //determines button format in confirmation

            $scope.filters = {
                options: [
                    {
                        name:$rootScope.resource.repositories.filterAllTypes,
                        filter:"",
                        default: true
                    }
                ]
            };
            var temp="";
            var temp1="";
            $rootScope.hasTypesFilter = function (repSubType) {
                var found = false;
                for (var i in $scope.filters.options) {
                    var opt = $scope.filters.options[i];
                    if (opt.filter == repSubType) {
                        found = true;
                        break;
                    }
                }
                return found;
            };

            var postUrl = $rootScope.backEnd + $rootScope.config.repositories.api;

            $scope.getAudit = function(item, count) {
                $state.go('main.reports.audit', {'objectType': 'Repository', 'objectId': item.objectId});
            };
            var canceller;
            /* Required for display panel*/
            $scope.repository.apply = function(item) {
                $scope.repository.item=[];
                $scope.repository.item = item;
                $scope.repository.item.objectId = item.id;
                $scope.repository.item.loading = true;
                $scope.repository.item.success = null;
                if(item.details != "") {
                    $scope.repository.item.detail = angular.copy(item.details);
                }
                if ($scope.repository.item.repositoryType == 'FileSystem' || $scope.repository.item.repositoryType == 'Lync') {
                    if ($scope.repository.item.detail.agentProperties !== undefined) {
                        if ($scope.repository.item.detail.agentProperties.cronExpression !== undefined) {
                            $scope.repository.item.startTime =
                                fsAgentConfigService.getStartTime($scope.repository.item.detail.agentProperties.cronExpression);

                            $scope.repository.item.selectedDays =
                                fsAgentConfigService.getSelectedDays($scope.repository.item.detail.agentProperties.cronExpression,
                                    $rootScope.resource.repository.fileSystem.weekdays);
                        }
                    }
                }
                if(canceller) {
                    canceller.resolve();
                }
                canceller = $q.defer();
                var postConfig = {
                    'params': {
                        includeStats: true
                    },
                    'timeout': canceller.promise
                };
                $http.get(postUrl + "/" + item.id, postConfig)
                    .success(function (res) {
                        var details= angular.copy(res.details);
                        $scope.repository.item.dataSize = graphService.humanFileSizeLabel(details.repositoryStats.totalSize, 'data_size');
                        $scope.repository.item.date = details.repositoryStats.lastArchivedDate * 1000;
                        $scope.repository.item.dataCount = details.repositoryStats.totalCount;
                        $scope.repository.item.loading = false;
                        $scope.repository.item.success = true;

                    })
                    .error(function (err, status) {
                        if(status == 0) {
                            $scope.repository.item.loading = true;
                            $scope.repository.item.success = null;
                        }
                        else {
                            $scope.repository.item.loading = false;
                            $scope.repository.item.success = false;
                        }
                    });
            };
            $http.get(postUrl)
                .success(function (res) {
                    $scope.repository.baseJournalingAddress = res.baseJournalingAddress;
                    $scope.repository.baseSmtpRelayAddress = res.baseSmtpRelayAddress;
                    $scope.$broadcast('baseJournalingAddress');
                    for (var i in res.repositories) {
                        var rep = res.repositories[i];
                        var repType = rep['repositoryType'];
                        var repSubType = rep['repositorySubType'];
                        var name = rep['name'];
                        if(rep['id'] == 0) {
                            name = $scope.resource.repository.types.ManualUpload.ManualUpload.title;
                        }
                        $scope.repositoriesrows.push({
                            id: rep['id'],
                            lastModified: rep['lastModified'],
                            name: name,
                            repositoryType: repType,
                            repositorySubType: repSubType,
                            repositorySubTypeLabel: $rootScope.resource.repository.types[repType][repSubType].title,
                            active: rep['active'],
                            details: rep['details'],
                            panel: {
                                title: name,
                                main: "directives/ManageRepositories/preview.html",
                                top: 122,
                                reference: '.navbar-static-top',
                                scope: $scope
                            }});
                        if (!$rootScope.hasTypesFilter(repSubType)) {
                            $scope.filters.options.push({name: $rootScope.resource.repository.types[repType][repSubType].title, filter: repSubType, default: false});
                        }
                        if (repType == "Exchange") {
                            var details = angular.copy(rep['details']);
                            if (details.journalingCounter > $scope.repository.currentJournalingCounter) {
                                $scope.repository.currentJournalingCounter = details.journalingCounter;
                            }
                        }
                    }
                    for(var k in $scope.sorters.options){
                        if($scope.sorters.options[k].default)
                            $scope.sortQuery=$scope.sorters.options[k].sort;
                    }
                    $scope.repository.spinner = false;
                })
                .error(function (err, status) {
                    if($rootScope.isSessionExpired(status, err)) {
                        $rootScope.redirectToLogin();
                    } else {
                        permissionsService.redirectCheck();
                    }
                    angular.element('#repoList').html($rootScope.resource.common.fields.error + ' (' + status + ')');
                    $scope.repository.spinner = false;
                });

            $scope.sorters = {
                title: $rootScope.resource.repositories.sortBy,
                options: $scope.repositories.sortOptions
            };

            $scope.active = {
                options: [
                    {
                        name: $rootScope.resource.repositories.filterStatus.all,
                        filter:"",
                        default: true
                    },
                    {
                        name: $rootScope.resource.repositories.filterStatus.active,
                        filter: "true",
                        default: false
                    },
                    {
                        name: $rootScope.resource.repositories.filterStatus.inactive,
                        filter: "false",
                        default: false
                    }
                ]
            };


            $scope.sorters.options.forEach(function (option,index) {
                option.select = function (sorter) {
                    $scope.sortQuery=sorter.sort;
                    $scope.defaultOption=sorter.text;
                    $scope.selectedIndex=index;
                    if((index%2 != 0))
                        $scope.reverse=true;
                    else
                        $scope.reverse=false;
                }
            });

            var toggleActive = function (id, active) {
                $scope.repository.spinner = true;
                var reps = $scope.repositoriesrows;
                var rep;
                for (var i in reps) {
                    if (reps[i].id == id) {
                        rep = reps[i];
                        break;
                    }
                }
                var repUrl = $rootScope.backEnd + $rootScope.config.repositories.api + "/" + id;
                var postObj = {
                    name: rep.name,
                    active: active,
                    lastModified: rep.lastModified
                };
                var postConfig = {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                $http.put(repUrl, postObj, postConfig)
                    .success(function (res) {
                        rep.active = active;
                        rep.lastModified = res.lastModified;
                        $scope.repository.spinner = false;
                    })
                    .error(function (err, status) {
                        if($rootScope.isSessionExpired(status, err)) {
                            $rootScope.redirectToLogin();
                        }
                        if (active)
                            $scope.repositories.errorMessage = $rootScope.resource.repositories.errorActivate + ' (' + status + ').';
                        else
                            $scope.repositories.errorMessage = $rootScope.resource.repositories.errorDeactivate + ' (' + status + ').';
                        $scope.repositories.errorMessage = $scope.repositories.errorMessage.replace("{0}", $scope.repository.name);
                        $scope.repositories.hasError = true;
                        $scope.repository.spinner = false;
                    });
            };

            var updateExchangeJournalingCounter = function() {
                var reps = $scope.repositoriesrows;
                for (var i in reps) {
                    var details = angular.copy(reps[i].details);
                    if (reps[i].repositoryType == "Exchange" && details.journalingCounter > $scope.repository.currentJournalingCounter) {
                        $scope.repository.currentJournalingCounter = details.journalingCounter;
                    }
                }
            };

            var remove = function (id) {
                $scope.repository.spinner = true;
                var repUrl = $rootScope.backEnd + $rootScope.config.repositories.api + "/" + id;
                $http.delete(repUrl)
                    .success(function (res,status) {
                        var reps = $scope.repositoriesrows;
                        for (var i in reps) {
                            if (reps[i].id == id) {
                                var details = angular.copy(reps[i].details);
                                var isExchange = reps[i].repositoryType == 'Exchange';
                                reps.splice(i, 1);
                                if (isExchange && details.journalingCounter == $scope.repository.currentJournalingCounter) {
                                    $scope.repository.currentJournalingCounter = 0;
                                    updateExchangeJournalingCounter();
                                }
                                break;
                            }
                        }
                        $scope.repository.spinner = false;
                        $http.get($rootScope.backEnd + $rootScope.config.repositories.api)
                            .success(function (res) {
                                $rootScope.repositories = res.repositories;
                            });
                    })
                    .error(function (err, status) {
                        if($rootScope.isSessionExpired(status, err)) {
                            $rootScope.redirectToLogin();
                        }
                        else if(status == 409) {
                            var reps = $scope.repositoriesrows;
                            for (var i in reps) {
                                if (reps[i].id == id) {
                                    $scope.confirm(reps[i].id, 'error', false);
                                    break;
                                }
                            }
                        }
                        else {
                            $scope.repositories.errorMessage = $rootScope.resource.repositories.errorDelete + ' (' + status + ').';
                            $scope.repositories.errorMessage = $scope.repositories.errorMessage.replace("{0}", $scope.repository.name);
                            $scope.repositories.hasError = true;
                        }
                        $scope.repository.spinner = false;
                    });
            };

            $scope.confirm = function (id, action, active) {
                $scope.deleteError = false;
                $scope.containsData = false;
                $scope.repository = $scope.repository || {};
                $scope.repository.id = id;
                $scope.repository.active = active;
                $scope.repository.action = action;
                $scope.repositories.hasError = false;
                var reps = $scope.repositoriesrows;
                for (var i in reps) {
                    if (reps[i].id == id) {
                        $scope.repository.name = reps[i].name;
                        $scope.repository.isActive = reps[i].active;
                        break;
                    }
                }

                var resource = $rootScope.resource.repository.confirmDialog;
                if (action == "active") {
                    if (active)  {
                        $scope.repository.confirmTitle = resource.activateTitle;
                        $scope.repository.confirmMessage = resource.activateMessage;
                    } else {
                        $scope.repository.confirmTitle = resource.deactivateTitle;
                        $scope.repository.confirmMessage = resource.deactivateMessage;
                    }
                } else if (action == "delete") {
                    $scope.repository.confirmTitle = resource.deleteTitle;
                    $scope.repository.confirmMessage = resource.deleteMessage;
                } else if (action == "error") {
                    $scope.deleteError = true;
                    if ($scope.repository.isActive)  {
                        $scope.repository.confirmTitle = resource.deleteTitle;
                        $scope.repository.confirmMessage = "cannot be deleted because it still contains data. Do you want to deactivate the repository instead?";
                    } else {
                        $scope.repository.confirmTitle = resource.deleteTitle;
                        $scope.repository.confirmMessage = "cannot be deleted because it still contains data.";
                        $scope.containsData = true;
                    }
                }
                $scope.confirmModal = $modal.open({
                    animation:  false,
                    backdrop: 'static',
                    templateUrl: 'views/repositories/manage/confirm.html',
                    keyboard: 'true',
                    scope:$scope
                });
            };

            $scope.confirmOk = function() {
                $scope.repositories.errorMessage = "";
                if ($scope.repository.action == "active") {
                    toggleActive($scope.repository.id, $scope.repository.active);
                } else if ($scope.repository.action == "delete") {
                    remove($scope.repository.id);
                } else if ($scope.repository.action == "error") {
                    toggleActive($scope.repository.id, $scope.repository.active);
                }
                $scope.confirmModal.close("true");
            };

            $scope.confirmCancel = function() {
                $scope.confirmModal.dismiss("cancel");
            };

            $rootScope.openRepository = function (id) {
                $scope.repository = $scope.repository || {};
                $scope.repository.hasError = false;
                $scope.repository.id = id;
                $rootScope.repositoryisEdit = id > 0;
                $scope.repository.journalingCounter = null;
                //console.log($scope.repository.baseJournalingAddress);
                if(id == 0){
                    $state.go('main.repositories.new-repository',({repoId: $scope.repository.id,baseJournalingAddress:$scope.repository.baseJournalingAddress,
                        baseSmtpRelayAddress: $scope.repository.baseSmtpRelayAddress,
                        currentJournalingCounter: $scope.repository.currentJournalingCounter}));
                }
                else{
                    $state.go('main.repositories.edit-repository',({repoId: $scope.repository.id,baseJournalingAddress:$scope.repository.baseJournalingAddress,
                        baseSmtpRelayAddress: $scope.repository.baseSmtpRelayAddress,
                        currentJournalingCounter: $scope.repository.currentJournalingCounter }));
                }

                //  console.log($scope.repository);
            };
            if($rootScope.otherPage){
                //  if($scope.repository.baseJournalingAddress!="")
                $scope.$on('baseJournalingAddress',function(){
                    $rootScope.openRepository(0);
                })


            }


            $scope.select=function(op,index){
                temp=op.filter;
                $scope.selectedIndex2=index;
                $scope.typeNames=op.name;
            };

            $scope.repoFilter = function (name) {
                temp1=name;
            };
            $scope.select1=function(op,index){
                $scope.temp2=op.filter;
                $scope.selectedIndex1=index;
                $scope.statusNames=op.name;
            };

            $scope.filterFunction = function (element) {
                return element.repositorySubType.match(temp) ? true : false;
            };
            $scope.filterName = function (element) {
                return  element.name.match(new RegExp(temp1, "gi"))? true : false;
            };
            $rootScope.getRepoRows = function(){
                return $scope.repositoriesrows;
            }
        });
}
