(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	/**
	 * Every function call requires context. Context should contain all necessary data
	 * for action
	 *
	 * Mandatory fields are:
	 * scope - angular scope
	 * model - shortcut to model
	 * args - function arguments defined in schema
	 * local - local scope for eval
	 * All functions can return promise. Safest way how to call function is thrue
	 * invoke method.
	 */
	.factory('xpsui:StandardActions', [
		'$q', 'xpsui:Errors', '$location', 'xpsui:SchemaTools', '$interpolate',
		function(q, errors, $location, schemaTools, $interpolate) {
			var StandardActions = function() {
			};

			StandardActions.prototype.invoke = function(funcName, ctx) {
				var p = q.defer();

				if (this[funcName]) {
					var self = this;
					q.when(self[funcName].call(self, (ctx)),
						function(r) {
							p.resolve(r);
						}, function(r) {
							p.reject(errors.unhandled(r));
						});

					return p.promise;
				}

				return q.reject();
			};

			StandardActions.prototype.multiSerial = function(ctx) {
				var p = q.defer();

				var actionsLeft = ctx.args.actions.slice();

				var self = this;
				function runOne(action, local) {
					if (action.func) {
						var localCtx = {
							scope: ctx.scope,
							args: action.args,
							local: local
						};

						self.invoke(action.func, localCtx).then(function(r) {
							if (actionsLeft.length > 0) {
								runOne(actionsLeft.shift(), r);
							} else {
								// nothing left we are done
								p.resolve(r);
							}
						}, function(r) {
							// failure
							p.reject(errors.unhandled(r));
						});
					}
				}

				runOne(actionsLeft.shift(), {});

				return p.promise;
			};

			/**
			 * Navigates to provided path. Path is interpolated by shole context so
			 * it can work with all required fields of scope, model, args and local (return value of previous function);
			 */
			StandardActions.prototype.navigate = function(ctx) {
				var urlDef = ctx.args.url;

				var url = $interpolate(urlDef)(ctx);

				$location.path(url);

				return q.reject();
			};

			/**
			 * Executes particular function defined in scope.
			 *
			 * ctx.args
			 * - func: name of function
			 */
			StandardActions.prototype.execScopeFunc = function(ctx) {
				if (!(ctx.args && ctx.args.func)) {
					return q.reject(errors.byCode(errors.INTERNAL_ERROR, {mgs: 'Function name not defined'}));
				}

				var funcName = ctx.args.func;

				if (ctx.scope && typeof ctx.scope[funcName] === 'function') {
					var p = q.defer();

					// TODO allow to pass parameters, use apply or call to invoke function #103744560
					q.when(ctx.scope[funcName]()).then(
						function(r) {
							p.resolve(r);
						}, function(r) {
							p.reject(r);
						}
					);
					return p.promise;
				} else {
					return q.reject(errors.byCode(errors.INTERNAL_ERROR, {mgs: 'Function does not exist'}));
				}
			};

			return new StandardActions();
		}]);
}(window.angular));
