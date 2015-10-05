(function(angular) {
	'use strict';

	/**
	 * Escapes uri to form acceptable as part of http query string.
	 *
	 * @module client
	 * @submodule xpsui:filters
	 * @class filter:xpsuiuriescape
	 */
	angular.module('xpsui:filters')
	.filter('xpsuiuriescape', ['xpsui:SchemaUtil', function(schemaUtilFactory) {
		return function(data) {return schemaUtilFactory.encodeUri(data); };
	}]);
}(window.angular));
// CODEREVIEW 20150920 f08a9164b6874a79ca27ce0170e4f2e40b16be6b starekp
