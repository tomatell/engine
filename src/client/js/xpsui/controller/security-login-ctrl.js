(function(angular) {
	'use strict';

	angular.module('xpsui:controllers')
	.controller('xpsui:SecurityLoginCtrl', [ 
		'$scope', 'xpsui:SecurityService', 
		'$rootScope', 
		'$location',
		'xpsui:NotificationFactory', 
		'xpsui:NavigationService' ,
		'$cookies',
		'xpsui:config',
		function($scope, SecurityService, $rootScope, $location, notificationFactory, navigationService, $cookies, config) {
			// FIXME remove this in production
			// $scope.user = 'johndoe';
			// $scope.password = 'johndoe';
			$scope.user = '';
			$scope.password = '';
			if($cookies.rememberMe) {
				$scope.rememberMe = true;
			} else {
				$scope.rememberMe = false;
			}

			/**
			* Login button click
			*/
			$scope.login = function() {
				SecurityService.getLogin($scope.user, $scope.password, $scope.rememberMe).success(function(user) {
					//$cookies.rememberMe = $scope.rememberMe;
					if (user.systemCredentials.profiles.length > 1) {
						$scope.profiles=user.systemCredentials.profiles;
					} else {
						SecurityService.selectProfile(user.systemCredentials.profiles[0].id).success(function(){
							SecurityService.getCurrentUser().success(function(data){
								$rootScope.security.currentUser=data;
								if (!navigationService.back()) {
									$location.path(config.get('after_login_url') || '/dashboard');
								}
							});
						});
					}
				}).error(function(err) {
					if (err){
						console.log(err);
					}
					delete $rootScope.security.currentUser;
					var mes = {translationCode:'login.authentication.failed',time:5000};
					notificationFactory.error(mes);
				});
			}

			$scope.selectProfile=function(){
				if (!$scope.selectedProfile) return;
				SecurityService.selectProfile($scope.selectedProfile.id).success(function(){
					 SecurityService.getCurrentUser().success(function(data){
						$rootScope.security.currentUser=data;
						if (!navigationService.back()) {
							$location.path(config.get( 'after_login_url') || '/dashboard' );
						}
					});
				});
			};

			$scope.resetPassword = function() {
				SecurityService.getResetPassword($scope.user);
			};
		}
	]);

}(window.angular));
