(function(angular) {
	'use strict';

	angular.module('xpsui:controllers')
	.controller('xpsui:RegistryViewV2Ctrl', [
		'$scope',
		'$routeParams',
		'$http',
		'$location',
		'$parse',
		'xpsui:SchemaUtil',
		'xpsui:NotificationFactory',
		'xpsui:ObjectTools',
		function($scope, $routeParams, $http, $location, $parse, schemaUtils, notificationFactory, objectTools) {
			$scope.currentSchema = $routeParams.schema;
			$scope.currentId = $routeParams.id;
			$scope.currentSchemaUri = schemaUtils.decodeUri($routeParams.schema);

			$scope.model = {
				obj: {},
				actions: []
			};

			$scope.schemaFormOptions = {
				modelPath: 'model.obj',
				schema: {}
			};

			$scope.fragmentedUpdateAllowed = false;

			var schemaUri = schemaUtils.decodeUri($scope.currentSchema);

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

				$http({url: '/udao/saveBySchema/' + schemaUtils.encodeUri($scope.currentSchemaUri), method: 'PUT', data: d})
				.then(function() {
					$http({
						method: 'GET',
						url: '/udao/getBySchema/' + schemaUtils.encodeUri(schemaUri) + '/' + $scope.currentId
					}).then(function(resp) {
						schemaUtils.generateObjectFromSchema($scope.schemaFormOptions.schema, $scope.model.obj);
						$scope.model.obj = resp.data;
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

			schemaUtils.getCompiledSchema(schemaUri)
			.then(function(resp) {
				// schema load success
				$scope.schemaFormOptions.schema = resp.data;
				$scope.fragmentedUpdateAllowed = resp.data.fragmentedUpdateAllowed;

				if ($scope.schemaFormOptions.schema.actions
					&& angular.isArray($scope.schemaFormOptions.schema.actions)) {
					$scope.schemaFormOptions.schema.actions.map(function(i) {
						$scope.model.actions.push(i);
					});
				}

				$http({method: 'GET', url: '/udao/getBySchema/' + schemaUtils.encodeUri(schemaUri) + '/' + $scope.currentId})
				.then(function(resp2) {
					schemaUtils.generateObjectFromSchema($scope.schemaFormOptions.schema, $scope.model.obj);
					$scope.model.obj = resp2.data;
				}, function(resp2) {
					notificationFactory.error(resp2.data);
				});
			}, function(err) {
				// schema load failure
				// TODO do proper error handling, more user friendly
				notificationFactory.error(err);
			});
		}
	]);
}(window.angular));
