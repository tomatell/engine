(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiArrayControlEdit', ['$compile', function($compile) {

		var template = '<fieldset class="flex-form-fieldset" style="padding-left: 0px; padding-right: 0px;">'
		+ '<div class="flex-form-headers" >'
		+ ' <div ng-repeat="key in keys(xpsuiSchema.items)"'
		+ '  class="flex-form-header"'
		+ '  ng-style="{\'flex\': fieldWeigth(xpsuiSchema.items[key]), \'-webkit-flex\': fieldWeigth(xpsuiSchema.items[key]) }">'
		+ ' {{xpsuiSchema.items[key].transCode || xpsuiSchema.items[key].title | translate}}'
		+ ' </div>'
		+ '</div>'
		+ '<div ng-repeat="item in ngModel" class="flex-form-array-row row-{{($index%2)?\'odd\':\'even\'}}">'
		+ ' <div ng-repeat="key in keys(xpsuiSchema.items)" '
		+ '  ng-style="{\'flex\': fieldWeigth(xpsuiSchema.items[key]), \'-webkit-flex\': fieldWeigth(xpsuiSchema.items[key]) }"'
		+ '  class="flex-form-editable-data-col"'
		+ '  xpsui-by-schema-field-edit xpsui-schema="xpsuiSchema.items[key]"'
		+ '  xpsui-model="$parent.item[key]">x</div>'
		+ '  <button ng-click="removeByIndex($index);" class="btn-clear">'
		+ '   <i class="icon-minus"></i> {{\'generic.search.remove\' | translate}}'
		+ '  </button>'
		+ '</div>'
		+ '<div class="xpsui-array-control-noItems" ng-show="!ngModel || ngModel.length==0">{{"generic.noItems.label" | translate}}</div>'
		+ '<div class="pull-right">'
		+ ' <button ng-click="appendNew();" class="btn-clear"><i class="icon-add"></i> {{"generic.search.add" | translate}}</button>'
		+ '</div>'
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

				scope.keys = function(obj) {
					return obj ? Object.keys(obj) : [];
				};

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
