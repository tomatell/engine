module.exports = function(grunt) {
	'use strict';
	grunt.registerTask('mrproper', ['clean', '_clean:node_modules', '_clean:bower_components', '_clean:coverage']);
};
