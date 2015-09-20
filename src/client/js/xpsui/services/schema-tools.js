(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	/**
	 * @class xpsui:SchemaTools
	 * @module client
	 * @submodule services
	 */
	.factory('xpsui:SchemaTools', ['$http', '$q', 'xpsui:safeUrlEncoder', 'xpsui:Errors', function($http, $q, urlEncoder, errors) {
		var SchemaTools = function() {
		};

		/**
		 * Get compiled schema from server
		 *
		 * @param {string} schema - identifier/uri of schema
		 *
		 * @return {promise} if resolved, it returns schema object
		 */
		SchemaTools.prototype.getSchema = function(schema) {
			// FIXME unit tests
			var p = $q.defer();

			var url = '/schema/compiled/'.concat(this.encodeUri(schema));

			$http({
				url: url,
				method: 'GET'
			}).then(function(r) {
				//success
				p.resolve(r.data);
			}, function(r) {
				//failure
				p.reject(errors.resolveHttpError(r));
			});
			return p.promise;
		};

		/**
		 * Get object from server
		 *
		 * @param {string} schema unencoded
		 * @param {string} id of object
		 *
		 * @return {promise} if resolved, it returns id of object
		 */
		SchemaTools.prototype.getBySchema = function(schema, id, fields) {
			//FIXME unit tests
			//FIXME all chain (server) has to be finished to use fields
			var p = $q.defer();

			var url = '/udao/getBySchema/'.concat(
						this.encodeUri(schema), '/',
						id);

			if (fields) {
				url.concat(this.encodeUri('/'.concat(fields)));
			}

			$http({
				url: url,
				method: 'GET'
			}).then(function(r) {
				// success
				p.resolve(r.data);
			}, function(r) {
				// failure
				p.reject(errors.resolveHttpError(r));
			});

			return p.promise;
		};

		/**
		 * Save object to server
		 *
		 * @param {string} schema unencoded
		 * @param {object} obj - object to save
		 *
		 * @return {promise}
		 */
		SchemaTools.prototype.saveBySchema = function(schema, obj) {
			//FIXME unit tests
			var p = $q.defer();

			var url = '/udao/saveBySchema/'.concat(this.encodeUri(schema));

			$http({
				url: url,
				method:	'PUT',
				data: obj
			}).then(function(r) {
				// success
				p.resolve(r.data);
			}, function(r) {
				// failure
				p.reject(errors.resolveHttpError(r));
			});

			return p.promise;
		};
		/**
		 * Encodes uri by safe encoder
		 */
		SchemaTools.prototype.encodeUri = function(uri) {
			return urlEncoder.encode(uri);
		};

		/**
		 * Decode uri by safe decoder
		 */
		SchemaTools.prototype.decodeUri = function(uri) {
			return urlEncoder.decode(uri);
		};

		return new SchemaTools();
	}]);
}(window.angular));
