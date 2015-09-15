(function(angular) {
	'use strict';

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

	angular.module('xpsui:services')
		.factory('xpsui:Calculator:ComputationRegistry', [
			'$q',
			'xpsui:logging',
			'xpsui:SchemaTools', function(q, log, schemaTools) {

				// TODO: Move this to the shared and import it here with require()
				// This will be exported as shared library for the server and browser
				// when the browserify will work
				return 	{

					/**
					 * Default noop function
					 *
					 * @param {*} args
					 * @returns {*}
					 */
					noop: function(args) { return args; },

					/**
					 * Concat all values from args - keys are sorted, before concatenation
					 *
					 * @param {object|array} args
					 * @returns {string}
					 */
					concat: function(args) {
						var keys = Object.keys(args).sort(),
							result = '';
						for (var i = 0; i < keys.length; i++) {
							result = result.concat(args[keys[i]]);
						}
						return result;
					},

					/**
					 * Get value from the scope object
					 *
					 * @param {object|array} args Args must be an object with "path" property
					 * @param {object} scope
					 * @param {*} def
					 * @returns {*}
					 */
					'get': function(args, scope, def) {
						var keys = Object.keys(args).sort();
						var path = args[keys[0]];

						return dotAccess(scope, path, def);
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
					getFrom: function(args, scope, def) {
						var path = args.path;
						var local = args.obj;

						return dotAccess(local, path, def);
					},

					/**
					 * Returns a substring of the first argument, with start as second argument and
					 * optional length as third argument
					 *
					 * @param {object|array} args
					 * @returns {string}
					 */
					substr: function(args) {
						var keys = Object.keys(args).sort();

						var string = args[keys[0]],
							start = args[keys[1]],
							length;

						if (keys[2]) {
							length = args[keys[2]];
						}

						return string.substr(start, length);
					},

					/**
					 * Returns a result of the first argument modulo second argument
					 *
					 * @param {object|array} args
					 * @returns {number}
					 */
					mod: function(args) {
						var keys = Object.keys(args).sort();
						var first = args[keys[0]],
							second = args[keys[1]];

						return first % second;
					},

					/**
					 * Returns a string of the first argument, where search as second argument
					 * is replaced by value as third argument
					 *
					 * @param {object|array} args
					 * @returns {string}
					 */
					replace: function(args) {
						var keys = Object.keys(args).sort();

						var string = args[keys[0]],
							search = args[keys[1]],
							value = args[keys[2]];

						return string.replace(search, value);
					},

					/**
					 * Returns a second argument when conditional as first argument is true else
					 * third argument is returned
					 *
					 * @param {object|array} args
					 * @returns {*}
					 */
					'if': function(args) {
						var keys = Object.keys(args).sort();

						var condition = args[keys[0]],
							first = args[keys[1]],
							second = args[keys[2]];

						return condition ? first : second;
					},

					/**
					 * Returns a length of the first argument
					 *
					 * @param {object|array} args
					 * @returns {number}
					 */
					length: function(args) {
						var keys = Object.keys(args).sort();

						var first = args[keys[0]];

						return first.length;
					},

					/**
					 * Returns true when first argument is equal to the second argument
					 *
					 * @param {object|array} args
					 * @returns {boolean}
					 */
					eq: function(args) {
						var keys = Object.keys(args).sort();

						var first = args[keys[0]],
							second = args[keys[1]];

						return first === second;
					},

					/**
					 * Returns true when first argument is greater then second argument
					 *
					 * @param {object|array} args
					 * @returns {boolean}
					 */
					gt: function(args) {
						var keys = Object.keys(args).sort();

						var first = args[keys[0]],
							second = args[keys[1]];

						return first > second;
					},

					/**
					 * Returns true when first argument is greater or equal to the second argument
					 *
					 * @param {object|array} args
					 * @returns {boolean}
					 */
					gte: function(args) {
						var keys = Object.keys(args).sort();

						var first = args[keys[0]],
							second = args[keys[1]];

						return first >= second;
					},

					/**
					 * Returns true when first argument is less then second argument
					 *
					 * @param {object|array} args
					 * @returns {boolean}
					 */
					lt: function(args) {
						var keys = Object.keys(args).sort();

						var first = args[keys[0]],
							second = args[keys[1]];

						return first < second;
					},

					/**
					 * Returns true when first argument is less or equal to the second argument
					 *
					 * @param {object|array} args
					 * @returns {boolean}
					 */
					lte: function(args) {
						var keys = Object.keys(args).sort();

						var first = args[keys[0]],
							second = args[keys[1]];

						return first <= second;
					},

					/**
					 * Returns true when first argument and the second argument are true
					 *
					 * @param {object|array} args
					 * @returns {boolean}
					 */
					and: function(args) {
						var keys = Object.keys(args).sort();

						var first = args[keys[0]],
							second = args[keys[1]];

						return first && second;
					},

					/**
					 * Returns true when first argument or the second argument are true
					 *
					 * @param {object|array} args
					 * @returns {boolean}
					 */
					or: function(args) {
						var keys = Object.keys(args).sort();

						var first = args[keys[0]],
							second = args[keys[1]];

						return first || second;
					},

					/**
					 * Returns string as first argument padded to size as second argument with
					 * values as third argument
					 *
					 * @param {object|array} args
					 * @returns {string}
					 */
					pad: function(args) {
						var keys = Object.keys(args).sort();

						var string = args[keys[0]] + '', // Convert to string
							size = args[keys[1]],
							fill = '0';

						if (keys[2]) {
							fill = args[keys[2]];
						}

						while (string.length < size) {
							string = fill + string;
						}

						return string;
					},
					/**
					 * gets data from server as objectlink
					 *
					 * args.objectId - id of object to get
					 * args.schemaUri - to use
					 * args.fields - see objectlink
					 * @param {object} args
					 */
					getAsObjectLink: function(args) {
						log.trace('getAsObjectLink func');
						var id = args.objectId,
							schema = args.schemaUri,
							fields = args.fields;

						if (!schema) {
							log.error('Schema is not defined');
						}

						if (!id) {
							log.trace('No id provided');
							return null;
						}

						var p = q.defer();

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
			}])

		.factory('xpsui:Calculator:ComputedProperty', [ '$q', 'xpsui:Calculator:ComputationRegistry', function(q, computationRegistry) {

			// TODO: Move this to the shared and import it here with require()

			/**
			 * Constructor for the ComputedProperty
			 *
			 * ```js
				{
					"onlyEmpty": false,                   // If true - modify model only if the current model value is undefined or ""
					"func": "concat",                     // Function from "xpsui:Calculator:ComputationRegistry",
					"args": {                             // {array|object} - based on the requirements of the function from ComputationRegistry
						1: "Ing.",                        // Arguments can be strings
							2: {                          // or another computation
								"func": "get",
								"args": {
								"path": "baseData.name"
							}
						}
					}
				}
			 * ```
			 * @param schema
			 * @constructor
			 */
			function ComputedProperty(schema) {
				this.schema = schema;
			}

			/**
			 * Getter function
			 *
			 * @param scope
			 * @returns {*}
			 */
			ComputedProperty.prototype.getter = function(scope) {
				var computationFunc = computationRegistry[this.schema.func] || computationRegistry.noop;

				// Check arguments
				var args = {},
					self = this;

				for (var argName in this.schema.args) {
					if (!this.schema.args.hasOwnProperty(argName)) {
						continue;
					}

					var arg = this.schema.args[argName];

					if (typeof arg === 'object') {
						var argProperty = new ComputedProperty(arg);
						args[argName] = argProperty.getter(scope);
					} else {
						args[argName] = arg; //q.when(arg);
					}
				}

				return q.all(args).then(function(results) {
					return computationFunc(results, scope, self.schema.def);
				});
			};

			ComputedProperty.prototype.watcher = function(scopeGetter, angScope) {
				var self = this;

				function collect(subschema) {
					var scope;
					if (typeof scopeGetter === 'function') {
						scope = scopeGetter(angScope);
					} else {
						scope = scopeGetter;
					}

					var result = [];
					for (var argName in subschema.args) {
						if (!subschema.args.hasOwnProperty(argName)) {
							continue;
						}

						var arg = subschema.args[argName];
						// Ignore scalar arguments and arguments without watch property set to 'true'
						if (typeof arg !== 'object') {
							continue;
						}

						if (arg.func === 'get') {
							// Only if watch === true
							if (arg.watch === true) {
								result.push(dotAccess(scope, arg.args.path, arg.def));
							}
						} else if (arg.args) {
							result = result.concat(collect(arg));
						}
					}

					return result;
				}

				return function() {
					return collect(self.schema);
				};
			};

			return ComputedProperty;

		}])

		.factory('xpsui:Calculator', ['xpsui:Calculator:ComputedProperty', function(ComputedProperty) {
			return {
				/**
				 * Create new instance of the ComputedProperty
				 *
				 * @param {object} schema
				 * @returns {ComputedProperty}
				 */
				createProperty: function(schema) {
					return new ComputedProperty(schema);
				}
			};
		}]);

}(window.angular));
