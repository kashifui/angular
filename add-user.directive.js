'use strict';
angular.module('ASPEn.directives')
    .directive('addUser',function(){
        return{
            restrict: 'EA',
            templateUrl: 'directives/User/AddUser/add-user.html',
            controller: addUserController,
            controllerAs: 'vm'
        }
    });

addUserController.$inject = ['$scope', '$rootScope', 'userService', '$modal', '$timeout', '$modalStack', '$q', '$filter', '$document','$http', '$location'];
   function addUserController($scope, $rootScope, userService, $modal, $timeout, $modalStack, $q, $filter, $document,$http, $location){
       var vm = this;
       vm.error = false;
       $rootScope.roleInfo=$filter('orderBy')($rootScope.roleInfo, 'roleName');
       vm.exists = false;
       vm.user = $rootScope.resource.users.User;
       vm.addUserErrors = $rootScope.resource.users.viewUsers;
       vm.common = $rootScope.resource.common;
       vm.inactive = $rootScope.resource.users.User.fields.inactive.text;
       vm.api = $rootScope.config.user.api;
       $rootScope.updateRoleInfo = false;
       $rootScope.addRoleInfo = false;
       $rootScope.updateGroupInfo = false;
       $rootScope.addGroupInfo = false;
       $rootScope.updateExternalGroupInfo=false;
       vm.cancel1 = false;
       $rootScope.flag2;
       var skipval = 0;
       var time3;
       vm.users = {};
       var realmId;

       vm.addTabs = [{
           title: "Details",
           content: "directives/User/AddUser/addDetails.html"
       }, {
           title: "Roles",
           content: "directives/User/AddUser/addRoles.html"
       }];
       var limitVal;

       if ($rootScope.limit.group == "" || $rootScope.limit.group == undefined) {
           vm.limit = $rootScope.config.groupLimit.limit;
           vm.slimit = vm.limit;
           limitVal = vm.slimit;
       } else {
           vm.limit = $rootScope.limit.group;
           vm.slimit = vm.limit;
           limitVal = vm.slimit;
       }
       var userName = vm.user.loginName;
       for (var i = 0; i < $rootScope.roleInfo.length; i++) {
           $rootScope.roleInfo[i].val = false;
       }

       vm.groupGpi = $rootScope.config.group.api;
       vm.backEnd1 = $rootScope.backEnd;
       var getUrls = vm.backEnd1 + vm.groupGpi;
       var urls = getUrls;
       vm.dynamicChosenOptions = {
           width: '100%',
           allow_single_deselect: true,
           search_contains: true,
           dynamic_search: true,
           placeholder_text_single: 'Default Group',
           placeholder_text_multiple: 'Select some options'
       };
       vm.dynamicSelectedLocation = "";
       vm.dynamicLocations = [];
       vm.locations = [];
       var pageNumber = 1;
       vm.serverSimulate = function(pageNumber, searchString) {
           var results;
           results = $filter('filter')(vm.locations, searchString);
           return results;
       }
       vm.updateFn = function(pageNumber, searchString) {
           //to debounce the same searh
           var deferred = $q.defer();
           if (searchString !== '' && vm.searchString == searchString) {
               deferred.resolve('');
               return deferred.promise;
           }
           vm.searchString = searchString;
           var urls2;
           var limit = limitVal;
           var search = "?query=(name:" + searchString + ")";
           var search2 = "?limit=" + limit + "&skip=" + skipval;
           if (searchString.length <= 0) {
               skipval = Number(limitVal) + Number(skipval);
               urls2 = urls + search2;
           } else {
               urls2 = urls + search;
               vm.dynamicLocations.length = 0;
               skipval = 0;
           }

           vm.addGroupName;
           vm.defaultName;
           var promiseObj = $http.get(urls2);
           promiseObj.success(function(res, status) {
               if (pageNumber == 1)
                   vm.dynamicLocations = [];
               vm.locations.length = 0;
               angular.forEach(res.groups, function(val, ind) {
                   vm.locations.push({
                       'name': val.name,
                       'id': val.groupId
                   });
                   if (val.name == "Default Group") {
                       vm.defaultval = val.groupId;
                       vm.groupId = val.groupId;
                       vm.addGroupName = val.name;
                       vm.defaultName = val.name;
                   } else {
                       vm.groupId = val.groupId;
                       vm.addGroupName = val.name;
                   }
               });
               vm.dynamicLocations.push.apply(vm.dynamicLocations, vm.locations);

           });
           var simulateAjax;
           simulateAjax = function() {
               var fn = function() {
                   var results = vm.serverSimulate(pageNumber, searchString);
                   return deferred.resolve(results);
               };
               //The function to load data is called
               $timeout(fn, 1000);
               return deferred.promise;
           };
           simulateAjax().then(function(results) {
               if (vm.dynamicLocations.length == 0) {
                   vm.dynamicLocations.length = 0;
                   vm.dynamicLocations.push.apply(vm.dynamicLocations, results);
                   vm.dynamicLocations = vm.serverSimulate(1, "");
               }
           });
           //Send promise to chosen directive
           return deferred.promise;
       };
       pageNumber++;

       vm.addUsers = function() {
           var applications = [];
           vm.error = false;
           $rootScope.flag2 = false;
           vm.addnewspinner = true;
           for (var i = 0; i < $rootScope.userApplicationName.length; i++) {
               var res1 = ($filter)('filter')($rootScope.roleInfo, {
                   val: true,
                   applicationName: $rootScope.userApplicationName[i].id
               });
               var roleDetailsList = [];
               for (var j = 0; j < res1.length; j++) {
                   roleDetailsList.push({
                       roleId: res1[j].roleId
                   });
                   if ((($filter)('filter')(applications, {
                           applicationId: res1[j].applicationId
                       })).length == 0) {
                       applications.push({
                           applicationId: res1[j].applicationId,
                           roleDetailsList: roleDetailsList
                       });
                   }
               }
           }

           if (vm.users.dynamicSelectedLocation) {
               vm.groupId = vm.users.dynamicSelectedLocation.id;
               vm.addGroupName = vm.users.dynamicSelectedLocation.name;

           } else {
               vm.groupId = vm.defaultval;
               vm.addGroupName = vm.defaultName;
           }
           /* posting the newuserForm data*/
           var postObj = {
               loginName: vm.users.email,
               firstName: vm.users.fName,
               middleName: vm.users.mName,
               lastName: vm.users.lName,
               phoneNumber: vm.users.phone,
               group: {
                   "id": vm.groupId,
                   "name": vm.addGroupName
               },
               street: vm.users.street,
               locality: vm.users.locality,
               state: vm.users.state,
               postalCode: vm.users.postalCode,
               country: vm.users.country,
               applications: applications
           };

           var postConfig = {
               headers: {
                   'Content-Type': 'application/json'
               }
           };
           var postUrl = $rootScope.backEnd + vm.api;
           vm.addRole = true;
           $http.post(postUrl, postObj, postConfig)
               .success(function(res) {
                   vm.addnewspinner = false;
                   $scope.modalOpen.close("true");
                   $rootScope.addRoleInfo = true;
                   $rootScope.dataUser = res;
                   $rootScope.fulluserData = $scope.userData;
                   $rootScope.groupNames = vm.addGroupName;
                   $scope.modalInstance = $modal.open({
                       templateUrl: 'views/user/update.html',
                       windowClass:'modal-User',
                       windowTopClass: 'windowTopClass',
                       appendTo: $document.find('.module-container'),
                       backdrop: false,
                       controller: function($scope, $timeout, $modalStack) {
                           $scope.neww = res.loginName;
                           $scope.user = $rootScope.dataUser;
                           $scope.nameGroup = $rootScope.groupNames;
                           $scope.userData = $rootScope.fulluserData;
                           $(".modal-User").toggle();
                           $scope.func = function() {
                               $scope.time = "true";
                               $(".modal-User").toggle();
                               time3 = $scope.time;
                               $scope.usegroupName = true;
                               $scope.modalOpenedit = $modal.open({
                                   animation: false,
                                   templateUrl: 'views/user/edit-user.html',
                                   keyboard: 'true',
                                   backdrop: 'static',
                                   scope: $scope,
                                   windowClass:'modal-User',
                                   controller: function($scope) {
                                       $scope.close = function() {
                                           $scope.modalOpenedit.close("true");
                                       }
                                   }
                               });

                               $scope.modalOpenedit.result.then(function(result) {})
                           };

                       }
                   });
                   vm.time2 = $scope.time;
                   $timeout(function() {
                       if (time3 == "true") {

                       } else {
                           $scope.modalInstance.close("true");
                       }

                   }, 5000);

                   $scope.userData.push({
                       'loginName': $scope.users.email,
                       'firstName': $scope.users.fName
                   });

               })
               .error(function(err, status) {
                   if ($rootScope.isSessionExpired(status, err)) {
                       $rootScope.redirectToLogin();
                       vm.addnewspinner = false;
                   } else if (status == 400) {
                       vm.addRole = false;
                       vm.error = true;
                       vm.addnewspinner = false;

                   } else if (status == 409) {
                       vm.addRole = false;
                       vm.addnewspinner = false;
                       vm.errorMessage = vm.user.error;
                       vm.error = true;

                   } else if (status !== 0) {
                       vm.addRole = false;
                       vm.errorMessage = vm.common.fields.error;
                       vm.error = true;
                       vm.addnewspinner = false;
                   }
               });

       };

       vm.cancel = function() {
           vm.addnewspinner = false;
           $modalStack.dismissAll();
           $rootScope.flag2 = true;
           vm.cancel1 = true;
       };
       vm.close = function() {
           $scope.modalOpen.close("true");

           $rootScope.flag2 = true;
       };
       $rootScope.close1 = function() {
           $scope.modalInstance.close("true");
           $rootScope.flag2 = true;

       };

   };

