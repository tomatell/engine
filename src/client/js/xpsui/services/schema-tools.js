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
		 * get object from server
		 * @param {string} schema unencoded
		 * @param {id} id of object
		 */
		SchemaTools.prototype.getBySchema = function(schema, id, fields) {
			//FIXME unit tests
			//FIXME all chain has to be finished to use fields
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
				if (r.status === 200) {
					p.resolve(r.data);
				} else {
					p.reject(errors.byCode(errors.codes.UNKNOWN_STATE));
				}
			},
			function(r) {
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
