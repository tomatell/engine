(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiArrayControlView', ['$compile', function($compile) {

		var template = '<fieldset class="flex-form-fieldset" style="padding-left: 0px; padding-right: 0px;">'
		+ '<div class="flex-form-headers" >'
		+ ' <div ng-repeat="(key, value) in xpsuiSchema.items"'
		+ '  class="flex-form-header"'
		+ '  ng-style="{\'flex\': fieldWeigth(value), \'-webkit-flex\': fieldWeigth(value) }">'
		+ ' {{value.transCode || value.title | translate}}'
		+ ' </div>'
		+ '</div>'
		+ '<div ng-repeat="item in ngModel" class="flex-form-array-row row-{{($index%2)?\'odd\':\'even\'}}">'
		+ ' <div ng-repeat="(key, value) in xpsuiSchema.items" '
		+ '  ng-style="{\'flex\': fieldWeigth(value), \'-webkit-flex\': fieldWeigth(value) }"' 
		+ '  class="flex-form-editable-data-col "'
		+ '  xpsui-by-schema-field-view xpsui-schema="value"'
		+ '  xpsui-model="$parent.item[key]">x</div>'
		+ '</div>'

		function getTemplate(renderComponent){
			return template;
		}

		function isEmptyObj(obj) {
			if (obj && obj.hasOwnProperty('fileId')) {
                return false;
			}
            return true;
		}

		return {
			restrict: 'A',
			scope: {
				'ngModel' : '=',
				'xpsuiSchema' : '='
			},
			link: function(scope, element, attrs, controller) {
				console.log(scope.psuiModel);
				console.log(scope.xpsuiSchema);

				element.html(getTemplate(attrs.xpsuiArrayControlView));
				$compile(element.contents())(scope);


				var modelChanged = function() {
					console.log('model changed', scope.ngModel);
				};

				scope.$watchCollection('ngModel', modelChanged);

				scope.fieldWeigth = function(field) {
					if (field.render && field.render.width) {
						if (field.render.width == 'narrow') {
							return '2 0 100px';
						} else if (field.render.width == 'wide') {
							return '50 0 150px';
						}
					}
					return '10 0 200px';
				}

			}

		};
	}]);

}(window.angular));
