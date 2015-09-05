(function(angular) {
	'use strict';

	angular.module('xpsui:controllers')
	.controller('xpsui:RegistryViewCtrl', [
		'$scope',
		'$routeParams',
		'$http',
		'$location',
		'$parse',
		'xpsui:SchemaUtil',
		'xpsui:NotificationFactory',
		'xpsui:ObjectTools',
		function($scope, $routeParams, $http, $location, $parse, schemaUtilFactory, notificationFactory, objectTools) {
			//$scope.currentSchema = 'uri://registries/' + $routeParams.schema;
			$scope.currentSchema = $routeParams.schema;
			$scope.currentId = $routeParams.id;
			//$scope.currentSchemaUri = schemaUtilFactory.decodeUri('uri://registries/' + $routeParams.schema);
			$scope.currentSchemaUri = schemaUtilFactory.decodeUri($routeParams.schema);

			$scope.model = {};
			$scope.model.obj = {};

			$scope.schemaFormOptions = {
				modelPath: 'model.obj',
				schema: {}
			};

			$scope.fragmentedUpdateAllowed = false;

			var schemaUri = schemaUtilFactory.decodeUri($scope.currentSchema);

			$scope.save = function(path) {
				var d = $scope.model.obj;

				if (path && $scope.fragmentedUpdateAllowed) {
					var v = $parse(path)($scope);
					if (angular.isUndefined(v) || v == null || Object.getOwnPropertyNames(v).length === 0) {
						v = null;
					}
					d = objectTools.setObjectFragment(
						{id: $scope.model.obj.id},
						path.replace($scope.schemaFormOptions.modelPath + '.', ''),
						v);
				}

				$http({url: '/udao/saveBySchema/' + schemaUtilFactory.encodeUri(schemaUtilFactory.concatUri($scope.currentSchemaUri, 'view')), method: 'PUT', data: d})
				.success(function() {
					$http({
						method: 'GET',
						url: '/udao/getBySchema/' + schemaUtilFactory.encodeUri(schemaUtilFactory.concatUri(schemaUri, 'view')) + '/' + $scope.currentId
					}).success(function(data) {
						schemaUtilFactory.generateObjectFromSchema($scope.schemaFormOptions.schema, $scope.model.obj);
						$scope.model.obj = data;
					}).error(function(err) {
						notificationFactory.error(err);
					});
					notificationFactory.info({translationCode: 'registry.succesfully.saved', time: 3000});
				})
				.error(function(data, status) {
					function warnByFieldFunc(fieldError) {
						notificationFactory.warn({translationCode: fieldError.c, translationData: fieldError.d, time: 3000});
					}

					if (status === 400) {
						for(var item in data.error) {
							data.error[item].map(warnByFieldFunc);
						}

					} else {
						notificationFactory.error({translationCode: 'registry.unsuccesfully.saved', time: 3000});
					}
				});
			};

			$scope.$on('xpsui:model_changed', function(evt, path) {
				$scope.save(path);
			});

			schemaUtilFactory.getCompiledSchema(schemaUri, 'view')
			.success(function(data) {
				$scope.schemaFormOptions.schema = data;
				$scope.fragmentedUpdateAllowed = data.fragmentedUpdateAllowed;

				$http({method: 'GET', url: '/udao/getBySchema/' + schemaUtilFactory.encodeUri(schemaUtilFactory.concatUri(schemaUri, 'view')) + '/' + $scope.currentId})
				.success(function(data2) {
					schemaUtilFactory.generateObjectFromSchema($scope.schemaFormOptions.schema, $scope.model.obj);
					$scope.model.obj = data2;
				}).error(function(err) {
					notificationFactory.error(err);
				});

			});
		}
	]);
}(window.angular));
