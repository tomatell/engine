(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.factory('xpsui:PushNotificationFactory', [ '$http', function($http) {
		var service = {};
		service.sendPushNotification = function(pushregids,msg) {
			return $http({
				method : 'POST',
				url : '/pushnotification/send',
				data : {
					pushregids : pushregids,
					msg: msg
				}
			});
		};

		return service;
	} ]);

}(window.angular));
