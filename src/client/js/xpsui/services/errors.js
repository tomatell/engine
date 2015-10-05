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
			this.meta = null;
		};

		/**
		 * Factory class for errors manipulation
		 */
		var Errors = function() {
		};

		Errors.prototype.codes = {
			SERVER_SIDE_UNRECOVERABLE_ERROR: 'SERVER_SIDE_UNRECOVERABLE_ERROR',
			UNKNOWN_STATE: 'UNKNOWN_STATE',
			ILLEGAL_STATE: 'ILLEGAL_STATE',
			INTERNAL_ERROR: 'INTERNAL_ERROR',
			GENERIC_ERROR: 'GENERIC_ERROR',
			UNKNOWN_ERROR: 'UNKNOWN_ERROR'};

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
		Errors.prototype.byCode = function(code) {
			// FIXME chceck if code exists and is registered
			return new PsuiError(code);
		};

		/**
		 * Return UNKNOWN error with wrapped error in meta property.
		 *
		 * Should be used to wrap unhandle errors from underalaying system
		 */
		Errors.prototype.unhandled = function(err) {
			var e = new PsuiError(this.codes.UNKNOWN_ERROR);
			this.meta = err;
			return e;
		};

		return new Errors();
	}]);
}(window.angular));

