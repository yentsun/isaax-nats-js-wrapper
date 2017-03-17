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

  const self = this

  options = options ? merge(defaults, options) : defaults

  const nats = options.connection || NATS.connect(options.url)
  logger.info('connected to NATS:', nats.currentServer.url.host)

  self.publish = function (subject, message) {
    logger.debug('publishing to', subject, message)
    nats.publish(subject, JSON.stringify(message), function () {
      logger.debug('message published', subject, message)
    })
  }

  // returned by `listen`, not to be used directly
  self.respond = function (replyTo) {
    return function (error, message) {
      if (error) {
        logger.debug('sending error response to', replyTo, error)
        nats.publish(replyTo, JSON.stringify({error: error}), function () {
          logger.debug('error response sent to', replyTo)
        })
      } else {
        logger.debug('sending response to', replyTo, message)
        nats.publish(replyTo, JSON.stringify(message), function () {
          logger.debug('response sent to', replyTo)
        })
      }
    }
  }

  // subscribe to point-to-point requests
  self.listen = function (subject, done) {
    const group = subject + '.workers'
    logger.debug('subscribing to requests', subject, 'as member of', group)
    nats.subscribe(subject, {queue: group}, function (message, reply, subject) {
      logger.debug('responding to', subject, message)
      done(JSON.parse(message), self.respond(reply))
    })
  }

  // subscribe to broadcasts
  self.subscribe = function (subject, done) {
    logger.debug('subscribing to broadcasts', subject)
    nats.subscribe(subject, function (message, reply, subject) {
      logger.debug('responding to broadcast', subject, 'with', message)
      done(JSON.parse(message), reply, subject)
    })
  }

  // subscribe as queue worker
  self.process = function (subject, done) {
    const group = subject + '.workers'
    logger.debug('subscribing to process', subject, 'queue as member of', group)
    nats.subscribe(subject, {queue: group}, function (message, reply, subject) {
      logger.debug('processing', subject, message)
      done(JSON.parse(message), subject)
    })
  }

  // request one response
  self.request = function (subject, message, done) {
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
