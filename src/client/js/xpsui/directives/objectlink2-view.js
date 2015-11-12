(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiObjectlink2View', ['xpsui:logging', 'xpsui:Objectlink2Factory','xpsui:SelectDataFactory', 'xpsui:SchemaUtil','$parse', '$compile', 'xpsuiuriescapeFilter',
	function(log, objectlink2Factory, dataFactory, schemaUtil, $parse, $compile, xpsuiuriescape) {
		return {
			restrict: 'A',
			require: ['ngModel'],
			link: function(scope, elm, attrs, ctrls) {
				log.group('String view Link');

				var ngModel = ctrls[0],
					view = angular.element('<div></div>'),
					parseSchemaFragment = $parse(attrs.xpsuiSchema),
					schemaFragment = parseSchemaFragment(scope)
				;

				elm.addClass('x-control');
				elm.addClass('x-objectlink2-view');

				elm.append(view);
				
				ngModel.$render = function() {
					view.empty();

					if (ngModel.$viewValue && 
						(ngModel.$viewValue.id || ngModel.$viewValue.oid)
					) {
						schemaUtil.getFieldsSchemaFragment(
							schemaFragment.objectLink2.schema, 
							schemaFragment.objectLink2.fields, 
							function(fields){
								var data = dataFactory.getObjectLinkData(
										schemaFragment.objectLink2, ngModel.$viewValue
									);
								var schemaUri = schemaFragment.objectLink2.schema;
								schemaUri = schemaUri.substring(0, schemaUri.length - '/view'.length);
								var linkPath = '#/registry/view/' + xpsuiuriescape(schemaUri) + '/' + data.oid;
+								view.append('<a href="' + linkPath + '"><div class="linkIcon" width="32px" height="64px"><i class="icon-external-link fa-1 blackiconcolor"></i>&nbsp;&nbsp;</div></a>');
								objectlink2Factory.renderElement(
									view, 
									fields, 
									data,
									scope
								);
							}
						);

					}
				};

				log.groupEnd();
			}
		};
	}]);

}(window.angular));
