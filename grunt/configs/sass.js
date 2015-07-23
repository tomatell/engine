module.exports = {
	sass: {
		compile: {
			options: {
				unixNewlines: true
			},
			files: [{
				expand: true,
				cwd: 'src/client/scss/',
				src: ['main.scss'],
				dest: 'build/client/css/',
				ext: '.css'
			}]
		},
		bootstrap: {
			options: {
				unixNewlines: true
			},
			files: [{
				expand: true,
				cwd: 'src/client/scss/',
				src: ['bootstrap.scss'],
				dest: 'build/client/css/',
				ext: '.css'
			}]
		},
		x: {
			options: {
				unixNewlines: true
			},
			files: {
				'build/client/css/x-main.css': 'src/client/scss/x-main.scss',
				'build/client/css/x.css': 'src/client/scss/x/x.scss',
				'build/client/css/x-default.css': 'src/client/scss/x/default/default.scss'
			}
		}
	}
};
