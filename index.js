const NATS = require('nats')
const Logger = require('./lib/logger')
const merge = require('lodash/merge')

function Wrapper (options) {
  if (!(this instanceof Wrapper)) {
    return new Wrapper(options)
  }

  const defaults = {
    requestTimeout: 10000,
    group: 'default'
  }
  options = options ? merge(defaults, options) : defaults

  const logger = options.logger || Logger(options.group)
  const nats = options.connection || NATS.connect(options)
  logger.info('connected to NATS:', nats.currentServer.url.host)
  logger.info('instance group is:', options.group)

  const self = this

  self.publish = function (subject, message) {
    logger.debug('publishing to', subject, message)
    nats.publish(subject, JSON.stringify(message), function () {
      logger.debug('message published', subject, message)
    })
  }

  // returned by `listen`, not to be used directly
  self._respond = function (replyTo) {
    return function (error, response) {
      if (error) {
        logger.debug('sending error response to', replyTo, error)
        nats.publish(replyTo, JSON.stringify([{message: error.message, stack: error.stack}]), function () {
          logger.debug('error response sent to', replyTo)
        })
      } else {
        logger.debug('sending response to', replyTo, response)
        nats.publish(replyTo, JSON.stringify([null, response]), function () {
          logger.debug('response sent to', replyTo)
        })
      }
    }
  }

  // subscribe to point-to-point requests
  self.listen = function (subject, done) {
    const group = subject + '.listeners'
    logger.debug('subscribing to requests', subject, 'as member of', group)
    return nats.subscribe(subject, {queue: group}, function (message, reply, subject) {
      logger.debug('responding to', subject, message)
      done(JSON.parse(message), self._respond(reply))
    })
  }

  // subscribe to broadcasts
  self.subscribe = function (subject, done) {
    logger.debug('subscribing to broadcasts', subject)
    return nats.subscribe(subject, function (message, reply, subject) {
      logger.debug('responding to broadcast', subject, 'with', message)
      done(JSON.parse(message), reply, subject)
    })
  }

  // subscribe as queue worker
  self.process = function (subject, done) {
    const group = subject + '.workers.' + options.group
    logger.debug('subscribing to process', subject, 'queue as member of', group)
    return nats.subscribe(subject, {queue: group}, function (message, reply, subject) {
      logger.debug('processing', subject, message)
      done(JSON.parse(message), subject)
    })
  }

  // request one response
  self.request = function (subject, message, done) {
    logger.debug('>>>', subject, message)
    nats.requestOne(subject, JSON.stringify(message), null, options.requestTimeout, function (response) {
      logger.debug('got response', response)
      if (response.code && response.code === NATS.REQ_TIMEOUT) {
        logger.error('response timeout')
        return done(new Error('response timeout'))
      }
      response = JSON.parse(response)
      const error = response[0]
      const res = response[1]
      if (error) {
        const errorMessage = error.message || error.detail
        logger.error('request ended in error:', errorMessage, error.stack)
        return done(new Error(errorMessage))
      }

      logger.debug('<<<', res)
      return done(null, res)
    })
  }

  // unsubscribe from subject
  self.unsubscribe = function(sid) {
    logger.debug(`unsubscribing from subject (sid: ${sid})`);
    nats.unsubscribe(sid);
  }

  // close underlying connection with NATS
  self.close = function () {
    logger.info('closing connection with NATS:', nats.currentServer.url.host)
    nats.close()
  }
}

module.exports = Wrapper
