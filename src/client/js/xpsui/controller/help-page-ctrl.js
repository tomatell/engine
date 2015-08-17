(function(angular) {
	'use strict';

	angular.module('xpsui:controllers')
	.controller('xpsui:HelpPageCtrl', [
		"$scope",
		"$location",
		'$cookies', 
		function($scope, $location, $cookies) {
			if ($cookies.loginName) {
				$scope.loggedin=true;
			} else {
				$scope.loggedin = false;
			}

			var url = $location.absUrl().replace('#/help', '');
			var token = $cookies.securityToken;
			$scope.genQrcode = function() {
				$scope.qrcode = '{"loginName": "' + $cookies.loginName + '", "url":"' + url + '"}';
			}

			
			//console.log($scope.greeting);
		}
	]);
}(window.angular));