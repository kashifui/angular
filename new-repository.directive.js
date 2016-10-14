//'use strict';

angular.module('ASPEn.directives')
	.directive('stepContent', ['$compile', function ($compile) {
		return function (scope, element, attrs) {
			scope.$watch(
				function (scope) {
					return scope.$eval(attrs.stepContent);
				},
				function (value) {
					element.html(value);
					$compile(element.contents())(scope);
				}
			);
		};
	}]);

angular.module('ASPEn.directives')
	.directive('newRepository', function () {
		return {
			restrict: 'EA',
			templateUrl: 'directives/ManageRepositories/new-repository.html',
			controller: newRepositoryCtrl
		}
	});
newRepositoryCtrl.$inject = ['$scope', '$rootScope', '$http', '$timeout', '$compile', 'fsAgentConfigService', '$stateParams', '$state', 'adminService', '$filter'];
function newRepositoryCtrl($scope, $rootScope, $http, $timeout, $compile, fsAgentConfigService, $stateParams, $state, adminService, $filter) {
	adminService.loadSetup()
		.then(function () {
			$scope.repository = $scope.repository || {};
			// var validFlag=false;
			var isFinished = false;
			$scope.repository.id = $stateParams.repoId;
			$scope.repository.baseJournalingAddress = $stateParams.baseJournalingAddress;
			$scope.repository.baseSmtpRelayAddress = $stateParams.baseSmtpRelayAddress;
			$scope.repository.currentJournalingCounter = $stateParams.currentJournalingCounter;
			$scope.repository.allTypes = $rootScope.resource.repository.allTypes;
			$scope.repositoriesrows = $rootScope.getRepoRows();

			for(var i in $scope.repository.allTypes){
					$scope.repository.allTypes[i].isClosed=false;
				if(i ==0)
					$scope.repository.allTypes[i].isOpen = true
				else
					$scope.repository.allTypes[i].isOpen = false;
			}
			$scope.buildNewRepositoryWizard = function (selectedConnector) {
				var steps = [];
				// console.log($stateParams.repo);
				if (selectedConnector.type == 'Exchange') {
					var titles = $rootScope.resource.repository.email.wizardTitle;
					steps.push({
						title: titles.basic,
						content: "<repository-basic></repository-basic>"
					});
					steps.push({
						title: titles.routing,
						content: "<repository-routing></repository-routing>"
					});
					steps.push({
						title: titles.restrictions,
						content: "<repository-restrictions></repository-restrictions>"
					});
					steps.push({
						title: titles.summary,
						content: "<repository-email-summary></repository-email-summary>"
					});
				}
				else if (selectedConnector.type == 'FileSystem' || selectedConnector.type == 'Lync') {
					var titles = $rootScope.resource.repository.fileSystem.wizardTitle;
					steps.push({
						title: titles.basic,
						content: "<repository-basic></repository-basic>"
					});
					steps.push({
						title: titles.agentConfig,
						content: "<repository-agent-config></repository-agent-config>"
					});
					steps.push({
						title: titles.agent,
						content: "<repository-agent></repository-agent>"
					});
					steps.push({
						title: titles.key,
						content: "<repository-key></repository-key>"
					});
					steps.push({
						title: titles.summary,
						content: "<repository-file-summary></repository-file-summary>"
					});
				}
				else if (selectedConnector.type == 'StorageOptimizer') {
					var titles = $rootScope.resource.repository.fileSystem.wizardTitle;
					steps.push({
						title: titles.basic,
						content: "<repository-basic></repository-basic>"
					});
					steps.push({
						title: titles.key,
						content: "<repository-key></repository-key>"
					});
					steps.push({
						title: titles.summary,
						content: "<repository-file-summary></repository-file-summary>"
					});
				}
				else if (selectedConnector.type == 'SharePoint') {
					var titles = $rootScope.resource.repository.fileSystem.wizardTitle;
					steps.push({
						title: titles.basic,
						content: "<repository-basic></repository-basic>"
					});
					steps.push({
						title: titles.agent,
						content: "<repository-agent></repository-agent>"
					});
					steps.push({
						title: titles.key,
						content: "<repository-key></repository-key>"
					});
					steps.push({
						title: titles.summary,
						content: "<repository-file-summary></repository-file-summary>"
					});
				}
				else if (selectedConnector.type == 'SampleData') {
					var titles = $rootScope.resource.repository.sampleData.wizardTitle;
					steps.push({
						title: titles.basic,
						content: "<repository-basic></repository-basic>"
					});
					steps.push({
						title: titles.summary,
						content: "<repository-sample-data-summary></repository-sample-data-summary>"
					});
				}
				var counter = $scope.repository.journalingCounter;
				if (!counter) {
					counter = $scope.repository.currentJournalingCounter || 0;
					counter++;
				}
				if (counter < 1000)
					counter = ("00" + counter).slice(-3);
				$scope.repository.journalingAddress = $scope.repository.baseJournalingAddress.replace("<sequence_id>", counter);

				return steps;
			};

			var getRepositoryFromGrid = function () {

				var reps = $scope.repositoriesrows;
				for (var i in reps) {
					if (reps[i].id == $scope.repository.id) {
						return reps[i];
					}
				}
			};
			var result;
			/*	var getDataForPath = function(){
			 var getUrl = $rootScope.backEnd + $rootScope.config.repositories.api + "/" + $scope.repository.id;
			 var getConfig = {
			 url: getUrl,
			 headers: {
			 'Content-Type': 'application/json'
			 }
			 };
			 $http.get(getUrl,getConfig)
			 .success(function(res){
			 if(res != undefined){
			 result = res;
			 //console.log(result);
			 }

			 });
			 };*/

			$scope.repoButtonOptions = {};

			if ($rootScope.repositoryisEdit) {
				//   $scope.repoButtonOptions.cancelText= $rootScope.resource.retention.rules.finish;
				$scope.repoButtonOptions.alwaysShowFinish = true;
				$scope.repoButtonOptions.hideCancelOnFinish = false;
			}
			var tabHeight = function () {
				var totheight = angular.element(window).height() - angular.element('header').height();
				angular.element('.retention-rule').height(totheight - 85);
			};
			tabHeight();
			angular.element(window).resize(function () {
				tabHeight();
			});
			var tabHeight = function () {
				var totheight = angular.element(window).height() - angular.element('header').height();
				angular.element('.retention-rule').height(totheight - 85);
			};
			tabHeight();
			angular.element(window).resize(function () {
				tabHeight();
			});

			$scope.repository.data = {};
			$scope.repository.data.selectedConnector = {};
			$scope.repository.spinnerModal = false;
			$scope.repository.ipAddressTypes = $rootScope.resource.repository.email.ipAddressTypes;
			$scope.repository.ipAddressTypeIds = $rootScope.resource.repository.email.ipAddressTypeIds;
			$scope.repository.ipAddressPlaceholders = $rootScope.resource.repository.email.ipAddressPlaceholders;
			$scope.repository.types = $scope.repository.types || [];
			$scope.repository.emailTypes = $scope.repository.emailTypes || [];
			$scope.repository.filesTypes = $scope.repository.filesTypes || [];
			$scope.repository.socialTypes = $scope.repository.socialTypes || [];
			$scope.repository.sampleDataTypes = $scope.repository.sampleDataTypes || [];
			$scope.repository.typesLoaded = $scope.repository.typesLoaded || false;
			$scope.repository.weekdays = $rootScope.resource.repository.fileSystem.weekdays;
			$scope.repository.pathsTooltips = $rootScope.resource.repository.fileSystem.pathsTooltips;
			$scope.repository.pathLengthTooltips = $rootScope.resource.repository.fileSystem.pathLengthTooltips;
			$scope.repository.startTimeError = $rootScope.resource.repository.fileSystem.startTimeError;
			$scope.repository.daysOfWeekError = $rootScope.resource.repository.fileSystem.daysOfWeekError;
			$scope.repository.pathsPlaceholder = $rootScope.resource.repository.fileSystem.pathsPlaceholder;
			$scope.repository.data.isTLS = true;
			$scope.repository.data.uploadOnSave = false;
			$scope.buttonOptions = {}
			if ($scope.repository.isEdit) {
				$scope.buttonOptions.cancelText = $rootScope.resource.retention.rules.finish;
			}
			$scope.repoButtonOptions.previousEnabled = false;
			var repTypes = $rootScope.resource.repository.types;
			var myRepTypes;
			var category;
			if (!$scope.repository.typesLoaded) {
				for (var i in repTypes) {
					var rep = repTypes[i];
					for (var j in rep) {
						var subRep = rep[j];
						switch (subRep.type) {
							case "Exchange":
								myRepTypes = $scope.repository.emailTypes;
								category = "email";
								break;
							case "FileSystem":
							case "StorageOptimizer":
								myRepTypes = $scope.repository.filesTypes;
								category = "files";
								break;
							case "SharePoint":
							case "Lync":
								myRepTypes = $scope.repository.socialTypes;
								category = "social";
								break;
							case "SampleData":
								myRepTypes = $scope.repository.sampleDataTypes;
								category = "sample";
								break;
							default :
								myRepTypes = null;
								break;
						}

						if (myRepTypes) {
							myRepTypes.push({
								category: category,
								disabled: subRep.disabled,
								type: subRep.type,
								subType: subRep.subType,
								imageURL: subRep.disabled == "true" ? subRep.imageDisabledURL : subRep.imageURL,
								title: subRep.title,
								imageDisabledURL: subRep.imageDisabledURL
							});
						}
					}
				}
				$scope.repository.typesLoaded = true;
			}

			if ($scope.repository.id == 0) {
				$scope.repository.data.selectedConnector.type = $scope.repository.emailTypes[0].type;
				$scope.repository.data.selectedConnector.subType = $scope.repository.emailTypes[0].subType;
				$scope.repository.data.ipAddresses = [{type: 0, value: ""}];
				$scope.selType = $rootScope.resource.repository.allTypes[0];
				$scope.showRepoSelected = $scope.repository.emailTypes[0];
				$scope.repository.steps = $scope.buildNewRepositoryWizard($scope.repository.data.selectedConnector);
				$scope.repository.data.paths = [""];
				$scope.repository.data.validPaths = [];
				$scope.repository.data.startTime = new Date;
				$scope.repository.data.selectedDays = [];
				for (var i = 0; i < $scope.repository.weekdays.length; i++) {
					$scope.repository.data.selectedDays.push({
						name: $scope.repository.weekdays[i],
						value: true
					});
				}


			}
			else {
				var repFromGrid = getRepositoryFromGrid();
				if (repFromGrid) {
					$scope.repository.lastModified = repFromGrid.lastModified;
					$scope.repository.data.connectorName = repFromGrid.name;
					$scope.repository.data.selectedConnector.type = repFromGrid.repositoryType;
					$scope.repository.data.selectedConnector.subType = repFromGrid.repositorySubType;
					var f = ($filter)('filter')($scope.repository.allTypes, {type: repFromGrid.repositoryType});
					var p;
					if (f[0]) {
						$scope.selType= f[0];
					}
					else {
						switch (repFromGrid.repositoryType) {
							case 'Lync':
								$scope.selType = $scope.repository.allTypes[2];
								break;
							case 'StorageOptimizer':
								$scope.selType = $scope.repository.allTypes[1];
								break;
						}
					}
					for(var i in $scope.repository.allTypes){
						if( $scope.repository.allTypes[i].type == $scope.selType.type){
							$scope.repository.allTypes[i].isOpen=true;
							$scope.repository.allTypes[i].isClosed=false;
						}

						else{
							$scope.repository.allTypes[i].isOpen=false;
							$scope.repository.allTypes[i].isClosed=true;
						}

					}
					var res;
					switch($scope.selType.type){
						case 'Exchange': res= ($filter)('filter')($scope.repository.emailTypes,{subType:repFromGrid.repositorySubType})[0]
							$scope.showRepoSelected = res;
							break;
						case 'FileSystem': res= ($filter)('filter')($scope.repository.filesTypes,{subType:repFromGrid.repositorySubType})[0]
							$scope.showRepoSelected = res;
							break;
						case 'SharePoint': res= ($filter)('filter')($scope.repository.socialTypes,{subType:repFromGrid.repositorySubType})[0]
							$scope.showRepoSelected = res;
							break;
						case 'SampleData': res= ($filter)('filter')($scope.repository.sampleDataTypes,{subType:repFromGrid.repositorySubType})[0]
							$scope.showRepoSelected = res;
							break;
					}
					//   var details = JSON.parse(repFromGrid.details);
					var details = angular.copy(repFromGrid.details);
					if ($scope.repository.data.selectedConnector.type == "FileSystem" || $scope.repository.data.selectedConnector.type == "Lync") {
						if (details.agentProperties !== undefined) {
							$scope.repository.data.paths = details.agentProperties.paths;
							$scope.repository.data.startTime = fsAgentConfigService.getStartTime(details.agentProperties.cronExpression);
							$scope.repository.data.selectedDays = fsAgentConfigService.getSelectedDays(details.agentProperties.cronExpression,
								$scope.repository.weekdays);
							if (details.agentProperties.uploadOnSave !== undefined) {
								$scope.repository.data.uploadOnSave = details.agentProperties.uploadOnSave;
							}

						} else {
							$scope.repository.data.paths = [""];
							$scope.repository.data.startTime = new Date;
							$scope.repository.data.selectedDays = [];
							for (var i = 0; i < $scope.repository.weekdays.length; i++) {
								$scope.repository.data.selectedDays.push({
									name: $scope.repository.weekdays[i],
									value: true
								});
							}
						}
					}
					else if ($scope.repository.data.selectedConnector.type == "Exchange") {
						$scope.repository.journalingCounter = details.journalingCounter;
						$scope.repository.data.isTLS = details.tls;
						for (var i in details.ipAddresses) {
							details.ipAddresses[i].type = $scope.repository.ipAddressTypeIds.indexOf(details.ipAddresses[i].type);
						}
						$scope.repository.data.ipAddresses = details.ipAddresses;
					} else if ($scope.repository.data.selectedConnector.type == "SharePoint") {
						//Todo Add SharePoint specific code
					}
					else if ($scope.repository.data.selectedConnector.type == "SampleData") {
						//TODO: add sampleData code
					}
					$scope.repository.steps = $scope.buildNewRepositoryWizard($scope.repository.data.selectedConnector);
				}
			}

			$scope.selectIpAddress = function (index, type) {
				$scope.repository.data.ipAddresses[index].type = type;
			};
			//TODO: change this method call (getDataForPath) once figure out the problem
			//if($scope.repository.id > 0 && isFinished)
			//getDataForPath();
			var buildPostData = function (selectedConnector) {
				var postData = {};
				var postDetails = {};
				var ipAddresses;
				var cronExpression;

				if (selectedConnector.type == "Exchange") {
					ipAddresses = JSON.parse(JSON.stringify($scope.repository.data.ipAddresses));
					for (var i in ipAddresses)
						ipAddresses[i].type = $scope.repository.ipAddressTypeIds[ipAddresses[i].type];
				} else if (selectedConnector.type == "FileSystem" || selectedConnector.type == "Lync") {
					cronExpression = fsAgentConfigService.createCronExpression($scope.repository.data.startTime, $scope.repository.data.selectedDays);
				} else if (selectedConnector.type == "SharePoint") {
					//Todo Add SharePoint specific code
				}


				// $scope.repository.id == 0 when the repository is being saved for the first time
				if ($scope.repository.id == 0) {
					postData.name = $scope.repository.data.connectorName;
					postData.active = true;
					postData.repositoryType = selectedConnector.type;
					postData.repositorySubType = selectedConnector.subType;
					if (selectedConnector.type == "Exchange") {
						postDetails = {};
						postDetails.tls = $scope.repository.data.isTLS;
						postDetails.ipAddresses = ipAddresses;
						postData.details = angular.copy(postDetails);
					} else if (selectedConnector.type == "FileSystem" || selectedConnector.type == "Lync") {
						postDetails = {};
						if (!postData.hasOwnProperty('agentProperties')) {
							postDetails.agentProperties = {};
						}
						postDetails.agentProperties.uploadOnSave = $scope.repository.data.uploadOnSave;
						postDetails.agentProperties.configVisited = true;
						postDetails.agentProperties.paths = $scope.repository.data.paths;
						postDetails.agentProperties.cronExpression = cronExpression;

						postData.details = angular.copy(postDetails);
					} else if (selectedConnector.type == "SharePoint") {
						//Todo Add SharePoint specific code
					}
					else if ($scope.repository.data.selectedConnector.type == "SampleData") {
						//TODO:Add sampledata code
					}
				} else {
					// populate postData only if the data is modified in the current step
					if ($scope.repository.connectorNameModified) {
						postData.name = $scope.repository.data.connectorName;
					}
					if (selectedConnector.type == "FileSystem" || selectedConnector.type == "Lync") {
						var repFromGrid = getRepositoryFromGrid();
						if (repFromGrid != undefined) {
							var details = angular.copy(repFromGrid.details);

							if (details.agentProperties !== undefined) { //for existing repository

								/*if(result !=undefined){
								 if (!angular.equals(result.details.agentProperties.paths, $scope.repository.data.paths)) {
								 */
								if (!angular.equals(details.agentProperties.paths, $scope.repository.data.paths)) {
									if (!postDetails.hasOwnProperty('agentProperties')) {
										postDetails.agentProperties = {};
									}
									postDetails.agentProperties.paths = $scope.repository.data.paths;
								}
								//}


								if (details.agentProperties.cronExpression !== cronExpression) {
									if (!postDetails.hasOwnProperty('agentProperties')) {
										postDetails.agentProperties = {};
									}
									postDetails.agentProperties.cronExpression = cronExpression;
								}
								if (details.agentProperties.uploadOnSave !== undefined) {
									if (details.agentProperties.uploadOnSave !== $scope.repository.data.uploadOnSave || details.agentProperties.uploadOnSave === true) {
										if (!postDetails.hasOwnProperty('agentProperties')) {
											postDetails.agentProperties = {};
										}
										postDetails.agentProperties.uploadOnSave = $scope.repository.data.uploadOnSave;
										postDetails.agentProperties.configVisited = true;
									}
								}
								/*else{
								 if (!postData.hasOwnProperty('agentProperties')) {
								 postDetails.agentProperties = {};
								 }
								 postDetails.agentProperties.uploadOnSave = $scope.repository.data.uploadOnSave;
								 postDetails.agentProperties.configVisited = true;
								 }*/
								if (!jQuery.isEmptyObject(postDetails))
									postData.details = angular.copy(postDetails);
							}

							else {
								if (!postDetails.hasOwnProperty('agentProperties')) {
									postDetails.agentProperties = {};
								}
								postDetails.agentProperties.paths = $scope.repository.data.paths;
								postDetails.agentProperties.cronExpression = cronExpression;
							}
							if (!jQuery.isEmptyObject(postDetails))
								postData.details = angular.copy(postDetails);
						}
						else {
							if (!postDetails.hasOwnProperty('agentProperties')) {
								postDetails.agentProperties = {};
							}
							postDetails.agentProperties.uploadOnSave = $scope.repository.data.uploadOnSave;
							postDetails.agentProperties.configVisited = true;
							postDetails.agentProperties.paths = $scope.repository.data.paths;
							postDetails.agentProperties.cronExpression = cronExpression;

							if (!jQuery.isEmptyObject(postDetails))
								postData.details = angular.copy(postDetails);
						}
					}
					else if (selectedConnector.type == "Exchange") {
						repFromGrid = getRepositoryFromGrid();
						if (repFromGrid != undefined) {
							// details = JSON.parse(repFromGrid.details);
							details = (repFromGrid.details);
							//  postDetails={}
							if (!angular.equals(details.ipAddresses, ipAddresses)) {
								postDetails.ipAddresses = ipAddresses;
							}
							if (details.tls != $scope.repository.data.isTLS) {
								postDetails.tls = $scope.repository.data.isTLS;
							}
							postDetails.ipAddresses = ipAddresses;
							if (!jQuery.isEmptyObject(postDetails))
								postData.details = postDetails;
						}
						else {
							if ($scope.repository.isTLSValidModified) {
								postDetails.tls = $scope.repository.data.isTLS;
							}
							postDetails.ipAddresses = ipAddresses;
							postData.details = postDetails;
							if (!jQuery.isEmptyObject(postDetails))
								postData.details = postDetails;
						}

					} else if (selectedConnector.type == "SharePoint") {
						var repFromGrid = getRepositoryFromGrid();
						//Todo Add SharePoint specific code
					}
					else if ($scope.repository.data.selectedConnector.type == "SampleData") {
						//TODO: add sampleData code
					}
					if (!jQuery.isEmptyObject(postData.name) || !jQuery.isEmptyObject(postData.details)) {
						postData.lastModified = $scope.repository.lastModified;
					}
				}

				return postData;
			};

			$scope.saveRepository = function (step) {
				$scope.repository.hasError = false;
				var postData = buildPostData($scope.repository.data.selectedConnector);
				//console.log(angular.toJson(postData));
				// if postData is empty then you are in edit mode and the data in the current step is not modified
				if (jQuery.isEmptyObject(postData)) {
					//console.log("edit");
					//download if it is an agent or key step
					if (step == 'agent' || step == 'key') {
						$scope.repoButtonOptions.hideCancelOnFinish = false;
						$scope.repository.downloadUrl = $rootScope.backEnd + $rootScope.config.repositories.api + "/" + $scope.repository.id + "/agent/download";
						$timeout(function () {
							angular.element('#download-' + step).trigger('click');
						});
					}
					else
						$state.go('main.repositories.manage');
					// $scope.newRepoModal.close("true");
					return;
				}
				var postUrl = $rootScope.backEnd + $rootScope.config.repositories.api;
				var postMethod = "POST";
				if ($scope.repository.id > 0) {
					postMethod = "PUT";
					postUrl = postUrl + "/" + $scope.repository.id;
				}
				var postConfig = {
					method: postMethod,
					url: postUrl,
					headers: {
						'Content-Type': 'application/json'
					},
					data: postData
				};

				$scope.repository.spinnerModal = true;
				$scope.repoButtonOptions.finishEnabled = false;
				$scope.repoButtonOptions.previousEnabled = false;

				var ingestSampleData = function (id) {
					var config = {
						headers: {
							'Content-Type': 'application/json;'
						}
					};
					$http.get($rootScope.backEnd + $rootScope.config.sampleData.api + $rootScope.config.sampleData.list, config)
						.success(function (res) {
							var datasetId;
							for (var i in res) {
								if (res[i].name == $scope.repository.data.selectedConnector.subType) {
									datasetId = res[i].id;
								}
							}
							var obj = {
								"tenantInfo": {
									"tenantId": $rootScope.loggedUser.realmId
								},
								"datasets": [datasetId],
								"metadata": {
									"REPOSITORY_TYPE": $scope.repository.data.selectedConnector.type,
									"REPOSITORY_ID": id,
									"REPOSITORY_SUB_TYPE": $scope.repository.data.selectedConnector.subType
								}
							};
							$http.post($rootScope.backEnd + $rootScope.config.sampleData.api + $rootScope.config.sampleData.ingest, obj, config)
								.success(function (res) {
								})
								.error(function (err, status) {
								});
						})
						.error(function (err, status) {
						});
				};
				//$scope.filters = {};
				//$scope.filters.options = [];
				$http(postConfig)
					.success(function (res) {
						$scope.repository.spinnerModal = false;
						$scope.repoButtonOptions.finishEnabled = true;
						$scope.repoButtonOptions.previousEnabled = true;
						if (step == 'agent' || step == 'key') {
							$scope.repoButtonOptions.hideCancelOnFinish = false;
							$timeout(function () {
								angular.element('#download-' + step).trigger('click');
							});
						}
						if ($scope.repository.id > 0) {
							var repFromGrid = getRepositoryFromGrid();
							if (repFromGrid) {
								repFromGrid.name = $scope.repository.data.connectorName;
								repFromGrid.lastModified = res.lastModified;
								repFromGrid.details = res.details;
							}
						} else {
							if (res.repositoryType == 'SampleData') {
								ingestSampleData(res.id);
							}
							if (res.repositoryType == 'Exchange') {
								//var details = JSON.parse(res.details);
								var details = (res.details);
								$scope.repository.journalingAddress = $scope.repository.baseJournalingAddress.replace("<sequence_id>", "00" + details.journalingCounter);
								// console.log($scope.repository.baseJournalingAddress.replace("<sequence_id>",  details.journalingCounter));
								$scope.repository.currentJournalingCounter = details.journalingCounter;
							}
						}
						$scope.repository.id = res.id;
						$scope.repository.lastModified = res.lastModified;
						$scope.repository.connectorNameModified = false;
						$scope.repository.isTLSValidModified = false;
						$scope.repository.downloadUrl = $rootScope.backEnd + $rootScope.config.repositories.api + "/" + $scope.repository.id + "/agent/download";
						$http.get($rootScope.backEnd + $rootScope.config.repositories.api)
							.success(function (res) {
								$rootScope.repositories = res.repositories;
							});
						//   $scope.newRepoModal.close("true");
						if (isFinished) {
							$state.go('main.repositories.manage');
						}
					})
					.error(function (err, status) {
						$scope.repository.spinnerModal = false;
						$scope.repoButtonOptions.finishEnabled = true;
						$scope.repoButtonOptions.previousEnabled = true;
						if ($rootScope.isSessionExpired(status, err)) {
							$rootScope.redirectToLogin();
						}
						$scope.repository.hasError = true;
						$scope.repository.errorMessage = $rootScope.resource.repositories.errorSave + ' (' + status + ')';
					});
			};

			$scope.checkName = function () {
				$scope.repository.connectorNameValid = $scope.newRepositoryForm.connectorName.$valid;
				$scope.repository.connectorNameExists = false;
				// validFlag= true;
				if ($scope.repository.connectorNameValid) {
					var reps = $scope.repositoriesrows;
					for (var i in reps) {
						if (reps[i].id != $scope.repository.id && reps[i].name.toUpperCase() == $scope.repository.data.connectorName.toUpperCase()) {
							$scope.repository.connectorNameExists = true;
							// validFlag= !$scope.repository.connectorNameExists;
							break;
						}
					}
				}
			};

			var validateRepository = function (from, to) {
				var valid = true;
				var selectedConnectorType = $scope.repository.data.selectedConnector.type;
				//console.log(from);
				switch (from) {
					case 0 :
						$scope.checkName();
						valid = $scope.repository.connectorNameValid && !$scope.repository.connectorNameExists;
						break;
					case 1 :
						if (selectedConnectorType == "Exchange" && to > from) {
							$scope.repository.isTLSValid = $scope.newRepositoryForm.isTLS.$valid
							valid = $scope.repository.isTLSValid;
						} else if ((selectedConnectorType == "FileSystem" || selectedConnectorType == "Lync") && to > from) {
							valid = fsAgentConfigService.validatePaths($scope.repository.data.paths
									, $scope.repository.data.validPaths)
								&& fsAgentConfigService.validateDate($scope.repository.data.startTime) && fsAgentConfigService.validateSelectedDays($scope.repository.data.selectedDays);

						}
						break;
					case 2 :
						if (selectedConnectorType == "Exchange" && to > from) {
							valid = validateIPAddresses();
						}
						break;
				}
				//  validFlag=valid;
				return valid;
			};

			$scope.validateStep = function (from, to) {
				var valid = true;
				var selectedConnectorType = $scope.repository.data.selectedConnector.type;
				if (validateRepository(from, to)) {
					if (from >= 0 && to != 0)
						$scope.repoButtonOptions.previousEnabled = true;
					else
						$scope.repoButtonOptions.previousEnabled = false;

					if (selectedConnectorType == "Exchange") {
						if ((from == 2 && to == 3) && ($scope.repository.id == 0)) {
							$scope.saveRepository(from);
							$scope.repoButtonOptions.hideCancelOnFinish = false;
						}
					}
					else if (selectedConnectorType == 'FileSystem' || selectedConnectorType == 'Lync') {
						if ((from == 3 && to == 4) && ($scope.repository.id == 0 )) {
							$scope.saveRepository(null);
							$scope.repoButtonOptions.hideCancelOnFinish = false;
						}
					}
					if (selectedConnectorType == 'StorageOptimizer') {
						if ((from == 1 && to == 2) && ($scope.repository.id == 0 )) {
							$scope.saveRepository(null);
							$scope.repoButtonOptions.hideCancelOnFinish = false;
						}
					}
					if (selectedConnectorType == 'SharePoint') {
						if ((from == 2 && to == 3) && ($scope.repository.id == 0)) {
							$scope.saveRepository(null);
							$scope.repoButtonOptions.hideCancelOnFinish = false;
						}
					}
				} else {
					return false;
				}
				return valid;
			};

			$scope.credentials = {};

			var validateIPAddresses = function () {
				var valid = true;
				var ipAddresses = $scope.repository.data.ipAddresses;
				for (var i in ipAddresses) {
					if ($scope.repository.data.selectedConnector.subType == 'ExchangeOffice365' && ipAddresses[i].value == "") {
						break;
					}
					var isvalidIP = $scope.validateIPAdddress(ipAddresses[i]);
					$scope.repository.data.ipAddressesValid[i] = isvalidIP;
					valid = valid ? isvalidIP : valid;

				}
				//  validFlag=valid;
				return valid;
			};

			$scope.validateIPAdddress = function (ipAddress) {
				var regex;
				switch (ipAddress.type) {
					case 0 :
						regex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
						break;
					case 1 :
						regex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(2[4-9]|3[0-2]))$/;
						break;
					case 2 :
						regex = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
						break;
					case 3 :
						regex = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*(\/(12[0-8]))$/;
						break;
				}
				// validFlag= regex.test(ipAddress.value);
				if ($scope.repository.data.selectedConnector.subType == 'ExchangeOffice365' && ipAddress.value == '')
					return true;
				return regex.test(ipAddress.value);
			};

			$scope.validatePath = fsAgentConfigService.validatePath;
			$scope.validateSelectedDays = fsAgentConfigService.validateSelectedDays;
			$scope.validateDate = fsAgentConfigService.validateDate;

			$scope.wizardComplete = function (from, to) {
				$scope.saveRepository(null);
				isFinished = true;
			};

			$scope.wizardCanceled = function () {
				$state.go('main.repositories.manage');
			};
			$scope.addIpAddress = function () {
				$scope.repository.data.ipAddresses.push({type: 0, value: ""});
			};
			$scope.removeIpAddress = function (index) {
				$scope.repository.data.ipAddresses.splice(index, 1);
			};
			$scope.addPath = function () {
				$scope.repository.data.paths.push("");
			};
			$scope.removePath = function (index) {
				$scope.repository.data.paths.splice(index, 1);
			}
			$scope.selected = function (type) {
				if($scope.repository.id ==0)
					$scope.selType = type;
				/*switch($scope.selType.type){
				 case 'Exchange':	$scope.repository.data.selectedConnector.type = $scope.repository.emailTypes[0].type;
				 $scope.repository.data.selectedConnector.subType = $scope.repository.emailTypes[0].subType;
				 break;
				 case 'FileSystem':	$scope.repository.data.selectedConnector.type = $scope.repository.filesTypes[0].type;
				 $scope.repository.data.selectedConnector.subType = $scope.repository.filesTypes[0].subType;
				 break;
				 case 'SharePoint':	$scope.repository.data.selectedConnector.type = $scope.repository.socialTypes[0].type;
				 $scope.repository.data.selectedConnector.subType = $scope.repository.socialTypes[0].subType;
				 break;
				 case 'SampleData': 	$scope.repository.data.selectedConnector.type = $scope.repository.sampleDataTypes[0].type;
				 $scope.repository.data.selectedConnector.subType = $scope.repository.sampleDataTypes[0].subType;
				 break
				 }
				 $scope.repository.steps = $scope.buildNewRepositoryWizard($scope.repository.data.selectedConnector);*/
			}
			$scope.selectRepo = function (type) {
				if($scope.repository.id == 0){
					$scope.showRepoSelected = type;
					$scope.repository.data.selectedConnector.type = type.type;
					$scope.repository.data.selectedConnector.subType = type.subType;
					$scope.repository.steps = $scope.buildNewRepositoryWizard($scope.repository.data.selectedConnector);
				}

			}

			$scope.checkType = function(type){
				if($scope.showRepoSelected.type == type)
					return true;
				else{
					switch($scope.showRepoSelected.type){
						case 'Lync':
							if(type == 'SharePoint')
							return true;
							break;
						case 'StorageOptimizer':
							if(type == 'FileSystem')
								return true;
					}
					return false;
				}

			}
		});

};
