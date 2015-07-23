module.exports = function (grunt) {
	'use strict';
	grunt.registerTask('integrationTest', ['env:test', 'build', 'mochaTest:integration']);
};
