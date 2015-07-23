module.exports = {
	mochaTest: {
		unitServer: {
			options: {
				reporter: 'spec'
			},
			src: ['tests/unit/server/**/*']
		},
		unitShared: {
			options: {
				reporter: 'spec'
			},
			src: ['tests/unit/shared/**/*']
		},
		integration: {
			options: {
				reporter: 'spec'
			},
			src: ['tests/integration/**/*']
		}
	}
};
