(function() {
	'use strict';

	var consts = require('./../SchemaConstants.js');
	var log = require('./../logging.js').getLogger('manglers/NumberMangler.js');
	var objectTools = require(process.cwd() + '/build/server/ObjectTools.js');

	function NumberMangler() {
	}

	NumberMangler.prototype.mangle = function(ctx, objFragment, schemaFragment, objPath, callback) {
		log.silly('NumberMangler mangler start for %s', objPath);

		if (!objFragment || !schemaFragment || !schemaFragment[consts.TYPE_KEYWORD] || schemaFragment[consts.TYPE_KEYWORD] !== consts.TYPE_NUMBER) {
			log.silly('Nothing to mangle');
			return callback(null, null);
		}

		objFragment = '' + objFragment;
		objFragment = objFragment.replace(' ', '');
		objFragment = objFragment.replace(',', '.');

		if (isNaN(objFragment)) {
			log.debug('This is not number %s', objFragment);
			return callback(null, {f: objPath, c: 'validation.field.not.number', d: objFragment});
		}

		objectTools.setValue(ctx.o, objPath, Number(objFragment));
		log.debug('NumberMangler mangling finished for %s', objPath);
		return callback();

	};

	module.exports = function() {
		return new NumberMangler();
	};
}());
