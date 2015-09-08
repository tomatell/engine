(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiPortalWidgetMatchResultsAllView', ['xpsui:logging', '$compile', function(log, $compile) {
		return {
			restrict: 'A',
			scope: {
				data: '=xpsuiPortalWidgetMatchResultsAllView'
			},
			link: function(scope, elm) {
				log.group('portal-widget-match-results-all-view Link');

				elm.empty();

				var content = angular.element('<div class="x-portal-widget-match-results">' +
					'<section class="x-portal-competition-matches">' +
					'<header>Termínová listina</header>' +
					'<div style="text-align: center;">Zápas: {{data.cid}}</div>' +
					'</section>' +
					'</div>');

				elm.append(content);
				$compile(content)(scope);

				elm.addClass('x-portal-widget-view');

				log.groupEnd();
			}
		};
	}]);

}(window.angular));

