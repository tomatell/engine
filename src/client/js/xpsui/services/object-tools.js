(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.factory('xpsui:ObjectTools', [function() {
		function ObjectTools() {
		}

		ObjectTools.prototype.getSchemaFragmentByObjectPath = function(schema, path) {
			if (!schema) {
				// no schema
				return undefined;
			}

			if (!path || !path.length || path.length < 1) {
				// no relevant path
				return undefined;
			}

			var propertiesFragment;

			if (schema.type === 'array') {
				// it is array def
				propertiesFragment = schema.items;
			} else {
				// we assume schemafragment is object def
				propertiesFragment = schema.properties;
			}

			if (!propertiesFragment) {
				return undefined;
			}

			var dotPosition = path.indexOf('.');
			if (dotPosition > -1) {
				// there is another fragment
				var pathPropName = path.substring(0, dotPosition);
				return this.getSchemaFragmentByObjectPath(propertiesFragment[pathPropName], path.substring(dotPosition + 1));
			} else {
				// this is final fragment
				return propertiesFragment[path];
			}
		};

		// Updates provided obj to contain path that is set to value
		// if obj is null it creates new empty object
		// if is path fragment valid number and that path is not in defined, it creates array
		// ATTENTION: this function updates object directly, so obj will be modified
		ObjectTools.prototype.setObjectFragment = function(obj, path, value) {
			if (!path) {
				// if there is no path, return value directly
				return value;
			}

			path = path.replace(/\.*$/, '').replace(/^\.*/, '');

			var components = path.split('.');
			var i;
			var r = obj || {};
			var f = r;
			var compName;

			for (i = 0; i < components.length; ++i) {
				compName = components[i];
				if (compName.length < 1) {
					continue;
				}
				if (i === components.length - 1) {
					f[compName] = value;
				} else {
					if (f.hasOwnProperty(compName)) {
						f = f[compName];
					} else {
						if (isNaN(components[i + 1])) {
							f = f[compName] = {};
						} else {
							// it is array path component
							f = f[compName] = [];
						}
					}
				}
			}

			return r;
		};

		return new ObjectTools();
	}]);
}(window.angular));
