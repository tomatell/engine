'use strict';

var log = require('./logging.js').getLogger('TemplateRegistry.js');
var extend = require('extend');

var DEFAULT_CFG = {};

var fs = require('fs');

function TemplateRegistry(options) {

	this.cfg = extend(true, {}, DEFAULT_CFG, options);
	this.templateMap = {};
	this.blockMap = {};

	this.load();
}

TemplateRegistry.prototype.load = function() {
	var self = this;
	this.cfg.templateList.map(function(item) {
		log.info('Loading template', item);
		var content = fs.readFileSync(item, 'utf8');
		var contentObject = JSON.parse(content);

		self.templateMap[contentObject.name] = contentObject;
	});

	this.cfg.blockList.map(function(item) {
		log.info('Loading block', item);
		var content = fs.readFileSync(item, 'utf8');
		var contentObject = JSON.parse(content);

		self.blockMap[contentObject.meta.name] = contentObject;
	});
};

TemplateRegistry.prototype.getAllTemplates = function(req, res) {
	res.send(this.templateMap);
};

TemplateRegistry.prototype.getAllBlocks = function(req, res) {
	res.send(this.blockMap);
};

module.exports = {
	TemplateRegistry: TemplateRegistry
};
