(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.provider('xpsui:config', [function() {

		var data = {};

		var Config = function(log) {
			this.log = log;
		};

		/*
		 * Read configured value for key. If key is not configured
		 * method returns undefined value.
		 */
		Config.prototype.get = function(key) {
			if (data.hasOwnProperty(key)) {
				return data[key];
			} else {
				this.log.warn('Requesting config for undefioned key ' + key);
				return undefined;
			}
		};

		/*
		 * Set value of configuration key
		 */
		Config.prototype.set = function(key, val) {
			data[key] = val;
		};

		return {
			set: function(key, value) {
				data[key] = value;
			},
			$get: ['xpsui:logging', function(logging) {
				return new Config(logging);
			}]
		};
	}]);
}(window.angular));
