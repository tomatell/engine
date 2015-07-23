module.exports = function(grunt) {
	'use strict';

	grunt.renameTask('clean', '_clean');
	grunt.registerTask('clean', ['_clean:build']);
	
};
