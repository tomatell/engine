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
			$scope.genQrcode = function(bannerDat) {
				$scope.qrcode = '{"loginName": "' + $cookies.loginName + '", "bannerDat":"' + bannerDat + '", "url":"' + url + '"}';
			}
		}
	]);
}(window.angular));