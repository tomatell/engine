module.exports = {
	copy: {
		html: {
			files: [
				{expand: true, cwd: 'src/client/html', src: ['**'], dest: 'build/client/'}
			]
		},

		htmlpartials: {
			files: [
				{expand: true, cwd: 'src/client/partials', src: ['**'], dest: 'build/client/partials'}
			]
		},

		css: {
			files: [
				{expand: true, cwd: 'src/client/css', src: ['**'], dest: 'build/client/css/'}
			]
		},
		js: {
			files: [
				{expand: true, cwd: 'src/client/js', src: ['**'], dest: 'build/client/js'}
			]
		},
		img: {
			files: [
				{expand: true, cwd: 'src/client/img', src: ['**'], dest: 'build/client/img'}
			]
		},
		fonts: {
			files: [
				{expand: true, cwd: 'src/client/fonts', src: ['**'], dest: 'build/client/fonts'}
			]
		},
		bower: {
			files: [
				{expand: true, cwd: 'bower_components', src: ['**'], dest: 'build/client/lib/'}
			]
		},
		server: {
			files: [
				{expand: true, cwd: 'src/server', src: ['**'], dest: 'build/server/'}
			]
		},
		templates: {
			files: [
				{expand: true, cwd: 'src/server/templates', src: ['**'], dest: 'build/server/templates'}
			]
		},
		ssl: {
			files: [
				{expand: true, cwd: 'util/ssl', src: ['**'], dest: 'build/server/ssl'}
			]
		},
		schemas: {
			files: [
				{expand: true, cwd: 'src/shared/schemas', src: ['**'], dest: 'build/shared/schemas'}
			]
		},
		sharedJsClient: {
			files: [
				{expand: true, cwd: 'src/shared/js', src: ['**'], dest: 'build/client/js'}
			]
		},
		sharedJsServer: {
			files: [
				{expand: true, cwd: 'src/shared/js', src: ['**'], dest: 'build/server'}
			]
		},
		x: {
			files: [
				{expand: true, cwd: 'src/client/partials', src: ['**/x-*'], dest: 'build/client/partials'},
				{expand: true, cwd: 'src/client/html', src: ['**/x-*'], dest: 'build/client/'}
			]
		}
	}
};
