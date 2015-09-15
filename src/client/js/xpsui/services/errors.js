(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	/**
	 * @class xpsui:Errors
	 * @module client
	 * @submodule services
	 */
	.factory('xpsui:Errors', [function() {

		/**
		 * Error class
		 */
		var PsuiError = function(code) {
			this.code = code;
		};

		/**
		 * Factory class for errors manipulation
		 */
		var Errors = function() {
		};

		Errors.prototype.codes = {
			SERVER_SIDE_UNRECOVERABLE_ERROR: 'SERVER_SIDE_UNRECOVERABLE_ERROR',
			UNKNOWN_STATE: 'UNKNOWN_STATE',
			GENERIC_ERROR: 'GENERIC_ERROR'};

		/**
		 * Evalueated http error and returns associated error object
		 */
		Errors.prototype.resolveHttpError = function() {
			// TODO handle all required errors like 500, 401
			return new PsuiError(this.codes.GENERIC_ERROR);
		};

		/**
		 * Returns error object defined by code
		 */
		Errors.prototype.ByCode = function(code) {
			// FIXME chceck if code exists and is registered
			return new PsuiError(code);
		};

		return new Errors();
	}]);
}(window.angular));

