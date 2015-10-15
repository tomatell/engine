(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiPortalWidgetPlayersStatsView', ['xpsui:logging', '$compile', function(log, $compile) {
		return {
			restrict: 'A',
			scope: {
				data: '=xpsuiPortalWidgetPlayersStatsView'
			},
			link: function(scope, elm) {
				log.group('portal-widget-players-stats-view Link');

				elm.empty();

				var content = angular.element('<div class="x-portal-widget-match-results">' +
					'<section class="x-portal-competition-matches">' +
					'<header>Štatistiky hráčov</header>' +
					'<div style="text-align: center;">Súťaž: {{data.cid}}</div>' +
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

