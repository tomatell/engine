(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiFormControl', ['xpsui:logging', '$parse', function(log, $parse) {
		return {
			restrict: 'A',
			controller: function() {
				this.form = null;
				this.focusedElm = null;
				this.oldValue = null;

				this.acquireFocus = function(e) {
					return this.form.acquireFocus(e);
				};

				this.releaseFocus = function(e) {
					this.form.releaseFocus(e);
				};

				this.commit = function() {
				};

				this.rollback = function() {
				};

			},
			require: ['xpsuiFormControl', '?^xpsuiForm', '?ngModel'],
			link: function(scope, elm, attrs, ctrls) {
				var formControl = ctrls[0];
				var form = ctrls[1];
				var ngModel = ctrls[2];

				formControl.form = form;

				// Check if this field is calculation
				var schema = scope.$eval(attrs.xpsuiSchema);
				if (schema.calculationX && form) {
					log.debug("Registering calculation");
					// Register calculation using the form controller
					// FIXME do it only if there is one of models
					var unregister = form.registerCalculation(attrs.xpsuiModel || attrs.ngModel, schema.calculation);
					// Deregister calculation on $destroy
					scope.$on('destroy', unregister);
				}

				if (schema.calculation && form) {
					log.debug('Registering calculation');
					var unregister2 = form.registerCalculation2(schema.calculation, function(err, val) {
						// FIXME do something with error
						if (attrs.xpsuiModel || attrs.ngModel) {
							var setter = $parse(attrs.xpsuiModel || attrs.ngModel).assign;
							setter(scope, val);
						}
					});
					scope.$on('destroy', unregister2);
				}

			}
		};
	}]);

}(window.angular));


