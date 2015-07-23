module.exports = function (grunt) {
	'use strict';
	grunt.registerTask('coverage', ['env:test', 'build', 'mocha_istanbul']);
};
