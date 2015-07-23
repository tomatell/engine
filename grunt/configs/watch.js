module.exports = {
	watch: {
		server: {
			files: ['src/server/**'],
			tasks: ['build:server']
		},
		client: {
			files: ['src/client/html/**', 'src/client/css/**', 'src/client/js/**', 'src/client/img/**','src/client/partials/**', 'src/client/fonts/**'],
			tasks: ['build:client']
		},

		schemas: {
			files: ['src/shared/schemas/**'],
			tasks: ['build:schemas']
		},
		sharedJs: {
			files: ['src/shared/js/**'],
			tasks: ['build:server', 'build:client']
		},
		sass: {
			files: ['src/client/scss/**'],
			tasks: ['sass:compile']
		},
		x: {
			files: ['src/client/**'],
			tasks: ['x']
		},
		portal: {
			files: ['src/**'],
			tasks: ['portal']
		}
	}
};
