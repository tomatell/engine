module.exports = function(grunt) {
	'use strict';
	grunt.registerTask('build:schemas', ['copy:schemas']);
	grunt.registerTask('build:server', ['build:schemas', 'copy:server','copy:templates','copy:ssl', 'copy:sharedJsServer']);
	grunt.registerTask('build:client', ['build:schemas', 'copy:html','copy:htmlpartials', 'copy:css', 'copy:js', 'copy:img', 'copy:fonts', 'sass', 'copy:sharedJsClient']);
	grunt.registerTask('build', ['clean:build', 'build:client', 'copy:bower', 'build:server', 'build:schemas']);
};
