'use strict';

angular.module('ASPEn.directives')
    .directive('repositoryBasic', function () {
        return {
            restrict: 'EA',
            templateUrl: 'directives/ManageRepositories/basic.html',
            controller: repositoryBasicCtrl
        }
    });
repositoryBasicCtrl.$inject = ['$scope', '$rootScope', '$http'];
function repositoryBasicCtrl($scope, $rootScope, $http) {
    $scope.select = function (rep) {
        $scope.repository.data.selectedConnector.type = rep.type;
        $scope.repository.data.selectedConnector.subType = rep.subType;
        $scope.buttons = $rootScope.resource.repository.buttons;
        $scope.repository.steps = $scope.buildNewRepositoryWizard($scope.repository.data.selectedConnector);
    };

    $scope.getTooltip = function () {
        if ($scope.repository.connectorNameExists)
            return $rootScope.resource.repository.fieldRepName.errMsgExists;
        else if (!$scope.repository.connectorNameValid)
            return $rootScope.resource.repository.fieldRepName.errMsgEmpty;
        else
            return '';
    };
}

