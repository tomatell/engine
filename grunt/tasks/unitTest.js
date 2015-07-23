module.exports = function (grunt) {
	'use strict';
	grunt.registerTask('unitTest', ['env:test', 'mochaTest:unitServer', 'mochaTest:unitShared', 'karma']);
};
