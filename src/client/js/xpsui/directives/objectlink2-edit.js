(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiObjectlink2Edit', [
		'xpsui:logging',
		'$parse',
		'xpsui:DropdownFactory',
		'xpsui:Objectlink2Factory',
		'xpsui:SelectDataFactory',
		'xpsui:SchemaUtil',
		'xpsui:RemoveButtonFactory',
	function(log, $parse, dropdownFactory, objectlink2Factory, dataFactory, schemaUtil, removeButtonFactory) {
		return {
			restrict: 'A',
			require: ['ngModel', '?^xpsuiFormControl', 'xpsuiObjectlink2Edit', '?^xpsuiForm'],
			controller: function() {
				this.setup = function() {
					this.$input = angular.element('<div tabindex="0"></div>');
					this.$input.addClass('x-input');
				};

				this.getInput = function() {
					return this.$input;
				};

				this.$input = null;
				this.setup();
			},
			link: function(scope, elm, attrs, ctrls) {
				log.group('ObjectLink2 edit Link');

				var ngModel = ctrls[0],
					selfControl = ctrls[2],
					form = ctrls[3],
					input = selfControl.getInput(),
					parseSchemaFragment = $parse(attrs.xpsuiSchema),
					schemaFragment = parseSchemaFragment(scope),
					selectbox = null
				;

				var removeButton = removeButtonFactory.create(elm, {
					enabled: !schemaFragment.required,
					input: input,
					onClear: function() {
						input.empty();
						scope.$apply(function() {
							ngModel.$setViewValue(null);
						});
					}
				});

				elm.addClass('x-control');
				elm.addClass('x-select-edit x-objectlink2-edit');


				function render(data) {
					input.empty();

					if (data) {
						removeButton.show();
						// get fields schema fragments
						schemaUtil.getFieldsSchemaFragment(
							schemaFragment.objectLink2.schema,
							schemaFragment.objectLink2.fields,
							function(fields) {
								objectlink2Factory.renderElement(
									input,
									fields,
									data
								);
							}
						);
					}
				}

				elm.append(input);


				elm.bind('focus', function() {
					input[0].focus();
				});

				// dropdown
				var dropdown = dropdownFactory.create(elm, {
					titleTransCode: schemaFragment.transCode
				});

				dropdown.setInput(selfControl.getInput())
					.render()
				;

				// selectobx
				selectbox = objectlink2Factory.create(elm, {
					onSelected: function(value) {

						scope.$apply(function() {
							ngModel.$setViewValue(
								value
							);
						});

						render(value);
						console.log('onSelected');
						console.log(arguments);
					}
				});
				selectbox.setInput(selfControl.getInput());
				selectbox.setDropdown(dropdown);

				schemaUtil.getFieldsSchemaFragment(
					schemaFragment.objectLink2.schema,
					schemaFragment.objectLink2.fields,
					function(fields) {
						if (fields === null) {
							return log.error('Could not load objLink field definitions');
						}

						var firstField = fields[Object.keys(fields)[0]];
						var options = {};

						if(firstField.type === 'number') {
							options.searchCondition = 'eq';
							options.inputType = 'number';
						}else if(firstField.type === 'string') {
							options.searchCondition = 'starts';
							options.inputType = 'string';
						}

						// store
						var dataset = dataFactory.createObjectDataset(schemaFragment, options);
						selectbox.setDataset(dataset);

						// FIXME really strange place for stuff like this. getFieldsChemaFragment should
						// be promised and reworked
						if (form && schemaFragment.objectLink2.calculatedCriteria) {
							var unregister2 = form.registerCalculation2(schemaFragment.objectLink2.calculatedCriteria, function(err, val) {
								// FIXME do something with error
								//schemaFragment.crits = val;
								if (err) {
									console.log(err);
								} else {
									selectbox.dataset.store.setForcedCriteria(val);
								}
							});
							scope.$on('destroy', unregister2);
						}
					}
				);

				ngModel.$render = function() {
					if(!angular.equals({}, ngModel.$viewValue)) {
						// get data from schema or model and render it
						render(dataFactory.getObjectLinkData(
							schemaFragment.objectLink2, ngModel.$modelValue
						));
					} else {
						input.empty();
					}
				};

				log.groupEnd();
			}
		};
	}]);

}(window.angular));

