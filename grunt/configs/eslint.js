module.exports = {
	eslint: {
		server: {
			src: ['src/server/SchemaConstants.js',
				'src/server/config.js',
				'src/server/SchemaTools.js',
				'src/server/templateRegistry.js']
		},
		client: {
			src: ['src/client/js/xpsui/filters/*.js',
				'src/client/js/xpsui/services/form-generator.js',
				'src/client/js/xpsui/directives/objectlink2-edit.js',
				'src/client/js/xpsui/services/config.js',
				'src/client/js/xpsui/controller/registry-view-ctrl.js',
				'src/client/js/xpsui/services/schema-tools.js',
				'src/client/js/xpsui/services/object-tools.js']
		},
		tests: {
			src: ['tests/unit/server/SchemaTools.js']
		}
	}
};
