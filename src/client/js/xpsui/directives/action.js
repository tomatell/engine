(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiAction', [
		'xpsui:StandardActions',
		'$compile',
		'$translate',
		function(sAct, $compile, $translate) {
			return {
				restrict: 'E',
				link: function(scope, elm, attrs, ctrls) {
					var options = scope.$eval(attrs.options) || {};

					var scopePrefix = attrs.scopePrefix || null;
					var modelPrefix = attrs.modelPrefix || null;

					elm.addClass('x-action');

					if (options.withSpacer) {
						elm.addClass('x-action-with-spacer');
					}

					var btn = angular.element('<button type="button" class="btn"></button>');

					var icon = angular.element('<i class="fa fa-search"></i>');
					var iconSpinner = angular.element('<i class="fa fa-spinner fa-spin"></i>');

					btn.append(icon);
					btn.append(iconSpinner);

					// set title, classes and other stuff
					btn.append($translate.instant(options.title));

					(options.classes || []).map(function(i) {
						btn.addClass(i);
					});


					$compile(btn)(scope);
					elm.append(btn);

					iconSpinner.addClass('ng-hide');

					function stopExecution() {
						icon.removeClass('ng-hide');
						iconSpinner.addClass('ng-hide');
						btn.removeAttr('disabled');
					}

					function startExecution() {
						if (options && options.func) {

							var localScope, localModel;
							if (scopePrefix) {
								localScope = scope.$eval(scopePrefix);
							} else {
								localScope = scope;
							}

							if (modelPrefix) {
								localModel = localScope.$eval(modelPrefix);
							} else {
								localModel = localScope;
							}

							var ctx = {
								scope: localScope,
								model: localModel,
								args: options.args
							};

							icon.addClass('ng-hide');
							iconSpinner.removeClass('ng-hide');
							btn.attr('disabled', 'disabled');

							sAct.invoke(options.func, ctx).finally(function(r) {
								stopExecution();
							});
						}
					}

					btn.on('click', function() {
						scope.$apply(function() {
							startExecution();
						});
					});
				}
			};
		}]);

}(window.angular));

