(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiFormUrlLink', [function() {
		return {
			restrict: 'A',
			link: function(scope, elm, attrs) {
				var options = scope.$eval(attrs.psuiOptions);

				elm.append('<span>' + (options.title) + '</span>');
				if (options.target) {
					attrs.$set('target', options.target);
				}

				scope.$watch(attrs.psuiModel + '.id', function(nv) {
					if (nv) {
						attrs.$set('href', options.path + '?private=true&id=' + nv);
					}
				});

			}
		};
	}]);

}(window.angular));
