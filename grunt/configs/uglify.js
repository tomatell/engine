module.exports = {
	uglify: {
		xpsui: {
			options: {
				sourceMap: true,
				sourceMapIncludeSources: true,
				mangle:false
			},
			files: {
				'build/client/js/xpsui.min.js': [
					'src/client/js/xpsui/services-module.js', 'src/client/js/xpsui/services/*.js',
					'src/client/js/xpsui/directives-module.js', 'src/client/js/xpsui/directives/*.js',
					'src/client/js/xpsui/controllers-module.js', 'src/client/js/xpsui/controller/*.js',
					'src/client/js/xpsui/filters-module.js', 'src/client/js/xpsui/filters/*.js'
				]
			}
		},
		main: {
			options: {
				sourceMap: true,
				sourceMapIncludeSources: true,
				mangle:false
			},
			files: {
				'build/client/js/x-main.min.js': ['src/client/js/x-main.min.js', 'src/client/js/x-*.js']
			}
		}
	}
};
