module.exports = function (grunt) {
	'use strict';
	grunt.registerTask('test', ['env:test', 'build', 'x', 'mochaTest:unitServer', 'mochaTest:unitShared', 'karma', /* 'express', 'e2e:tests', 'smoke:tests'*/]);
};
