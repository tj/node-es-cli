
/**
 * Module dependencies.
 */

var Emitter = require('events').EventEmitter;
var debug = require('debug')('es-cli');
var request = require('superagent');
var assert = require('assert');
var parse = require('elucene');
var only = require('only');

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

  // parse
  var query = parse(str);
  var str = query.string || '*';

  // options
  var size = (query.limit && query.limit[0]) || 10;
  var sort = (query.sort && query.sort[0]) || 'timestamp:desc';

  // url
  debug('query %j %j', str, opts);
  var url = this.url + '/_search';

  request
  .get(url)
  .query({ q: str, size: size, sort: sort })
  .end(function(err, res){
    if (err) return e.emit('error', err);
    if (res.error) return e.emit('error', res.error);

    var logs = res.body.hits;
    debug('%s -> %s (%sms)', res.status, logs.total, res.body.took);

    e.emit('data', logs.hits.map(normalize(query.fields)));
  });

  return e;
};

/**
 * Normalize logs with optional field filtering.
 */

function normalize(fields) {
  return function(log){
    log = log._source;
    if (fields) log.message = only(log.message, fields);
    return log;
  }
}
