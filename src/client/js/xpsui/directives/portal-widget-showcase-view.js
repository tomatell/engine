(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiPortalWidgetShowcaseView', ['xpsui:logging', '$compile', '$http', '$sce', '$route', '$interval',
		'$location', 'xpsui:NotificationFactory', function(log, $compile, $http, $sce, $route, $interval, $location, notificationFactory) {
		return {
			restrict: 'A',
			scope: {
				data: '=xpsuiPortalWidgetShowcaseView'
			},
			template: '<div class="portal-content-title"></div>'
				+ '<div class="portal-content-container">'
				+ '	<article ng-repeat="c in model" ng-show="visibleIndex == $index || visibleIndex == \'no\'">'
				+ '  <div ng-show="c.thumbnail && c[c.thumbnail] && c[c.thumbnail].img" style="background: url(\'{{c[c.thumbnail].img}}\'); background-repeat: no-repeat; background-size: cover; height: 570px; width: 100%;"></div>'
				+ '  <div class="x-portal-widget-showcase-textblock"><a ng-click="navigate(c.id)" ng-bind-html="makeSafe(c.title)"></a><div ng-bind-html="makeSafe(c.abstract)"></div></div>'
				+ '	</article>'
				+ '</div>',

			link: function(scope, elm) {
				log.group('portal-widget-category-view Link');

				elm.addClass('x-portal-widget-showcase');

				scope.model = [];
				scope.visibleIndex = 0;

				$interval(function() {
					++scope.visibleIndex;
					if (scope.visibleIndex >= scope.model.length) {
						scope.visibleIndex = 0;
					}
				}, 5000);

				function findFirstWithName(arr, name) {
					for (var j = 0; j < arr.length; ++j) {
						if (arr[j].meta.name === name) {
							return arr[j].data;
						}
					}
				}

				scope.makeSafe = function(str) {
					if (typeof str === 'string') {
						return $sce.trustAsHtml(str);
					}

					return '';
				};

				$http({
					method: 'POST',
					url: '/portalapi/getByTags',
					data: {
						tags: scope.data.data.tags
					}
				})
				.success(function(data) {
					if (data && data.length > 0) {
						scope.model = [];
						for (var i = 0; i < data.length; ++i) {
							var articleData = {};
							articleData.id = data[i].id;

							if(scope.data.config) {
								if(scope.data.config.thumbnailBlock) {
									articleData.thumbnail = scope.data.config.thumbnailBlock;
								}
								if(scope.data.config.displayBlocks) {
									for (var j = 0; j < scope.data.config.displayBlocks.length; j++) {
										articleData[scope.data.config.displayBlocks[j]] = findFirstWithName(data[i].data, scope.data.config.displayBlocks[j]);
									}
								}
							}
							scope.model.push(articleData);
						}
					}
				}).error(function(err) {
					notificationFactory.error(err);
				});

				scope.navigate = function(aid) {
					$location.path('/portal/edit/' + aid);
				};

				log.groupEnd();
			}
		};
	}]);

}(window.angular));
