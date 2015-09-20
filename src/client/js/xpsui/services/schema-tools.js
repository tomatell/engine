(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	/**
	 * Set of tools and utilities for schema based operations.
	 *
	 * @class service:xpsui:SchemaTools
	 * @module client
	 * @submodule services
	 */
	.factory('xpsui:SchemaTools', ['$http', '$q', 'xpsui:safeUrlEncoder', 'xpsui:Errors', function($http, $q, urlEncoder, errors) {
		var SchemaTools = function() {
		};

		/**
		 * Get compiled schema from server
		 *
		 * @method getSchema
		 * @param {string} schema identifier/uri of schema
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
		 * @method getBySchema
		 * @param {string} schema unencoded schema
		 * @param {string} id identifier of object
		 * @param [array] fields array of strings defining fields to retireve
		 *
		 * @return {promise} if resolved, it returns retrieved object
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
		 * @method saveBySchema
		 * @param {string} schema unencoded schema uri
		 * @param {object} obj object to save
		 *
		 * @return {promise} if resolved, returns saved object
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
		 *
		 * @method encodeUri
		 * @param {string} uri to encode
		 *
		 * @return {string} encoded uri
		 */
		SchemaTools.prototype.encodeUri = function(uri) {
			return urlEncoder.encode(uri);
		};

		/**
		 * Decode uri by safe decoder
		 *
		 * @method decodeUri
		 * @param {string} uri to decode
		 *
		 * @return {string} decoded uri
		 */
		SchemaTools.prototype.decodeUri = function(uri) {
			return urlEncoder.decode(uri);
		};

		return new SchemaTools();
	}]);
}(window.angular));
// CODEREVIEW 20150920 f08a9164b6874a79ca27ce0170e4f2e40b16be6b starekp
