module.exports = function (grunt) {
	'use strict';
	grunt.registerTask('portal', ['uglify:xpsui', 'build:server', 'build:client']);
};
