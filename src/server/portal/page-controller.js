/* jshint node:true */
'use strict';

var log = require('../logging.js').getLogger('page-controller.js');
var config = require('../config.js');
var QueryFilter = require('../QueryFilter.js');
var universalDaoModule = require('../UniversalDao.js');
var schemaRegistryModule = require('../schemaRegistry.js');
var universalDaoServiceModule = require('../UniversalDaoService.js');
var swig = require('swig');
var path = require('path');
var request = require('request');
var fs = require('fs');
var objectTools = require('../ObjectTools.js');

var articlesCollection = 'portalArticles';
var menuCollection = 'portalMenu';

var async = require('async');

var pageController;

function safeExtract(obj, path, defaultVal) {
	function i(iObj, pathArr) {
		// function dives one level into obj and removes first element in array
		if(iObj && pathArr.length > 0) {
			var f = pathArr.shift();
			if (iObj.hasOwnProperty(f)) {
				return i(iObj[f], pathArr);
			} else {
				return undefined;
			}
		} else {
			return iObj;
		}
	}

	if (obj && path) {
		var v = i(obj, path.split('.'));
		if (v) {
			return v;
		} else {
			return defaultVal;
		}
	} else {
		return defaultVal;
	}
}



function PageController(mongoDriver) {
	this.mongoDriver = mongoDriver;

	this.menuDao = new universalDaoModule.UniversalDao(mongoDriver, {collectionName: menuCollection});
	this.articlesDao = new universalDaoModule.UniversalDao(mongoDriver, {collectionName: articlesCollection});
	this.competitionDao = new universalDaoModule.UniversalDao(mongoDriver, {collectionName: 'competitions'});
	this.refereeReportsDao = new universalDaoModule.UniversalDao(mongoDriver, {collectionName: 'refereeReports'});
	this.rostersDao = new universalDaoModule.UniversalDao(mongoDriver, {collectionName: 'rosters'});

	// Load and register schemas
	var schemasListPaths = JSON.parse(
		fs.readFileSync(path.join(config.paths.schemas, '_index.json')))
		.map(function(item) {
			return path.join(config.paths.schemas, item);
		});

	var schemaRegistry = new schemaRegistryModule.SchemaRegistry({schemasList: schemasListPaths});
	this.uDaoService = new universalDaoServiceModule.UniversalDaoService(mongoDriver, schemaRegistry, {
		emitEvent: function() {}
	});
}

PageController.prototype.competitionsList = function(req, res, next) {
	this.competitionDao.list({}, function(err, data) {
		if (err) {
			log.error('Failed to get list of competitions', err);
			next(err);
			return;
		}

		var result = [];

		for (var i in data) {
			result.push({
				id: data[i].id,
				name: data[i].baseData.name,
				lvl: data[i].baseData.competitionLevel || 0
			});
		}

		result.sort(function(a, b) { return b.lvl - a.lvl; });
		res.json(result);
	});

};

PageController.prototype.competitionMatchesAll = function(req, res, next) {
	var cid = req.params.cid;

	var qf = QueryFilter.create();

	qf.addCriterium('baseData.competition.oid', QueryFilter.operation.EQUAL, cid);
	qf.addSort('baseData.matchDate', QueryFilter.sort.ASC);

	this.refereeReportsDao.list(qf, function(err, data) {
		if (err) {
			log.error('Failed to get list of matches for competition %s', cid, err);
			next(err);
			return;
		}

		var result = [];

		for (var i in data) {
			result.push({
				id: data[i].id,
				homeId: data[i].baseData.homeClub.oid,
				guestId: data[i].baseData.awayClub.oid,
				matchDate: data[i].baseData.matchDate,
				fullTimeScoreHome: data[i].baseData.fullTimeScoreHome,
				fullTimeScoreAway: data[i].baseData.fullTimeScoreAway,
				matchNumber: data[i].baseData && data[i].baseData.matchNumber,
				printTemplate: data[i].baseData && data[i].baseData.printTemplate
			});
		}

		var rostersQf = QueryFilter.create();
		rostersQf.addCriterium('baseData.competition.oid', QueryFilter.operation.EQUAL, cid);
		pageController.rostersDao.list(rostersQf, function(err, data) {
			if (err) {
				log.error('Failed to get list of rosters for competition %s', cid, err);
				next(err);
				return;
			}

			var rosters = {};

			for (var i in data) {
				rosters[data[i].id] = data[i].baseData.prName;
			}

			for (i in result) {
				if (rosters[result[i].homeId]) {
					result[i].homeName = rosters[result[i].homeId];
				} else {
					result[i].homeName = '-:-';
				}

				if (rosters[result[i].guestId]) {
					result[i].guestName = rosters[result[i].guestId];
				} else {
					result[i].guestName = '-:-';
				}
			}

			res.json(result);
		});
	});
};

PageController.prototype.competitionMatches = function(req, res, next) {
	var cid = req.params.cid;

	var qf = QueryFilter.create();

	qf.addCriterium('baseData.matchDate', QueryFilter.operation.LESS_EQUAL, require('../DateUtils.js').DateUtils.dateToReverse(require('../DateUtils.js').DateUtils.dateAddDays(new Date(), 10)));
	qf.addCriterium('baseData.competition.oid', QueryFilter.operation.EQUAL, cid);
	qf.addSort('baseData.matchDate', QueryFilter.sort.DESC);
	qf.setLimit(25);

	this.refereeReportsDao.list(qf, function(err, data) {
		if (err) {
			log.error('Failed to get list of matches for competition %s', cid, err);
			next(err);
			return;
		}

		var result = [];

		for (var i in data) {
			result.push({
				id: data[i].id,
				homeId: data[i].baseData.homeClub.oid,
				guestId: data[i].baseData.awayClub.oid,
				matchDate: data[i].baseData.matchDate,
				matchTime: data[i].baseData.matchBegin,
				fullTimeScoreHome: data[i].baseData.fullTimeScoreHome,
				fullTimeScoreAway: data[i].baseData.fullTimeScoreAway,
				matchNumber: data[i].baseData && data[i].baseData.matchNumber,
				printTemplate: data[i].baseData && data[i].baseData.printTemplate,
				started: data[i].technicalData && data[i].technicalData.events && data[i].technicalData.events.length > 0 ? true : false,
				finished: ['Schválený', 'Zatvorený'].indexOf(data[i].baseData.state) > -1 ? true : false
			});
		}

		var rostersQf = QueryFilter.create();
		rostersQf.addCriterium('baseData.competition.oid', QueryFilter.operation.EQUAL, cid);
		pageController.rostersDao.list(rostersQf, function(err, data) {
			if (err) {
				log.error('Failed to get list of rosters for competition %s', cid, err);
				next(err);
				return;
			}

			var rosters = {};

			for (var i in data) {
				rosters[data[i].id] = data[i].baseData.prName;
			}

			for (i in result) {
				if (rosters[result[i].homeId]) {
					result[i].homeName = rosters[result[i].homeId];
				} else {
					result[i].homeName = '-:-';
				}

				if (rosters[result[i].guestId]) {
					result[i].guestName = rosters[result[i].guestId];
				} else {
					result[i].guestName = '-:-';
				}
			}

			res.json(result);
		});

	});

};

PageController.prototype.competitionResults = function(req, res, next) {
	var cid = req.params.cid;

	var qf = QueryFilter.create();

	qf.addCriterium('baseData.competition.oid', QueryFilter.operation.EQUAL, cid);

	this.refereeReportsDao.list(qf, function(err, data) {
		if (err) {
			log.error('Failed to get list of matches for competition %s', cid, err);
			next(err);
			return;
		}

		var result = {};

		for (var i in data) {

			var currentReport = data[i];
			var reportState = objectTools.evalPath(currentReport, 'baseData.state');

			var homeId = data[i].baseData.homeClub.oid;
			var guestId = data[i].baseData.awayClub.oid;

			if (typeof result[homeId] === 'undefined') {
				result[homeId] = { points: 0, matches: 0, score: 0};
			}
			if (typeof result[guestId] === 'undefined') {
				result[guestId] = { points: 0, matches: 0, score: 0};
			}

			if (['Schválený', 'Zatvorený'].indexOf(reportState) < 0) {
				// Skip reports in another states
				continue;
			}

			var scoreHome = parseInt(data[i].baseData.fullTimeScoreHome);
			if (isNaN(scoreHome)) {
				scoreHome = 0;
			}

			var scoreAway = parseInt(data[i].baseData.fullTimeScoreAway);
			if (isNaN(scoreAway)) {
				scoreAway = 0;
			}

			if ((scoreHome) > (scoreAway)) {
				result[homeId].points += 2;
			} else if ((scoreHome) < (scoreAway)) {
				result[guestId].points += 2;
			} else {
				result[homeId].points += 1;
				result[guestId].points += 1;
			}

			result[homeId].matches += 1;
			result[guestId].matches += 1;

			result[homeId].score += scoreHome - scoreAway;
			result[guestId].score -= scoreHome - scoreAway;
		}

		var rostersQf = QueryFilter.create();
		rostersQf.addCriterium('baseData.competition.oid', QueryFilter.operation.EQUAL, cid);
		pageController.rostersDao.list(rostersQf, function(err, data) {
			if (err) {
				log.error('Failed to get list of rosters for competition %s', cid, err);
				next(err);
				return;
			}

			var rosters = {};

			for (var i in data) {
				rosters[data[i].id] = data[i].baseData.prName;
			}

			for (i in result) {
				if (rosters[i]) {
					result[i].name = rosters[i];
				} else {
					result[i].name = '-:-';
				}
			}
			
			var finres = [];
			for (var i in result) {
				finres.push(result[i]);
			}

			res.json(finres);
		});
	});
};

PageController.prototype.saveSchema = function(req, res, next) {
	var schema = '';

	if (req.params && req.params.schema) {
		schema = req.params.schema;
	}

	request({ url: config.webserverPublicUrl + '/udao/saveBySchema/' + req.params.schema, method: 'PUT', 
			json: true,
			headers: {
				'content-type': 'application/json',
			},
			body: req.body,
			rejectUnauthorized: false
		},
		function (err, response, body) {
			if (err) {
				log.error('error: %j ', err);
				res.sendStatus(500);
				//FIXME probably next not return
				return;
			}

			res.json(body);
			res.end();
		});
};

/*
 * Renders refereeReport in template defined by report itself.
 *
 * FIXME this is wrong design, creating selarate controller for every function
 * Maybe we can separate whit to sports modules and than it makes sences to have
 * matchResult page that is required for every sports
 */
PageController.prototype.renderRefereeReport = function(req, res, next) {
	var mid, schemaName = null;
	function timeToTimerV(vstr) {
		var sstr = vstr.split(':');

		if (sstr.length !== 2) {
			return 0;
		}

		var r = (parseInt(sstr[0]) * 60) + parseInt(sstr[1]);

		if (isNaN(r)) {
			return 0;
		}

		return r;
	}

	function findPlayerIdxByJersey(arr, jersey) {
		for (var p in arr) {
			if (arr[p].dressNumber === jersey) {
				return arr[p];
			}
		}
	}

	if (req.query && req.query.id) {
		mid = req.query.id;
		schemaName = 'uri~3A~2F~2Fregistries~2FrefereeReports~23views~2FrefereeReports-km~2Fview';
		schemaName = 'uri://registries/refereeReports#views/refereeReports-km/view';

	} else {
		log.error('Not all required parameters provided');
		next(new Error('Not all required parameters provided'));
		return;
	}

	this.uDaoService.getBySchema(schemaName, {perm: {'Registry - read' : true, 'RefereeReport - read - KM': true}}, mid, function(err, userError, data) {
		if (err || userError) {
			log.error('Failed to get refereeReport %s', mid);
			next(err || userError);
			return;
		}


		if (data && data.baseData && data.baseData.printTemplate) {
			var templateName = data.baseData.printTemplate + '.html';

			// modify data
			var d = safeExtract(data, 'baseData.matchDate', '');
			if (d && d.length === 8) {
				data.baseData.matchDate = d.substring(6, 8).concat('.', d.substring(4, 6), '.', d.substring(0, 4));
			}

			if (data && data.technicalData && data.technicalData.events) {
				data.technicalData1 = {
					events: []
				};
				data.technicalData2 = {
					events: []
				};

				if (data.listOfPlayersHome && data.listOfPlayersHome.players) {
					data.listOfPlayersHome.players.sort(function(a, b) {return parseInt(a.dressNumber) - parseInt(b.dressNumber); });
				}
				if (data.listOfPlayersGuest && data.listOfPlayersGuest.players) {
					data.listOfPlayersGuest.players.sort(function(a, b) {return parseInt(a.dressNumber) - parseInt(b.dressNumber); });
				}

				var hcounter = 0;
				var acounter = 0;

				for (var e in data.technicalData.events) {
					var evt = {
						time: data.technicalData.events[e].time,
						home: data.technicalData.events[e].home,
						away: data.technicalData.events[e].away,
						action: data.technicalData.events[e].action,
						timer: timeToTimerV(data.technicalData.events[e].time)
					};

					var player;
					if (evt.home && evt.home !== '') {
						if (data.listOfPlayersHome && data.listOfPlayersHome.players) {
							player = findPlayerIdxByJersey(data.listOfPlayersHome.players, evt.home);
						}

						if (!player) {
							continue;
						}

						if (evt.action === 'N') {
							evt.action = 'Napom';
							player.punish = (player.punish || '').concat('N');
						} else if (evt.action === '2') {
							evt.action = 'Vyluc2m';
							player.punish = (player.punish || '').concat('2');
						} else if (evt.action === 'D') {
							evt.action = 'Diskv';
							player.punish = (player.punish || '').concat('D');
						} else if (evt.action === '0') {
							evt.action = 'Nepr7m';
							if (evt.timer < (30 * 60 + 1)) {
								player.events1 = (player.events1 || '').concat('\u277C;');
							} else {
								player.events2 = (player.events2 || '').concat('\u277C;');
							}
						} else if (evt.action === 'G') {
							evt.action = (++hcounter) + ':' + acounter;
							if (evt.timer < (30 * 60 + 1)) {
								player.events1 = (player.events1 || '').concat(hcounter + ';');
							} else {
								player.events2 = (player.events2 || '').concat(hcounter + ';');
							}

							player.points = (player.points || 0) + 1;
						} else if (evt.action === '7') {
							evt.action = (++hcounter) + ':' + acounter;
							if (evt.timer < (30 * 60 + 1)) {
								player.events1 = (player.events1 || '').concat('[', hcounter, '];');
							} else {
								player.events2 = (player.events2 || '').concat('[', hcounter, '];');
							}
							player.points = (player.points || 0) + 1;
						}
					} else if (evt.away && evt.away !== '') {
						if (data.listOfPlayersGuest && data.listOfPlayersGuest.players) {
							player = findPlayerIdxByJersey(data.listOfPlayersGuest.players, evt.away);
						}

						if (!player) {
							continue;
						}

						if (evt.action === 'N') {
							evt.action = 'Napom';
							player.punish = (player.punish || '').concat('N');
						} else if (evt.action === '2') {
							evt.action = 'Vyluc2m';
							player.punish = (player.punish || '').concat('2');
						} else if (evt.action === 'D') {
							evt.action = 'Diskv';
							player.punish = (player.punish || '').concat('D');
						} else if (evt.action === '0') {
							evt.action = 'Nepr7m';
							if (evt.timer < (30 * 60 + 1)) {
								player.events1 = (player.events1 || '').concat('\u277C;');
							} else {
								player.events2 = (player.events2 || '').concat('\u277C;');
							}
						} else if (evt.action === 'G') {
							evt.action = (hcounter) + ':' + (++acounter);
							if (evt.timer < (30 * 60 + 1)) {
								player.events1 = (player.events1 || '').concat(acounter + ';');
							} else {
								player.events2 = (player.events2 || '').concat(acounter + ';');
							}

							player.points = (player.points || 0) + 1;
						} else if (evt.action === '7') {
							evt.action = (hcounter) + ':' + (++acounter);
							if (evt.timer < (30 * 60 + 1)) {
								player.events1 = (player.events1 || '').concat('[', acounter, '];');
							} else {
								player.events2 = (player.events2 || '').concat('[', acounter, '];');
							}
							player.points = (player.points || 0) + 1;
						}
					}

					if (evt.timer < (30 * 60 + 1)) {
						data.technicalData1.events.push(evt);
					} else {
						data.technicalData2.events.push(evt);
					}
				}
			}

			data.render = {
				started: data.technicalData && data.technicalData.events && data.technicalData.events.length > 0 ? true : false,
				finished: ['Schválený', 'Zatvorený'].indexOf(data.baseData.state) > -1 ? true : false,
				showPrivate: req.query.private || false

			};
			swig.renderFile(path.join(config.portalTemplatesPath, templateName), data, function(swigErr, output) {
				if (swigErr) {
					log.error('Failed to render %s', templateName, swigErr);
					next(swigErr);
					return;
				}
				res.send(output);
			});
		} else {
			log.error('RefereeReport %s does not contain printTemplate', mid);
			next(new Error('RefereeReport does not contain printTemplate'));
			return;
		}
	});
};

PageController.prototype.renderPage = function(req, res, next) {
	var locals = {};

	var aid, page = 0;

	if (req.params && req.params.aid) {
		aid = req.params.aid;
	}
	if (req.params && req.params.page) {
		page = parseInt(req.params.page);
	}

	this.getArticle(aid, function(err, data) {
		if (err) {
			log.error('Failed to get article %s', aid);
			next(err);
			return;
		}

		locals.article = data;

		pageController.getMenu(function(err, data) {
			if (data && data.index && data.index.subElements) {
				// strip root menu element
				locals.menu = data.index.subElements;
			} else {
				locals.menu = data;
			}

			var menuResolvers = [];

			function createMenuArticleResolver(elm) {
				return function(callback) {
					pageController.getArticlesByTags(elm.tags, 0, 1, function(err, data) {
						if (err) {
							log.verbose('Failed to resolve article for menu entry %s', elm.name, err);
							callback(err);
						}

						if (data && data.length > 0) {
							elm.aid = data[0].id;
						}
						callback();

					});

				};
			}

			function createCategoryResolver(elm, aid) {
				log.silly('Creating category block resolver');

				elm.data.aid = aid;
				if ((typeof elm.data.pageSize === 'undefined') || elm.data.pageSize == '') {
					elm.data.pageSize = 20;
				}
				function findFirstOfType(obj, type) {
					for (var j = 0; j < obj.length; ++j) {
						if (obj[j].meta.name === type) {
							return obj[j].data;
						}
					}
				}

				return function(callback) {
					pageController.getArticlesByTags(elm.data.tags, page, elm.data.pageSize, function(err, data) {
						if (err) {
							log.verbose('Failed to resolve articles for article block %s', elm, err);
							callback(err);
						}

						if (data) {
							var currPage = 0;
							if (page) {
								currPage = page;
							}
							elm.data.prevPage = 0;
							if (currPage > 0) {
								elm.data.prevPage = currPage - 1;
							}
							elm.data.nextPage = currPage + 1;
							if (data.length <= elm.data.pageSize) {
								elm.data.nextPage = currPage;
							}
							elm.data.articles = [];
							var noOfPageElements =
								(data.length <= elm.data.pageSize)? data.length :elm.data.pageSize;
							for (var i=0; i < noOfPageElements; ++i) {
								elm.data.articles.push({
									id: data[i].id,
									title: findFirstOfType(data[i].data, 'title'),
									abstract: findFirstOfType(data[i].data, 'abstract'),
									img: findFirstOfType(data[i].data, 'image'),
									img1170: findFirstOfType(data[i].data, 'image1170'),
									video: findFirstOfType(data[i].data, 'video'),
									content: findFirstOfType(data[i].data, 'content')
								});
							}
						}
						
						callback();
					});
				};
			}

			for (var i in locals.menu) {
				menuResolvers.push(createMenuArticleResolver(locals.menu[i]));
				for (var j in locals.menu[i].subElements) {
					menuResolvers.push(createMenuArticleResolver(locals.menu[i].subElements[j]));
				}
			}

			async.parallel(menuResolvers, function(err, data) {
				if (err) {
					log.verbose('Failed to resolve all menu entries');
					next(err);
					return;
				}

				var blocksResolvers = [];

				if (locals.article) {
					var blockUUIDCounter = 1; // couter for generation of unique block id

					for (var i in locals.article.data) {
						locals.article.data[i].blockUUID = 'blockID'.concat(blockUUIDCounter++);
						if (locals.article.data[i] && locals.article.data[i].meta.type === 'category' 
								|| locals.article.data[i].meta.type === 'showcase'
								|| locals.article.data[i].meta.type === 'overview'
								|| locals.article.data[i].meta.type === 'showcasevideo') {
							blocksResolvers.push(createCategoryResolver(locals.article.data[i], aid));
						}
					}
				}

				async.parallel(blocksResolvers, function(err, data) {
					if (err) {
						log.verbose('Failed to resolve all article blocks');
						next(err);
						return;
					}
					var templateName = locals.article.meta.template + '.html';
					swig.renderFile(path.join(config.portalTemplatesPath, templateName), locals, function(err, output) {
						if (err) {
							log.error('Failed to render %s', templateName, err);
							next(err);
							return;
						}
						res.send(output);
					});
				});

			});
		}); // this.getMenu
	}); // this.getArticle

};


PageController.prototype.renderNotFound = function(req, res, next) {
	swig.renderFile(path.join(config.portalTemplatesPath, '404.html'), {}, function (err, output) {
		if (err) {
			log.error('Failed to render %s', 'NotFound', err);
			next(err);
		}

		res.send(output);
		res.status(404);
	});
};

PageController.prototype.getMenu = function(callback) {
	this.menuDao.list({}, function(err, data) {
		if (err) {
			log.verbose('Error while getting menu entries', err);
			callback(err);
			return;
		}

		// return only first found menu
		if (data && data.length > 0) {
			callback(null, data[0]);
		} else {
			callback(null, null);
		}
	});
};

PageController.prototype.getArticle = function(aid, callback) {
	if (aid) {
		this.articlesDao.get(aid, function(err, data) {
			if (err) {
				log.verbose('Failed to get article %s', aid);
				callback(err);
				return;
			}

			callback(null, data);
		});
	} else {
		this.getArticlesByTags(['menu:index'], 0, 1, function(err, data) {
			if (err) {
				log.verbose('Failed to get indexpage by menu:index tag');
				callback(err);
				return;
			}

			if (!(data && data.length > 0)) {
				log.verbose('Not enought articles found for fixed tag menu:index');
				callback(err);
				return;
			} else {
				callback(null, data[0]);
			}
		});
	}
};

PageController.prototype.getArticlesByTags = function(tags, page, countPerPage, callback) {
	var _tags = [];
	var _limit = 20;
	var _skip = 0;

	if (tags) {
		_tags = tags;
	}

	if (countPerPage) {
		_limit = countPerPage;
	}

	if (page) {
		_skip = page * _limit;
	}
	if (countPerPage && countPerPage>1) {
		_limit = countPerPage+1;
	}
	log.info('Query limits:' + page + ' ' + _limit + ' ' + countPerPage + ' ' + _skip);

	var qf = QueryFilter.create();

	if (_tags.length > 0) {
		qf.addCriterium('meta.tags', QueryFilter.operation.ALL, _tags);
	}
	qf.addCriterium('meta.enabled', QueryFilter.operation.EQUAL, true);
	qf.addCriterium('meta.publishFrom', QueryFilter.operation.LESS_EQUAL, require('../DateUtils.js').DateUtils.nowToReverse());

	qf.addSort('meta.publishFrom', QueryFilter.sort.DESC);
	qf.addSort('meta.lastModTimestamp', QueryFilter.sort.DESC);

	qf.setSkip(_skip);
	qf.setLimit(_limit);

	this.articlesDao.list(qf, function(err, data) {
		if (err) {
			log.verbose('Error while getting articles by tag', err);
			callback(err);
			return;
		}

		callback(null, data);
	});
};


module.exports = {
	init: function(mongoDriver) {
		pageController = new PageController(mongoDriver);
	},
	renderPage: function(req, res, next) {
		if (pageController) {
			pageController.renderPage(req, res, next);
		} else {
			throw new Error('page-controller module not initialized');
		}
	},
	saveSchema: function(req, res, next) {
		if (pageController) {
			pageController.saveSchema(req, res, next);
		} else {
			throw new Error('page-controller module not initialized');
		}
	},
	competitionsList: function(req, res, next) {
		if (pageController) {
			pageController.competitionsList(req, res, next);
		} else {
			throw new Error('page-controller module not initialized');
		}
	},
	competitionMatches: function(req, res, next) {
		if (pageController) {
			pageController.competitionMatches(req, res, next);
		} else {
			throw new Error('page-controller module not initialized');
		}
	},
	competitionMatchesAll: function(req, res, next) {
		if (pageController) {
			pageController.competitionMatchesAll(req, res, next);
		} else {
			throw new Error('page-controller module not initialized');
		}
	},
	competitionResults: function(req, res, next) {
		if (pageController) {
			pageController.competitionResults(req, res, next);
		} else {
			throw new Error('page-controller module not initialized');
		}
	},
	competitionRefereeReports: function(req, res, next) {
		if (pageController) {
			pageController.renderRefereeReport(req, res, next);
		} else {
			throw new Error('page-controller module not initialized');
		}
	}
};
