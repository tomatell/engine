(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.factory('xpsui:PushNotificationFactory', [ '$http', function($http) {
		var service = {};
		service.sendPushNotification = function(pushregids,msg,url) {
			return $http({
				method : 'POST',
				url : '/pushnotification/send',
				data : {
					pushregids : pushregids,
					msg: msg,
					url: url
				}
			});
		};

		return service;
	} ]);

}(window.angular));
