(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiObjLinkRequired', function() {
		return {
			restrict: 'A',
			require: ['?ngModel'],
			link: function(scope, element, attrs, controllers) {
				var ngModel = controllers[0];

				if(ngModel){
					ngModel.$validators.objLinkRequired = function(modelValue, viewValue){
						return viewValue != null && viewValue != undefined && viewValue.hasOwnProperty('oid');
					}
				}

				attrs.$observe('xpsui-obj-link-required', function() {
					ctrl.$validate();
				}); 
			}
		};
	});
}(window.angular));
