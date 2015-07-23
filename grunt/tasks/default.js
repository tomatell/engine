module.exports = function (grunt) {
	'use strict';
	grunt.registerTask('default', ['build', 'x', 'unitTest', 'dataVersionCheck', 'eslint']);
};
