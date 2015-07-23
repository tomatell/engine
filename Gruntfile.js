var path = require('path');
var extend = require('extend');

module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.loadTasks(path.join(__dirname, 'grunt', 'tasks'));
	var config = require(path.join(__dirname, 'grunt', 'configs'));
	grunt.initConfig(config);
};
