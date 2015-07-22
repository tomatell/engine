(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiArrayControlEdit', ['$compile', function($compile) {

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
		+ '  class="flex-form-editable-data-col"'
		+ '  xpsui-by-schema-field-edit xpsui-schema="value"'
		+ '  xpsui-model="$parent.item[key]">x</div>'
		+ '  <button ng-click="removeByIndex($index);" class="btn-clear">'
		+ '   <i class="icon-minus"></i> {{\'generic.search.remove\' | translate}}'
		+ '  </button>'
		+ '</div>'
		+ ' <div class="pull-right">'
		+ ' <button ng-click="appendNew();" class="btn-clear"><i class="icon-add"></i> {{"generic.search.add" | translate}}</button>'
		+ ' </div>'
		+ ' </fieldset>';

		function getTemplate(renderComponent) {
			return template;
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

				element.html(getTemplate(attrs.xpsuiArrayControlEdit));
				$compile(element.contents())(scope);

				var modelChanged = function() {
					console.log('model changed', scope.ngModel);
				};

				scope.$watchCollection('ngModel', modelChanged);

				scope.removeByIndex = function(idx) {
					scope.ngModel.splice(idx,1);
				};

				function isEmptyObj(obj) {
					if (!obj) {
						return true;
					}

					for (var key in obj) {
						if (key && key.indexOf('$') != 0
								&& obj.hasOwnProperty(key)) {
							return false;
						}
					}
		            return true;
				}

				scope.appendNew = function() {
					if (!(scope.ngModel instanceof Array)) {
						scope.ngModel = [];
					}
					if ((scope.ngModel instanceof Array)
							&& (scope.ngModel.length == 0 
									|| !isEmptyObj(scope.ngModel[scope.ngModel.length-1]))) {
						scope.ngModel.push({});
					}
				};

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
