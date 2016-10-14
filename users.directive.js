'use strict';
angular.module('ASPEn.directives')
	.directive('user', function() {
		return {
			restrict: 'EA',
			templateUrl: 'directives/User/user.html',
			controller: userController,
			controllerAs: 'vm'
		}
	});
userController.$inject = ['$scope', '$modal', '$rootScope', '$timeout', '$filter', '$state', '$q', 'safeTimeout', '$http', 'permissionsService', 'adminService'];

function userController($scope, $modal, $rootScope, $timeout, $filter, $state, $q, safeTimeout, $http, permissionsService, adminService) {
	var vm = this;
	function tabHeight() {
		console.log('tabheigh');
		var totheight = angular.element(window).height() - angular.element('header').height();
		angular.element('.user-table').height(totheight - 75);
		$(".user-table").css("overflow", "hidden");
	}

	tabHeight();
	angular.element(window).resize(function() {
		tabHeight();

	});
	var safeTimeoutInstance = safeTimeout.create($scope);
	var userDefaultSize;
	var skipval = 0;
	var limitVal = 0;
	vm.skipval = 0;
	var count;
	var postUrl = $rootScope.backEnd + $rootScope.config.group.api;
	var lastCalled ="";
	var lastCalled1 ="";
	var userDefaultSize = vm.slimit;
	var postConfig = {
		headers: {
			'Content-Type': 'application/json'
		}
	};
	if ($rootScope.limit.user == "" || $rootScope.limit.user == undefined) {
		vm.limit = $rootScope.config.limit.user;
		vm.slimit = vm.limit;
		limitVal = vm.slimit;
	} else {
		vm.limit = $rootScope.limit.user;
		vm.slimit = vm.limit;
		limitVal = vm.slimit;
	}
	vm.infiniteScrollbarConfig = {
		autoReinitialise: true,
		autoReinitialiseDelay: 0,
		enableKeyboardNavigation: true
	};
	vm.pageSize = limitVal;
	vm.scrollPosition = 95;
	vm.containerId = 'user-container';
	vm.itemTemplate = 'directives/User/userTemplate.html';
	vm.loadMoreButton = {
		show: false
	};
	vm.windowScroll = false;
	vm.urlDefined = '';

	//var initializing = true;
	//$scope.sortBy ="LastName:asc";
	vm.sortBy = $rootScope.resource.users.viewUsers.sortOptions[0].text;
	var getUrl, newUrl;
	//var users=[];
	var search;
	var indexer = 0;
	$scope.userData = [];
	vm.userData2 = [];
	var realmId;
	$rootScope.temp = [];
	$rootScope.$watch('loggedUser', function() {
		if ($rootScope.loggedUser) {
			realmId = $rootScope.loggedUser.realmId;
			vm.systemName = 'SystemUser@' + realmId;
			var r = [];
			var appName;
			var getCustomerUrl = $rootScope.backEnd + $rootScope.config.getCustomerInfo.api + $rootScope.config.getCustomerInfo.roles;
			$http.get(getCustomerUrl, postConfig)
				.success(function(res, status) {

					$rootScope.RoleData = res.applications;
					console.log($rootScope.RoleData);
					$rootScope.minPriority = res.applications[0].roles[0].rolePriority;
					for (var i = 0; i < res.applications.length; i++) {
						var roles = res.applications[i].roles;
						for (var j = 0; j < roles.length; j++) {
							if (roles[j].rolePriority != 1) {
								//----find the lowest priority role------//
								if (parseInt(roles[j].rolePriority) < parseInt($rootScope.minPriority))
									$rootScope.minPriority = roles[j].rolePriority;
								//----- store all the application names -----//


								var breakP = false;
								for (var t in vm.otherRoles) {
									if (res.applications[i].name == t) {

										var f2 = $filter('filter')($rootScope.userApplicationName, {
											id: t
										});
										if (f2.length == 0) {
											$rootScope.userApplicationName.push({
												name: vm.otherRoles[t],
												id: t
											});
											appName = t;
										}

										breakP = true;
										break;
									}
								}
								if (!breakP) {
									var f1 = $filter('filter')($rootScope.userApplicationName, {
										id: res.applications[i].name
									});
									if (f1.length == 0) {
										$rootScope.userApplicationName.push({
											name: res.applications[i].name,
											id: res.applications[i].name
										});
										appName = res.applications[i].name;
									}
								}

								$rootScope.$broadcast('rolesAdded');
								console.log('$rootScope.userApplicationName',$rootScope.userApplicationName);

								//----store all the role info -----//
								var found = $filter('filter')($rootScope.roleInfo, {
									roleId: roles[j].roleId
								});
								if (found.length == 0)
									$rootScope.roleInfo.push({
										roleId: roles[j].roleId,
										roleName: roles[j].roleName,
										applicationId: roles[j].applicationId,
										applicationName: appName,
										rolePriority: roles[j].rolePriority,
										val: false,
										groupVal: false
									});
							}
						}
					}


				})

				.error(function(err, status) {
					if ($rootScope.isSessionExpired(status, err)) {
						$rootScope.redirectToLogin();
						vm.spinner = false;
					}
					permissionsService.redirectCheck();
				});
			console.log('$rootScope.roleInfo',$rootScope.roleInfo);
		}
	});

	vm.pageFunction = function(pageNumber, pageSize, query) {
		console.log('page function called');
		if (pageNumber <= 0)
			$rootScope.temp.length = 0;

		$scope.users = [];
		vm.tempUser = [];
		search = query;
		var skip = (pageNumber * pageSize);
		query = $.trim(query);
		//create a deferred object
		var defer = $q.defer();
		//newUrl = getUrl + "?sort=(" + param + ":asc)" + "&limit=" + limitVal + "&skip=" + skipval;
		getUrl = $rootScope.backEnd + $rootScope.config.user.api;
		if (!query) {
			$scope.userData.length = 0;
			newUrl = getUrl + "?sort=(" + vm.sortBy + ")" + "&limit=" + vm.pageSize + "&skip=" + skip;
		lastCalled=newUrl;
		} else {
			$scope.userData.length = 0;
			newUrl = getUrl + "?query=(search:" + query + ")" + "&limit=" + vm.pageSize + "&skip=" + skip;
			lastCalled=newUrl;
		}
		if (query && indexer == 1) {
			newUrl = getUrl + "?query=(search:" + query + ")" + "&sort=(" + vm.sortBy + ")" + "&limit=" + vm.pageSize + "&skip=" + skip;
			lastCalled=newUrl;
		}
		vm.spinner = true;
		if(lastCalled !== lastCalled1) {
			$http.get(newUrl).success(function (res, status) {
				lastCalled1 = newUrl;
				if (pageNumber == 0)
					count = res.totalCount;
				//count = res.totalCount;
				var i, j, t, flag;
				if (res.totalCount != 0)
					vm.totalNumberOfUsers = res.totalCount;

				$rootScope.user1 = $scope.userData;

				if (count != 0)
					vm.totalNumberOfGroups = count;
				else {
					vm.totalNumberOfGroups = 0;
					angular.element('#noExternalShow').html($rootScope.resource.reports.noData);
				}

				$scope.userData = $scope.userData.concat(res.users);
				for (var i = 0; i < res.count; i++) {
					var loginName = res.users[i].loginName;
					var firstName = res.users[i].firstName;
					var lastName = res.users[i].lastName;
					var groupName = res.users[i].group.name;
					var phoneNumber = res.users[i].phoneNumber;
					var version = res.users[i].version;
					var userId = res.users[i].userId;
					var groupId = res.users[i].group.id;
					var applications = res.users[i].applications;
					if (res.users[i].scimRepresentation !== undefined) {
						var scimRepresentation = res.users[i].scimRepresentation.active;
						var extgroups = res.users[i].scimRepresentation.groups;
					}

					$scope.users.push({
						loginName: loginName,
						firstName: firstName,
						lastName: lastName,
						groupName: groupName,
						phoneNumber: phoneNumber,
						version: version,
						userId: userId,
						groupId: groupId,
						applications: applications,
						scimRepresentation: scimRepresentation,
						extgroups: extgroups,
						/**email: nameToEmail(name),
						 department: departments[Math.floor(Math.random() * 6)],**/
						panel: {
							title: lastName + ' ' + firstName,
							main: "directives/User/preview.html",
							top: 122,
							reference: '.navbar-static-top',
							scope: $scope,
							animate: true
						},
						index: vm.index++,


						apply: function (user, index) {
							vm.currentUser = user;
							vm.currentUser.objectId = user.userId;
							vm.currentUser.roles = [];
							vm.currentUser.externalGroups = [];
							vm.isExternalUser = (user.scimRepresentation != null);
							if (user.scimRepresentation != null) {
								if (user.scimRepresentation.groups != null) {
									for (var g in user.scimRepresentation.groups) {
										var temp = user.scimRepresentation.groups[g].display.split(',')[0];
										if (temp.indexOf('CN=') >= 0)
											vm.currentUser.externalGroups.push({
												name: temp.split('CN=')[1],
												tooltip: user.scimRepresentation.groups[g].display
											});
										else
											vm.currentUser.externalGroups.push({
												name: user.scimRepresentation.groups[g].display,
												tooltip: user.scimRepresentation.groups[g].display
											});
									}
									if (vm.currentUser.externalGroups.length == 3) {
										vm.currentUser.moreExternalGroups = true;
									}
								}

							}
							for (var i in user.applications) {
								for (var j in user.applications[i].roleDetailsList) {
									if (vm.currentUser.roles.length == 3) {
										vm.currentUser.moreRoles = true;
										break;
									}
									var name = user.applications[i].roleDetailsList[j].roleName;
									if (name != 'Base')
										vm.currentUser.roles.push(name);
								}
							}
							if (vm.currentUser.groupRoles == null) {
								vm.currentUser.loading = true;
								vm.currentUser.groupRoles = [];
								$http.get(postUrl + "/" + vm.currentUser.groupId)
									.success(function (res) {
										vm.error = false;
										for (var i in res.applications) {
											for (var j in res.applications[i].roleDetailsList) {
												if (vm.currentUser.groupRoles.length == 3) {
													vm.currentUser.moreGroupRoles = true;
													break;
												}
												var name = res.applications[i].roleDetailsList[j].roleName;
												if (name != 'Base')
													vm.currentUser.groupRoles.push(name);
											}
										}
										vm.currentUser.loading = false;
										vm.currentUser.success = true;
									})
									.error(function (err, status) {
										if ($rootScope.isSessionExpired(status, err)) {
											$rootScope.redirectToLogin();
										}
										vm.currentUser.loading = false;
										vm.currentUser.success = false;
									});
							}
						}
					});
					console.log('users',$scope.users);


				}
				console.log("310", $scope.users);
				$rootScope.temp = [].concat($rootScope.temp, $scope.users);

				defer.resolve($scope.users);
				vm.spinner = false;

			});

			return defer.promise;
		}
	};

	adminService.loadSetup()
		.then(function() {
			vm.error = false;
			$rootScope.updateR = $rootScope.resource.userUpdates;
			vm.sortbyvalues = $rootScope.resource.users.viewUsers.sortOptions2;
			vm.sortOptions = $rootScope.resource.users.viewUsers.sortOptions;
			vm.sortby = $rootScope.resource.users.viewUsers.sortBy.text;
			vm.find = $rootScope.resource.users.viewUsers.findBy.text;
			vm.otherRoles = $rootScope.resource.otherRoles;
			vm.sortUserDefault = vm.sortbyvalues[0].text;
			vm.sortindex = vm.sortUserDefault.indexOf(vm.sortbyvalues[0].text);
			vm.selectedIndex = 0;
			vm.selectedIndex1 = 0;
			vm.deleteLoggedUser = false;
			//var postUrl = $rootScope.backEnd + $rootScope.config.group.api;
			vm.findUserClick = function(option, index) {
				vm.selectedIndex1 = index;
				vm.optUser = option.text;
				vm.findUserDefault = vm.optUser;
			};
			//$scope.tempData=[{'loginName':'scimData','scimRepresentation':{'test':'test'},'lastName':'lastname'},{'loginName':'notScimData','lastName':'def'}];
			$rootScope.defaultRoles = [];
			$rootScope.roleInfo = [];
			$rootScope.userApplicationName = [];
			vm.sortdropClick = function(option, ind) {
				vm.selectedIndex = ind;
				vm.sortUser = option.text;
				vm.sortUserDefault = vm.sortUser;
				var paramVal = vm.sortUser;
				var param = paramVal.replace(/ /g, "");
				indexer = 1;
				switch (ind) {
					case 0:
						vm.sortBy = vm.sortOptions[0].text;
						break;
					case 1:
						vm.sortBy = vm.sortOptions[1].text;
						break;
					case 2:
						vm.sortBy = vm.sortOptions[2].text;
						break;
					case 3:
						vm.sortBy = vm.sortOptions[3].text;
						break;
				}
				if (!angular.isDefined(vm.findUser)) {
					vm.findUser = "";
					return;
				}
				vm.findUser = vm.findUser + " ";
			}

			vm.error = false;
			vm.exists = false;

			vm.findSearch = function() {
				limitVal = vm.limit;
			};
			vm.findme = function() {};
			//var count;
			$scope.$watch('findUser', function(val) {
				if (val) {
					vm.SortOption = false;
					vm.spinner = true;
					$scope.userData.length = 0;
					//skipval=0;
					//loadData('x', val);
				} else if (val == "") {
					vm.SortOption = false;
					$scope.userData.length = 0;
					skipval = 0;
					//loadData("x", undefined, limitVal, skipval);
				}

			})


			var limitVal, skipval;
			var userDefaultSize;
			vm.skipval = 0;
			userDefaultSize = vm.slimit;
			if ($rootScope.limit.user == "" || $rootScope.limit.user == undefined) {
				vm.limit = $rootScope.config.limit.user;
				vm.slimit = vm.limit;
				limitVal = vm.slimit;
			} else {
				vm.limit = $rootScope.limit.user;
				vm.slimit = vm.limit;
				limitVal = vm.slimit;
			}


			vm.fulldataVal;
			$scope.$on('fullData', function(org, data) {
				vm.fulldataVal = data.length;
			});
			var limitupdate = userDefaultSize;
			vm.isScroll = false;


			//skipval=0;
			vm.showMore = function(checkScrolldown) {

				if (checkScrolldown == true) {
					vm.isScroll = true;
					limitVal = vm.limit;
					if (Number(skipval) < count && vm.totalNumberOfUsers >= limitVal) {
						vm.spinner = true;
						skipval = Number(skipval) + Number(limitVal);
						loadData('x', undefined, limitVal, skipval);
					}
				}

			};
			vm.api = $rootScope.config.user.api;
			$timeout(function() {
				vm.backEnd1 = $rootScope.backEnd;
			}, 10);
			var getUrl;
			var flag = true;
			var postConfig = {
				headers: {
					'Content-Type': 'application/json'
				}
			};
			var newUrl = "";
			$timeout(function() {
				limitVal = vm.limit;
				skipval = 0;

			}, 100);
			$scope.$on('getRoleInfo', function() {});

			// add new user modal
			vm.openModal = function() {
				$scope.modalOpen = $modal.open({
					animation: false,
					templateUrl: 'views/user/new-user.html',
					keyboard: 'true',
					scope: $scope,
					backdrop: 'static'
				});
				$scope.modalOpen.result.then(function(result) {
					//$scope.modalOpen.close("true");
					if ($scope.flag1 == true) {
						$scope.addnewspinner = false;
						skipval = 0;
					}
					if (!$scope.findUser || $scope.findUser == "") {
						$scope.findUser = " ";
					} else {
						$scope.findUser = "";
					}
					$scope.totalNumberOfUsers += 1;
				})
			};

			// import users modal
			vm.importUsers = function() {
				$scope.modalOpen = $modal.open({
					animation: false,
					templateUrl: 'views/user/import-users.html',
					keyboard: 'true',
					scope: $scope,
					backdrop: 'static'
				});
				$scope.modalOpen.result.then(function(result) {
					$scope.addnewspinner = false;
					if (!$scope.findUser || $scope.findUser == "") {
						$scope.findUser = " ";
					} else {
						$scope.findUser = "";
					}

					// loadData();
				})
			};

			$rootScope.userPanel = {};
			//edit users click
			vm.usersClick = function(user, $index, from) {
				//alert("hi");
				console.log(user,"user::");
				$rootScope.userPanel.details = (from == 'details') ? true : false;
				$rootScope.userPanel.externalGroups = (from == 'external') ? true : false;
				$rootScope.userPanel.userRoles = (from == 'user') ? true : false;
				$rootScope.userPanel.groupRoles = (from == 'group') ? true : false;
				$scope.editmodalOpen = $modal.open({
					templateUrl: 'views/user/edit-user.html',
					scope: $scope,
					backdrop: 'static',
					resolve: {
						user: function() {
							return user;
						},
						getIndex: function() {
							return $index;
						},
						externalUser: function() {
							return user.scimRepresentation != null;
						}
					},
					controller: function($scope, user, getIndex, externalUser) {

						$scope.user = user;
						$scope.indexVal = getIndex;
						$rootScope.selval = user;
						$scope.isExternalUser = externalUser;
					}
				});
				$scope.editmodalOpen.result.then(function(result) {
					console.log(result,"result:");
					$scope.editmodalOpen.close("true");
					$scope.spinner = false;
					if (!$scope.findUser || $scope.findUser == "") {
						$scope.findUser = " ";

					} else {

						$scope.findUser = "";
					}
				});
			};


			//delete users
			vm.deleteUser = deleteUser;

			function deleteUser(user) {
				vm.spinner = false;
				if (user.userId != $rootScope.loggedUser.userId && user.scimRepresentation == null) {
					$scope.deleteUserInfo = user;
					$scope.confirmModal = $modal.open({
						animation: false,
						backdrop: 'static',
						templateUrl: 'views/user/confirm.html',
						keyboard: 'true',
						scope: $scope
					});
					$scope.confirmModal.result.then(function(resp) {
						//vm.spinner = true;
					})
				}

			}



			$scope.confirmOk = confirmOk;

			function confirmOk() {
				vm.spinner = true;

				$http.delete($rootScope.backEnd + $rootScope.config.user.api + "/" + $scope.deleteUserInfo.userId, postConfig)
					.success(function(res, status) {
						vm.spinner = false;
						$scope.confirmModal.close("true");
						if (!vm.findUser || vm.findUser == "") {
							vm.findUser = " ";
						} else {
							vm.findUser = "";
						}
					})
					.error(function(err, status) {
						if ($rootScope.isSessionExpired(status, err)) {
							$rootScope.redirectToLogin();
						}
						vm.spinner = false;
					});
			};
			$scope.confirmCancel = confirmCancel;

			function confirmCancel() {
				$scope.confirmModal.dismiss("cancel");
			};
		});

	vm.checkTooltip = function(user) {
		if (user.userId == $rootScope.loggedUser.userId)
			return $rootScope.resource.users.User.tooltipCannotDelete;
		else if (user.scimRepresentation != null)
			return $rootScope.resource.users.User.tooltipExternalUserCannotDelete;
		return $rootScope.resource.users.User.tooltipDelete
	}

};