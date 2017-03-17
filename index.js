const NATS = require('nats')
const logger = require('./lib/logger')
const merge = require('lodash/merge')

function Wrapper (options) {
  if (!(this instanceof Wrapper)) {
    return new Wrapper(options)
  }

  const defaults = {
    requestTimeout: 1000
  }

  options = options ? merge(defaults, options) : defaults

  const nats = options.connection || NATS.connect(options.url)
  logger.info('connected to NATS:', nats.currentServer.url.host)

  this.publish = function (subject, message) {
    logger.debug('publishing to', subject, message)
    nats.publish(subject, JSON.stringify(message), function () {
      logger.debug('message published', subject, message)
    })
  }

  this.respond = function (subject, error, message) {
    if (error) {
      logger.debug('sending error response to', subject, error)
      nats.publish(subject, JSON.stringify({error: error}), function () {
        logger.debug('error response sent to', subject)
      })
    } else {
      logger.debug('sending response to', subject, message)
      nats.publish(subject, JSON.stringify(message), function () {
        logger.debug('response sent to', subject)
      })
    }
  }

  // subscribe to point-to-point requests
  this.listen = function (subject, done) {
    const group = subject + '.workers'
    logger.debug('subscribing to requests', subject, 'as member of', group)
    nats.subscribe(subject, {queue: group}, function (message, reply, subject) {
      logger.debug('responding to', subject, message)
      done(JSON.parse(message), reply, subject)
    })
  }

  // subscribe to broadcasts
  this.subscribe = function (subject, done) {
    logger.debug('subscribing to broadcasts', subject)
    nats.subscribe(subject, function (message, reply, subject) {
      logger.debug('responding to broadcast', subject, 'with', message)
      done(JSON.parse(message), reply, subject)
    })
  }

  // subscribe as queue worker
  this.process = function (subject, done) {
    const group = subject + '.workers'
    logger.debug('subscribing to process', subject, 'queue as member of', group)
    nats.subscribe(subject, {queue: group}, function (message, reply, subject) {
      logger.debug('processing', subject, message)
      done(JSON.parse(message), subject)
    })
  }

  // request one response
  this.request = function (subject, message, done) {
    logger.debug('>>>', subject, message)
    nats.requestOne(subject, JSON.stringify(message), null, options.requestTimeout, function (response) {
      logger.debug(response)
      if (response.code && response.code === NATS.REQ_TIMEOUT) {
        logger.error('response timeout')
        return done(new Error('response timeout'))
      }
      var res = JSON.parse(response)
      const error = res.error
      delete res.error
      if (error) {
        logger.error('request ended in error:', error.message || error.detail)
        return done(new Error(error.message || error.detail))
      }

      logger.debug('<<<', res)
      return done(null, res)
    })
  }
}

module.exports = Wrapper
