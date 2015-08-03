(function(angular) {
	'use strict';

	angular.module('xpsui:controllers')
	.controller(
		'xpsui:SecurityLogoutCtrl',
		[ '$scope', 'xpsui:SecurityService', '$location', '$cookies',
				function($scope, SecurityService, $location, $cookies) {
					$scope.logout = function() {
						SecurityService.getLogout().then(function() {
							$scope.security.currentUser = undefined;
							delete $cookies.rememberMe;
							$location.path('/login');
						});
					};
				}
	]);
	
}(window.angular));