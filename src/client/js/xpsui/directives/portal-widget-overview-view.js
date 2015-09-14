(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiPortalWidgetOverviewView', ['xpsui:logging', '$compile', '$http', '$sce', '$route', '$location', function(log, $compile, $http, $sce, $route, $location) {
		return {
			restrict: 'A',
			scope: {
				data: '=xpsuiPortalWidgetOverviewView'
			},
			template: '<article ng-repeat="c in model" style="overflow: auto;">'
				+ '			<div><a ng-click="navigate(c.id)" ng-bind-html="makeSafe(c.title)"></a></div>'
				+ '			<img ng-show="c.thumbnail && c[c.thumbnail] && c[c.thumbnail].img" ng-src="{{c[c.thumbnail].img}}" style="width: 164px !important; height: 123px !important;float: left;"></img>'
				+ '			<div ng-bind-html="makeSafe(c.abstract)" class="x-portal-widget-overview-inner"></div></article>'
				+ '<div style=" text-align: right; clear: both;" class="x-portal-widget-overview-navigation">'
				+ '	<a ng-click="prevPage()" style=" color: #CB2225; "><i class="fa fa-chevron-left x-portal-widget-gallery-prev-btn"></i></a>'
				+ '	&nbsp;&nbsp;<a ng-click="nextPage()" style=" color: #CB2225; "><i class="fa fa-chevron-right x-portal-widget-gallery-next-btn"></i></a>'
				+ '</div>',
			link: function(scope, elm, attrs, ctrls) {
				log.group('portal-widget-overview-view Link');

				elm.addClass('x-portal-widget-overview');

				scope.model = [];
				scope.page = 0;
				scope.numberPerPage = scope.data.data.pageSize;
				console.log('dsa');
				if ((typeof scope.numberPerPage === "undefined")
						|| scope.numberPerPage == '') {
					scope.numberPerPage = 20;
				}
				scope.prevPage = function () {
					scope.page--;
					if (scope.page < 0) {
						scope.page = 0;
					}
					scope.refreshPage();
				};
				scope.nextPage = function () {
					scope.page++;
					var totalPages = Math.ceil((1.0 * scope.modelAll.length) / (1.0 * scope.numberPerPage));
					if (scope.page >= totalPages) {
						scope.page = totalPages-1;
					}
					scope.refreshPage();
				};
				scope.refreshPage = function () {
					scope.model = [];
					var iterateFrom = scope.page*scope.numberPerPage;
					var iterateTo = (scope.page+1)*scope.numberPerPage;
					var iterateTo = (iterateTo < scope.modelAll.length)? iterateTo : scope.modelAll.length;
					for (var i = iterateFrom; i < iterateTo; ++i) {
						scope.model.push(scope.modelAll[i]);
					}
				};

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

				console.log('querying with page size: ' + scope.numberPerPage);
				$http({
					method : 'POST',
					url: '/portalapi/getByTags',
					data: {
						tags: scope.data.data.tags,
						skip: 0,
						limit: null
					}
				})
				.success(function(data, status, headers, config){
					if (data && data.length > 0) {
						scope.modelAll = [];
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
							scope.modelAll.push(articleData);
						}
						scope.refreshPage();
					}
				}).error(function(err) {
					notificationFactory.error(err);
				});

				scope.navigate = function(aid) {
					$location.path('/portal/edit/' + aid);
					//$route.updateParams({id: aid});
				};

				log.groupEnd();
			}
		};
	}]);

}(window.angular));


