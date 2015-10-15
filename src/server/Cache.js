(function(module) {
	'use strict';

	var log = require('./logging.js').getLogger('Cache.js');
	var IORedis = require('ioredis');
	var config = require('./config.js');
	var Q = require('q');

	var Cache = function(options) {
		var opts = options || config.defaultRedis;
		this.redis = new IORedis(opts);
		this.ready = false;
		this.keyPrefix = config.cacheKeyPrefix;

		var self = this;

		this.redis.on('connect', function() {
			self.ready = true;
		});
	};

	Cache.prototype.store = function(key, val, exp) {
		// continue only if ready
		if (!this.ready) {
			return Q.resolve(null);
		}

		return this.redis.set(key, val, exp ? ['EX', exp] : []);
	};

	Cache.prototype.get = function(key) {
		if (!this.ready) {
			return Q.resolve(null);
		}

		return this.redis.get(key);
	};

	Cache.prototype.registerForEviction = function(evictedBy, key) {
		// continue only if ready
		if (!this.ready) {
			return Q.resolve(null);
		}

		return this.redis.sadd(evictedBy, key);
	};

	Cache.prototype.evictAllRegistered = function(evictedBy) {
		// continue only if ready
		if (!this.ready) {
			Q.resolve(null);
		}

		log.verbose(evictedBy);
		return this.redis.smembers(evictedBy)
		.then(function(keys) {
			return this.redis.srem(evictedBy, keys)
			.then(function() {
				return this.redis.del(keys);
			});
		});
	};

	var defaultCache = new Cache();

	module.exports = {
		create: function(options) {
			return new Cache(options);
		},
		defaultCache: defaultCache
	};
}(typeof module === 'undefined' ? null : module));
