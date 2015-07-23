module.exports = function(grunt) {
	'use strict';
	grunt.registerTask('x', ['copy:x', 'sass:x', 'uglify']);
};
