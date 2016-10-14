'use strict';
angular.module('ASPEn.directives')
	.directive('editUser', function() {
		return {
			restrict: 'EA',
			templateUrl: 'directives/User/EditUser/edit-user.html',
			controller: edituserController,
			controllerAs: 'vm'
		}

	});
edituserController.$inject = ['$scope', '$http', '$rootScope', '$filter', '$window', '$timeout', '$modal', '$modalStack', '$q', '$document', '$state']

function edituserController($scope, $http, $rootScope, $filter, $window, $timeout, $modal, $modalStack, $q, $document, $state) {
	var count=0;
	var vm = this;
	vm.flag2 = false;
	$rootScope.roleInfo = $filter('orderBy')($rootScope.roleInfo, 'roleName');
	var realmId;
	$scope.name1;
	//var user = $scope.user;
	var defaultRoleId = [];
	var ind = vm.indexVal;
	vm.api = $rootScope.config.user.api;
	var defaultRoles = [];
	var skipval = 0;
	$rootScope.updateRoleInfo = false;
	$rootScope.addRoleInfo = false;
	$rootScope.updateGroupInfo = false;
	$rootScope.addGroupInfo = false;
	$rootScope.updateExternalGroupInfo = false;
	vm.checkStatus = true;
	vm.checkExternalStatus = true;
	vm.editUserErrors = $rootScope.resource.common.fields;
	var existingRoles = [];
	var limitVal;
	var groupId;
	var time3;
	var nameup;
	var fl = "true";
	var updateName;
	vm.editusers = {};
	var userName = $scope.user.loginName;
	var user = $scope.user;
	var user1 = $scope.user.groupName;
	vm.editTabs = [{
		title: $rootScope.resource.users.editUser.details,
		content: "directives/User/EditUser/editDetails.html",
		active: $rootScope.userPanel.details
	}, {
		title: $rootScope.resource.users.editUser.externalGroups,
		content: "directives/User/EditUser/external.html",
		active: $rootScope.userPanel.externalGroups
	}, {
		title: $rootScope.resource.users.editUser.userRoles,
		content: "directives/User/EditUser/editRoles.html",
		active: $rootScope.userPanel.userRoles
	}, {
		title: $rootScope.resource.users.editUser.groupRoles,
		content: "directives/User/EditUser/editGroupRoles.html",
		active: $rootScope.userPanel.groupRoles
	}];
	vm.totalCount = [];
	$scope.$watch(function () {
		return vm.editusers;
	}, function (newval, oldval) {
		console.log('64', newval);
	}, true);
	vm.countInit = function (roleName) {
		if (vm.totalCount.indexOf(roleName) == -1) {
			vm.totalCount.push(roleName)
			return true
		}
		return false;
	};

	vm.userData = $scope.userData;
	var results = $filter('filter')(vm.userData, {
		userId: $scope.user.userId
	})[0];

	ind = vm.userData.indexOf(results);
	if (ind >= 0) {
		for (var k = 0; k < vm.userData[ind].applications.length; k++) {
			var z = vm.userData[ind].applications[k].roleDetailsList;
			for (var l in z) {
				existingRoles.push(z[l].roleId);
			}

		}
		groupId = vm.userData[ind].group.id;
		var postConfig = {
			headers: {
				'Content-Type': 'application/json'
			}
		};
		var roles;
		var tempUrl = $rootScope.backEnd + $rootScope.config.group.api + "/" + groupId;
		$http.get(tempUrl, postConfig)
			.success(function (res) {
				roles = res;
				if (roles.applications != null) {
					for (var i = 0; i < $rootScope.roleInfo.length; i++) {
						var flag = false;
						for (var val in roles.applications) {
							for (var k = 0; k < roles.applications[val].roleDetailsList.length; k++) {
								var roleTemp = roles.applications[val].roleDetailsList[k];

								if (roleTemp.roleId == ($rootScope.roleInfo[i].roleId)) {
									$rootScope.roleInfo[i].groupVal = true;
									flag = true;
								}

							}
							if (!flag)
								$rootScope.roleInfo[i].groupVal = false;
						}

					}
				} else
					vm.checkStatus = false


			})
			.error(function (err, status) {
				if ($rootScope.isSessionExpired(status, err)) {
					$rootScope.redirectToLogin();
				}
			});

		for (var i = 0; i < $rootScope.roleInfo.length; i++) {
			var flag = false;
			for (var j = 0; j < existingRoles.length; j++) {
				if (existingRoles[j] == ($rootScope.roleInfo[i].roleId)) {
					$rootScope.roleInfo[i].val = true;
					flag = true;
				}
			}
			if (!flag)
				$rootScope.roleInfo[i].val = false;
		}

	}
	if ($rootScope.limit.group == "" || $rootScope.limit.group == undefined) {
		vm.limit = $rootScope.config.groupLimit.limit;
		vm.slimit = vm.limit;
		limitVal = vm.slimit;
	} else {
		vm.limit = $rootScope.limit.group;
		vm.slimit = vm.limit;
		limitVal = vm.slimit;
	}

	vm.checkingEnable = function (role) {
		return role.val;

	};
	vm.checkingDisable = function (role) {
		return (userName == $rootScope.loggedUser.name);
	};

	vm.selectRole = function (role) {

	};
	vm.user = $rootScope.resource.users.User;
	vm.common = $rootScope.resource.common;
	vm.backEnd1 = $rootScope.backEnd;
	vm.error = false;
	vm.exists = false;
	vm.nameGroup;
	vm.xm;
	vm.editusers = {};
	if (vm.usegroupName == true) {//passed flag from update html
		//vm.xm = vm.nameGroup;
		vm.xm = $rootScope.groupNames1
		console.log('inf if', vm.xm);
	} else {
		console.log('in else');
		if ($scope.editflag == true) { // passed flag from edit user update
			//vm.xm = $rootScope.groupNames1;
			vm.xm = $scope.name1;
			console.log('in else >if', vm.xm);
		} else {
			//$scope.xm = user.group.name; // default scenario
			vm.xm = user.groupName;
			console.log('in else >else', vm.xm);
		}
	}

	vm.groupGpi = $rootScope.config.group.api;
	$timeout(function () {
		vm.backEnd1 = $rootScope.backEnd;
	}, 100);
	var getUrls = vm.backEnd1 + vm.groupGpi;
	var urls = getUrls;
	vm.dynamicChosenOptions = {
		width: '100%',
		allow_single_deselect: true,
		search_contains: true,
		dynamic_search: true,
		placeholder_text_single: vm.xm,
		placeholder_text_multiple: 'Default Group'
	};
	vm.dynamicSelectedLocation = "";
	vm.dynamicLocations = [];
	vm.defaultval;
	vm.locations = [];
	vm.serverSimulate = function (pageNumber, searchString) {
		count++;

		var results;
		//if (searchString.length > 0)
		//	vm.updateFn(pageNumber, searchString);
			console.log("searchString::::",count)

			results = $filter('filter')(vm.locations, searchString);
		//if(count%2==0) {
		console.log("results::::",results)
			if (results) {
				return results;
			//}
		}

	}
	vm.updateFn = function (pageNumber, searchString) {
		//to debounce the same searh
		var deferred = $q.defer();
		/**if (searchString !== '' && vm.searchString == searchString) {
			deferred.resolve('');
			return deferred.promise;
		}**/
		debugger;
		angular.element('.selectGroup .chosen-results').attr('style','display:none !important')
		vm.searchString = searchString;
		console.log('in the update fn');
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
	var userLoc;
		var promiseObj = $http.get(urls2);
		//angular.element('.selectGroup .chosen-results').attr('style','display:none !important')
		promiseObj.success(function (res, status) {
			console.log('245jjj',res.count);
			var elem = angular.element('.selectGroup .chosen-results');
			clearInterval(userLoc);
			if(res.count== 0){
				console.log("res.count 0 245:::")
				angular.element('.selectGroup .chosen-results').attr('style','display:block !important')
console.log("angular.element('.selectGroup .chosen-results')", angular.element('.selectGroup .chosen-results'))
			}
			else {
				//angular.element('.selectGroup .chosen-results').attr('style','display:none !important')
			}
			//}
			if (pageNumber == 1)
				vm.dynamicLocations = [];
			vm.locations.length = 0;
			angular.forEach(res.groups, function (val, ind) {
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
					//console.log(vm.addGroupName,"vm.addGroupName::",val.name);
					vm.groupId = val.groupId;
					vm.addGroupName = val.name;
				}
			});

			vm.dynamicLocations.push.apply(vm.dynamicLocations, vm.locations);
		});

		var simulateAjax;
		simulateAjax = function () {
			var fn = function () {
				$timeout(function(){
					var results = vm.serverSimulate(pageNumber, searchString);
					return deferred.resolve(results);
				},2000);

				/*if (results.length ==0) {
				 $timeout(function () {
				 vm.locations.length = 0;
				 results = vm.serverSimulate(pageNumber, searchString);
				 return deferred.resolve(results);
				 }, 1000);

				 }
				 else{
				 return deferred.resolve(results);
				 }*/
			};
			$timeout(fn, 10);
			 userLoc = setInterval(function(){
				angular.element('.selectGroup .chosen-results').attr('style','display:none !important');

			},50);
			return deferred.promise;
		};
		simulateAjax().then(function (results) {
			if (vm.dynamicLocations.length == 0) {
				console.log("updatedddddd:::::::")
				vm.dynamicLocations.length = 0;
				vm.dynamicLocations.push.apply(vm.dynamicLocations, results);
				vm.dynamicLocations = vm.serverSimulate(1, "");
			}

		});
		//Send promise to chosen directive
		return deferred.promise;
	}

	vm.editusers.externalGroups = [];
	var email = vm.editusers.email = user.loginName;
	var fName = vm.editusers.fName = user.firstName;
	var mName = vm.editusers.mName = user.middleName;
	var lName = vm.editusers.lName = user.lastName;
	var phone = vm.editusers.phone = user.phoneNumber;
	var selGroup = vm.editusers.dynamicSelectedLocation = user.groupName;
	var street = vm.editusers.street = user.street;
	var locality = vm.editusers.locality = user.locality;
	var state = vm.editusers.state = user.state;
	var postalCode = vm.editusers.postalCode = user.postalCode;
	var country = vm.editusers.country = user.country;
	vm.editusers.internalGroup = user.groupName;
	if (user.extgroups != undefined) {
		var temp2 = "";
		for (var k = 0; k < user.extgroups.length; k++) {
			var temp = user.extgroups[k].display.split(',')[0];
			temp2 = temp.split('CN=')[1];

		}
		vm.editusers.externalGroups.push(temp2);
	} else
		vm.checkExternalStatus = false;
	vm.groups = {
		title: 'Address',
		content: vm.editusers.address,
		isOpen: 'false'
	};

	vm.editUsers = function($index) {
		var applications = [];
		vm.spinner = true;
		vm.error = false;
		vm.userIds = user.userId;
		vm.version = user.version;
		vm.groupName1 = user.groupName;
		var putObj = {
			version: vm.version,
			userId: vm.userIds,
			group: {
				"id": vm.groupId,
				"name": vm.groupName1
			}

		};
		console.log(vm.editusers.dynamicSelectedLocation,"313::" );
		if (fName != vm.editusers.fName)
			putObj['firstName'] = vm.editusers.fName;
		if (mName != vm.editusers.mName)
			putObj['middleName'] = vm.editusers.mName;
		if (lName != vm.editusers.lName)
			putObj['lastName'] = vm.editusers.lName;
		if (phone != vm.editusers.phone)
			putObj['phoneNumber'] = vm.editusers.phone;
		if (selGroup != vm.editusers.dynamicSelectedLocation) {
			console.log("put sel grup if");
			putObj['group'] = vm.editusers.dynamicSelectedLocation;
		}
		if (street != vm.editusers.street)
			putObj['street'] = vm.editusers.street;
		if (locality != vm.editusers.locality)
			putObj['locality'] = vm.editusers.locality;
		if (state != vm.editusers.state)
			putObj['state'] = vm.editusers.state;
		if (postalCode != vm.editusers.postalCode)
			putObj['postalCode'] = vm.editusers.postalCode;
		if (country != vm.editusers.country)
			putObj['country'] = vm.editusers.country;
		var tempArr = [];
		for (var i = 0; i < $rootScope.userApplicationName.length; i++) {
			var res1 = ($filter)('filter')($rootScope.roleInfo, {
				val: true,
				applicationName: $rootScope.userApplicationName[i].id
			});
			var roleDetailsList = [];
			for (var j = 0; j < res1.length; j++) {
				tempArr.push(res1[j].roleId);
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


		var flag2 = false;
		if (angular.equals(existingRoles, tempArr) /*|| (existingRoles.length - tempArr.length) == 1*/ ) {
			flag2 = true;
		}
		if (vm.editusers.email != user.loginName) {
			putObj['loginName'] = vm.editusers.email;
		}
		if ((!flag2)) {
			putObj['applications'] = applications;
		}
		var updateUrl = vm.backEnd1 + vm.api + "/" + vm.userIds;
		vm.flag2 = true;
		console.log('putobj',putObj);
		$http.put(updateUrl, putObj, postConfig).success(function(res, status) {
			user.loginName = res.loginName;
			user.firstName = res.firstName;
			user.middleName = res.middleName;
			user.lastName = res.lastName;
			user.phoneNumber = res.phoneNumber;;
			user.street = res.street;
			user.locality = res.locality;
			user.state = res.street;
			user.postalCode = res.postalCode;
			user.country = res.country;
			vm.spinner = false;
			vm.neww = res.loginName;
			user.version = res.version;
			for (i = 0; i < $rootScope.temp.length; i++) {
				if ($rootScope.temp[i].userId == res.userId) {
					$rootScope.temp[i].loginName = res.loginName;
					$rootScope.temp[i].firstName = res.firstName;
					$rootScope.temp[i].lastName = res.lastName;
					$rootScope.temp[i].group = res.group.name;
					$rootScope.temp[i].phoneNumber = res.phoneNumber;
					for (var v = 0; v < vm.dynamicLocations.length; v++) {
						if (vm.dynamicLocations[v].id == res.group.id) {
							$rootScope.temp[i].groupName = vm.dynamicLocations[v].name;
//$scope.name1=vm.dynamicLocations[v].name;
						}
					}
				}
			}
			$scope.users = $rootScope.temp;

			if (ind >= 0) {
				for (var k = 0; k < vm.userData[ind].applications.length; k++) {
					for (var z = 0; z < vm.userData[ind].applications[k].roleDetailsList.length; z++)
						existingRoles.push(vm.userData[ind].applications[k].roleDetailsList[z].roleId);
				}
				vm.userData[ind].loginName = res.loginName;
				vm.userData[ind].firstName = res.firstName;
				vm.userData[ind].middleName = res.middleName;
				vm.userData[ind].lastName = res.lastName;
				vm.userData[ind].phoneNumber = res.phoneNumber;
				vm.userData[ind].locality = res.locality;
				vm.userData[ind].state = res.state;
				vm.userData[ind].street = res.street;
				vm.userData[ind].postalCode = res.postalCode;
				vm.userData[ind].country = res.country;
				vm.userData[ind].applications = res.applications;
				vm.userData[ind].version = res.version;
				vm.userData[ind].group.id = res.group.id;
				var userView = user.groupName;
				console.log(userView,"userView::");
				var dynamicName;
				vm.editusers.fName = res.firstName;
				console.log(vm.editusers.dynamicSelectedLocation,"425::");

				if (vm.editusers.dynamicSelectedLocation == undefined) {
					vm.userData[ind].group.name = userView;
					fl = "false";
				} else {

					dynamicName = vm.editusers.dynamicSelectedLocation.name;
					vm.userData[ind].group.name = vm.editusers.dynamicSelectedLocation.name;
					fl = "true";
				}
			}

			$modalStack.dismissAll();
			console.log($scope,"vm");
			//$scope.editmodalOpen.close("true");
			$rootScope.updateRoleInfo = true;
			$rootScope.dataUser = res;
			$rootScope.fulluserData = vm.userData;
			if (!vm.findUser || vm.findUser == "") {

				vm.findUser = " ";
			} else {

				vm.findUser = "";
			}
			$scope.modalInstance = $modal.open({
				templateUrl: 'views/user/update.html',
				//scope: $scope,
				windowClass: 'modal-User',
				windowTopClass: 'windowTopClass', //to allow background interaction
				appendTo: $document.find('.module-container'),
				backdrop: false,
				resolve:{
					user: function() {
						return $scope.user;
					}
				},
				controller: function($scope, $timeout, $modalStack, user) {
					$(".modal-User").toggle();

					$scope.neww = res.loginName;
					console.log('466', user);
					$scope.user = $rootScope.dataUser;
					$scope.userData = $rootScope.fulluserData;
					console.log('$rootScope.dataUser', $rootScope.dataUser);
					if (fl == "false") {
						console.log('f1 =false',userView );
						$rootScope.groupNames1 = userView;
						updateName =userView;
					} else {
						for (var z = 0; z < vm.dynamicLocations.length; z++) {
							if (vm.dynamicLocations[z].id == putObj.group) {
								dynamicName =vm.dynamicLocations[z].name;
								//$rootScope.temp[i].groupName = vm.dynamicLocations[v].name;

							}
						}

						//dynamicName = putObj.group;
						//$rootScope.groupName = dynamicName;
						user.groupName = dynamicName;
						$scope.name1 =user.groupName;
						console.log('f1 ==true',dynamicName );
					}
					//name1 =dynamicName;
					$scope.editflag = true;
					$scope.func = function() {
						console.log('func',$scope.user);
						//e.preventDefault();
						time3 = "true";

						$(".modal-User").toggle();
						$scope.modalOpenedit = $modal.open({
							animation: false,
							templateUrl: 'views/user/edit-user.html',
							keyboard: 'true',
							scope: $scope,
							backdrop: 'static',
							resolve: {

								user: function() {
									return $scope.user;
								},
								externalUser: function() {
									return user.scimRepresentation != null;
								}
							},
							controller: function($scope, externalUser) {
								$scope.isExternalUser = externalUser;
								$scope.close = function() {
									$scope.modalOpenedit.close("true");
								}
							}
						});
						$scope.modalOpenedit.result.then(function(result) {

						})
					};

				}
			});
			$timeout(function() {
				if (time3 == "true") {

				} else {
					$scope.modalInstance.close("true");
				}

			}, 5000);



		}).error(function(err, status) {
			if ($rootScope.isSessionExpired(status, err)) {
				$rootScope.redirectToLogin();
			} else {
				alert(status + ' has occurred.');
			}

			if (status == 400) {
				vm.flag2 = false;
				vm.error = true;
				vm.spinner = false;
				vm.errorMessage = vm.common.fields.error;
			}
			if (status == 409) {
				vm.flag2 = false;
				vm.spinner = false;
				vm.errorMessage = vm.user.error;
				vm.error = true;

			} else if (status !== 0) {
				vm.flag2 = false;
				vm.errorMessage = vm.common.fields.error;
				vm.spinner = false;
				vm.error = true;
			}
		});


	};

	vm.cancel = function() {
		$modalStack.dismissAll();
	};
	vm.close = function() {
		$scope.editmodalOpen.close("true");

	};
	$rootScope.close1 = function() {
		$scope.modalInstance.close("true");
	};
};