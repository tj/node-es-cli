
/**
 * Module dependencies.
 */

var Emitter = require('events').EventEmitter;
var debug = require('debug')('es-cli');
var request = require('superagent');
var parseDate = require('date.js');
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
 * Respond with stats.
 *
 * @param {Function} fn
 * @api public
 */

ES.prototype.stats = function(fn){
  var url = this.url + '/_stats';

  request
  .get(url)
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(res.error);
    fn(null, res.body);
  });
};

/**
 * Query with `str` and return an emitter.
 *
 * @param {String} str
 * @param {Object} opts
 * @return {Emitter}
 * @api public
 */

ES.prototype.query = function(str, opts){
  var reverse = true;
  var e = new Emitter;
  opts = opts || {};

  // parse
  var query = parse(str);
  var str = query.string || '*';

  // options
  var size = (query.limit && query.limit[0]) || opts.limit || 100;
  var sort = (query.sort && query.sort[0]) || 'timestamp:desc';

  // date.js favours the next day, so for now we'll
  // just always add "last" to give it a hint
  if (query.from) {
    str += from(query.from);
    sort = 'timestamp:asc';
    reverse = false;
  }

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

    // normalize
    logs = logs.hits.map(normalize(query.fields));

    // ensure latest is at emitted last
    if (reverse) logs = logs.reverse();

    // emit
    logs.forEach(function(log){
      e.emit('data', log);
    });

    e.emit('end');
  });

  return e;
};

/**
 * Return range from date range.
 */

function from(arr) {
  // HACK: to ensure "1pm" == "last 1pm" etc
  if (arr.length == 1) arr.unshift('last');
  var str = arr.join(' ');
  var from = parseDate(str);
  var to = Date.now();
  return ' AND timestamp:[' + +from + ' TO ' + to + ']';
}

/**
 * Normalize logs with optional field filtering.
 */

function normalize(fields) {
  return function(log){
    log = log._source;
    log.message = JSON.parse(log.message);
    if (fields) log.message = only(log.message, fields);
    return log;
  }
}
