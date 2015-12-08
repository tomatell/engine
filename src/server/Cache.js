(function(module) {
	'use strict';

	var log = require('./logging.js').getLogger('Cache.js');
	var IORedis = require('ioredis');
	var config = require('./config.js');
	var Q = require('q');

	/**
	 * Wraps cache functionality.
	 *
	 * @class Cache
	 */
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

	/**
	 * Stores key/value pair in cache with possible expiration set.
	 *
	 * @method store
	 * @param {string} key name key
	 * @param {string} val value
	 * @param {number} exp defines expiration in seconds if set. If not set
	 * no expiration is set
	 *
	 * @return promise
	 */
	Cache.prototype.store = function(key, val, exp) {
		// continue only if ready
		if (!this.ready) {
			return Q.resolve(null);
		}

		return this.redis.set(key, val, exp ? ['EX', exp] : []);
	};

	/**
	 * Returns cached value if found
	 *
	 * @method get
	 * @param {string} key
	 *
	 * @return promise that gets cached value as parameter for then call
	 */
	Cache.prototype.get = function(key) {
		if (!this.ready) {
			return Q.resolve(null);
		}

		return this.redis.get(key);
	};

	/**
	 * Registers cache key for eviction. This construction is used for
	 * forced eviction of objects by call of evict all registered. In general
	 * every key registered by this method is evicted by evictAllRegistered method call.
	 * Take into consideration that registered keys are hold in cache for indefinite time
	 * and are removed only by evictAllRegistered call. So putting too many keys here can
	 * grow list to be pretty big and subsequent evictAllRegistered can take significant time.
	 *
	 * @method registerForEviction
	 * @param {string} evictedBy defines registration group which should evict this key
	 * @param {string} key to evict
	 *
	 * @return promise
	 *
	 */
	Cache.prototype.registerForEviction = function(evictedBy, key) {
		// continue only if ready
		if (!this.ready) {
			return Q.resolve(null);
		}

		return this.redis.sadd(evictedBy, key);
	};

	/**
	 * Removes all keys that are registered by this eviction group.
	 *
	 * See {{#crossLink "Cache/registerForEviction"}}{{/crossLink}} for more info.
	 *
	 * @method evictAllRegistered
	 * @param {string} evictedBy name of eviction group
	 *
	 * @return promise
	 */
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
