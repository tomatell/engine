module.exports = {
	express: {
		all: {
			options: {
				script: 'build/server/server.js',
				output: 'server listening at',
				// Because logger in the NDOE_ENV=test is silent, after delay the server is considered as running
				delay: 5000
			}
		}
	}
};
