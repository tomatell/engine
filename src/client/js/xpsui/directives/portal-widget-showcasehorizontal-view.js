(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiPortalWidgetShowcasehorizontalView', ['xpsui:logging', '$compile', '$http', '$sce', '$route', '$interval',
		'$location', 'xpsui:NotificationFactory', function(log, $compile, $http, $sce, $route, $interval, $location, notificationFactory) {
		return {
			restrict: 'A',
			scope: {
				data: '=xpsuiPortalWidgetShowcasehorizontalView'
			},
			template: '<div class="portal-content-title"></div>'
				+ '<div class="portal-content-container" style=" margin-left: {{marginLeft}}px; ">'
				+ '	<article ng-repeat="c in model">'
				+ '	 <div class="x-portal-widget-showcase-diamond only-location"><div class="x-portal-widget-showcase-diamond-inner"></div></div>'
				+ '  <div class="only-riderszone" style="background: #b9b9b9; -webkit-clip-path: polygon(0px 110px, 110px 0px, 220px 110px, 110px 220px); position: absolute; width: 220px; height: 220px; margin-left: -15px; margin-top: -15px;"></div>'
				+ '  <div ng-show="c.thumbnail && c[c.thumbnail] && c[c.thumbnail].img" class="only-riderszone" style="background: url(\'{{ c[c.thumbnail].img }}\'); background-size: cover; background-repeat: no-repeat; ; -webkit-clip-path: polygon(0px 95px, 95px 0px, 190px 95px, 95px 190px); width: 190px; height: 190px; "></div>'
				+ '  <div ng-show="c.thumbnail && c[c.thumbnail] && c[c.thumbnail].img" class="x-portal-widget-showcase-image" style="background: url(\'{{c[c.thumbnail].img}}\'); background-repeat: no-repeat; background-size: cover; height: 492px; width: 100%;"></div>'
				+ '  <div ng-show="c.thumbnail && c[c.thumbnail] && c[c.thumbnail].img" class="x-portal-widget-showcase-textblock"><a ng-click="navigate(c.id)" ng-bind-html="makeSafe(c.title)"></a><div ng-bind-html="makeSafe(c.abstract)"></div></div>'
				+ ' </article>'
				+ '</div>'
				+ '<div class="portal-content-navigation"><i class="fa fa-caret-left fa-2x" ng-click="moveLeft()"></i> <i class="fa fa-caret-right fa-2x" ng-click="moveRight()"></i></div>',
			link: function(scope, elm) {
				log.group('portal-widget-category-view Link');

				elm.addClass('x-portal-widget-showcase');

				scope.model = [];
				scope.marginLeft = 0;

				scope.moveLeft = function() {
					scope.marginLeft = scope.marginLeft + 100;
				};
				scope.moveRight = function() {
					scope.marginLeft = scope.marginLeft - 100;
				};
				elm.css('height', '492px');

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
