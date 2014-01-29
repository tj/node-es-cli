
/**
 * Module dependencies.
 */

var Emitter = require('events').EventEmitter;
var debug = require('debug')('es-cli');
var request = require('superagent');
var assert = require('assert');

/**
 * Expose `ES` client.
 */

module.exports = ES;

/**
 * Initialize a new ES client.
 *
 * @param {Object} opts
 * @api public
 */

function ES(opts) {
  assert(opts.url, 'elastic search --url required');
  this.url = opts.url;
  this.index = opts.index;
  this.type = opts.type;
}

/**
 * Query with `str` and return an emitter.
 *
 * TODO: .sort
 *
 * @param {String} str
 * @param {Object} opts
 * @return {Emitter}
 * @api public
 */

ES.prototype.query = function(str, opts){
  var e = new Emitter;
  opts = opts || {};
  str = str || '*';

  // options
  var size = opts.size || 10;

  // url
  debug('query %j %j', str, opts);
  var url = this.index
    ? this.url + '/' + this.index + '/' + this.type + '/_search'
    : this.url + '/_search';

  request
  .get(url)
  .query({ q: str, size: size })
  .end(function(err, res){
    if (err) return e.emit('error', err);
    if (res.error) return e.emit('error', res.error);

    var logs = res.body.hits;
    debug('%s -> %s (%sms)', res.status, logs.total, res.body.took);

    e.emit('data', logs.hits.map(normalize));
  });

  return e;
};

/**
 * Normalize `log`.
 */

function normalize(log) {
  return log._source;
}