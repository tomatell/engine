module.exports = function(grunt) {
	'use strict';
	grunt.loadNpmTasks('grunt-protractor-runner');
	grunt.loadNpmTasks('grunt-protractor-webdriver');
	grunt.registerTask('e2e', [ 'env:test', 'build', 'x', 'express', 'e2e:tests' ]);
	grunt.registerTask('e2e:tests', [ 'protractor:e2e-chrome', /*'protractor:e2e-firefox'*/ ]);
};
