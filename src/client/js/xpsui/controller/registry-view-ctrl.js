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
		function($scope, $routeParams, $http, $location, $parse, schemaUtils, notificationFactory, objectTools) {
			//$scope.currentSchema = 'uri://registries/' + $routeParams.schema;
			$scope.currentSchema = $routeParams.schema;
			$scope.currentId = $routeParams.id;
			//$scope.currentSchemaUri = schemaUtils.decodeUri('uri://registries/' + $routeParams.schema);
			$scope.currentSchemaUri = schemaUtils.decodeUri($routeParams.schema);

			$scope.model = {};
			$scope.model.obj = {};

			$scope.schemaFormOptions = {
				modelPath: 'model.obj',
				schema: {}
			};

			$scope.fragmentedUpdateAllowed = false;

			var schemaUri = schemaUtils.decodeUri($scope.currentSchema);

			$scope.save = function(path) {
				$scope.$broadcast('xpsui:data-unstable');
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

				$http({url: '/udao/saveBySchema/' + schemaUtils.encodeUri(schemaUtils.concatUri($scope.currentSchemaUri, 'view')), method: 'PUT', data: d})
				.then(function() {
					$http({
						method: 'GET',
						url: '/udao/getBySchema/' + schemaUtils.encodeUri(schemaUtils.concatUri(schemaUri, 'view')) + '/' + $scope.currentId
					}).then(function(resp) {
						schemaUtils.generateObjectFromSchema($scope.schemaFormOptions.schema, $scope.model.obj);
						$scope.model.obj = resp.data;

						$scope.$broadcast('xpsui:data-stable');
					}, function(resp) {
						// error
						// TODO fix error handling
						notificationFactory.error(resp.data);
					});
					notificationFactory.info({translationCode: 'registry.succesfully.saved', time: 3000});
				}, function(resp) {
					// error
					function warnByFieldFunc(fieldError) {
						notificationFactory.warn({translationCode: fieldError.c, translationData: fieldError.d, time: 3000});
					}

					if (resp.status === 400) {
						for(var item in resp.data) {
							resp.data[item].map(warnByFieldFunc);
						}

					} else {
						notificationFactory.error({translationCode: 'registry.unsuccesfully.saved', time: 3000});
					}
				});
			};

			$scope.$on('xpsui:model_changed', function(evt, path) {
				$scope.save(path);
			});

			schemaUtils.getCompiledSchema(schemaUri, 'view')
			.then(function(resp) {
				$scope.schemaFormOptions.schema = resp.data;
				$scope.fragmentedUpdateAllowed = resp.data.fragmentedUpdateAllowed;

				$http({method: 'GET', url: '/udao/getBySchema/' + schemaUtils.encodeUri(schemaUtils.concatUri(schemaUri, 'view')) + '/' + $scope.currentId})
				.then(function(resp2) {
					schemaUtils.generateObjectFromSchema($scope.schemaFormOptions.schema, $scope.model.obj);
					$scope.model.obj = resp2.data;
					$scope.$broadcast('xpsui:data-stable');
				}, function(resp2) {
					notificationFactory.error(resp2.data);
				});
			// FIXME missing error part
			});
		}
	]);
}(window.angular));
