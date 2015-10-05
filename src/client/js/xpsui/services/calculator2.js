(function(angular) {
	'use strict';

	/**
	 * local constants
	 */
	var consts = {
		PROP_FUNC: 'func'
	};


	angular.module('xpsui:services')
	.factory('xpsui:calculator2', ['$q', 'xpsui:logging', 'xpsui:SchemaTools', function($q, log, schemaTools) {
		/**
		 * Easy object access using dot notation
		 *
		 * TODO: Move this to some utils module
		 *
		 * @param obj
		 * @param key
		 * @param def
		 * @returns {*}
		 */
		function dotAccess(obj, key, def) {
			key = Array.isArray(key) ? key : key.split('.');
			for (var i = 0, l = key.length; i < l; i++) {
				var part = key[i];
				//FIXME this construction is probably not ok as it cannot return null nor false
				if (typeof obj === 'undefined' || obj === null) {
					return def;
				}
				if (!(part in obj)) {
					return def;
				}
				obj = obj[part];
			}
			return obj;
		}

		/**
		 * CTX:
		 * - scope: general scope, shall not be modified by function
		 * - model: shortcut to model, shall not be modified by function
		 * - local: temporary scope
		 *
		 */
		var CalcFuncs = {
			noop: function(ctx) {
				return ctx.args;
			},
			get: function(ctx) {
				if (ctx.args) {
					if (ctx.args.scopePath) {
						return dotAccess(ctx.scope, ctx.args.scopePath, ctx.args.default);
					} else if (ctx.args.modelPath) {
						return dotAccess(ctx.model, ctx.args.modelPath, ctx.args.default);
					} else if (ctx.args.localPath) {
						return dotAccess(ctx.local, ctx.args.localPath, ctx.args.default);
					} else {
						// FIXME wrap to psui error
						throw 'No path specified';
					}
				} else {
					// FIXME wrap to psui error
					throw 'No args provided';
				}
			},

			criterion: function(ctx) {
				var r = {
					f: ctx.args.f,
					op: ctx.args.op,
					v: ctx.args.v
				};

				if (ctx.args.nullIfEmpty && ctx.args.v === null) {
					return null;
				}

				return r;
			},

			criteriaList: function(ctx) {
				var r = [];

				for (var i in ctx.args) {
					if (ctx.args[i] !== null) {
						r.push(ctx.args[i]);
					}
				}

				return r;
			},

			/**
			 * Get value from object
			 *
			 * @param {object} args Args must be an object with "path" property and
			 * 			obj property
			 * @param {object} scope
			 * @param {*} def
			 * @returns {*}
			 */
			getFrom: function(ctx) {
				var path = ctx.args.path;
				var local = ctx.args.obj;

				return dotAccess(local, path, null);
			},
			/**
			 * gets data from server as objectlink
			 *
			 * args.objectId - id of object to get
			 * args.schemaUri - to use
			 * args.fields - see objectlink
			 * @param {object} args
			 */
			getAsObjectLink: function(ctx) {
				log.trace('getAsObjectLink func');
				var id = ctx.args.objectId,
					schema = ctx.args.schemaUri,
					fields = ctx.args.fields;

				if (!schema) {
					log.error('Schema is not defined');
				}

				if (!id) {
					log.trace('No id provided');
					return null;
				}

				var p = $q.defer();

				log.trace('getAsObjectLink func', schema, id);
				schemaTools.getBySchema(schema, id, fields).then(
					function(data) {
						log.trace(data);
						p.resolve(data);
					}, function(err) {
						log.trace(err);
						p.reject(err);
					}
				);

				return p.promise;
			}
		};

		var Ctx = function(scope, model) {
			this.scope = scope;
			this.model = model;
			this.local = {};
			this.args = {};
			this.parentCtx = null;
		};

		/**
		 * creates new context as copy of current ctx and binds
		 * 'this' ctx as it's nested context;
		 */
		Ctx.prototype.withArgs = function(args) {
			var r = new Ctx(this.scope, this.model);
			r.args = args;
			r.parentCtx = this;

			return r;
		};

		var Calculator = function(def) {
			this.def = def;
		};

		Calculator.prototype.execute = function(ctx, def) {
			var lDef;
			if (typeof def !== 'undefined') {
				lDef = def;
			} else {
				lDef = this.def;
			}
			var cFunc = CalcFuncs.noop;
			var lArgs = {};

			if (lDef && typeof lDef === 'object' && lDef.hasOwnProperty(consts.PROP_FUNC)) {
				// definition is calculation

				cFunc = CalcFuncs[lDef[consts.PROP_FUNC]];

				if (lDef.args && angular.isArray(lDef.args)) {
					lArgs = [];
					for (var e in lDef.args) {
						lArgs.push(this.execute(ctx.withArgs([]), lDef.args[e]));
					}
				} else {
					for (var a in lDef.args || {}) {
						if (lDef.args.hasOwnProperty(a)) {
							lArgs[a] = this.execute(ctx.withArgs({}), lDef.args[a]);
						}
					}
				}
			} else {
				// definition is not calculation
				return $q.when(lDef);
			}

			return $q.all(lArgs).then(function(pArgs) {
				return cFunc(ctx.withArgs(pArgs));
			});
		};

		return {
			createCalculator: function(def) {
				return new Calculator(def);
			},
			createCtx: function(scope, model) {
				return new Ctx(scope, model);
			}
		};
	}]);
}(window.angular));
