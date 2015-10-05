(function(angular) {
	'use strict';

	/**
	 * Prefixes url (any string) with http:// prefix it is not already prefixed
	 * by http:// or https:// prefix.
	 *
	 * @module client
	 * @submodule xpsui:filters
	 * @class filter:httpPrefixed
	 */
	angular.module('xpsui:filters')
	.filter('httpPrefixed', function() {
		return function(value) {
			if (value && (value.toLowerCase().startsWith('http://') ||
				value.toLowerCase().startsWith('https://'))) {
				return value;
			}

			return 'http://' + value;
		};
	});
}(window.angular));
// CODEREVIEW 20150920 f08a9164b6874a79ca27ce0170e4f2e40b16be6b starekp
