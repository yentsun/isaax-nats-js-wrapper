const NATS = require('nats')
const logger = require('./lib/logger')


function Wrapper(options) {

    if (!(this instanceof Wrapper)) {
        return new Wrapper(options)
    }

    options = options ? options : {
        requestTimeout: 1000
    }

    const nats = options.connection || NATS.connect(options.url)
    logger.info('connected to NATS:', nats.currentServer.url.host)

    this.publish = function (subject, message) {
        logger.debug('publishing to', subject, message)
        nats.publish(subject, JSON.stringify(message), function() {
            logger.debug('message published', subject, message)
        })
    }

    this.subscribe = function (subject, opts, done) {
        logger.debug('subscribing to', subject)
        nats.subscribe(subject, opts, function(message, reply, subject) {
            logger.debug('received event via subscription', subject, message)
            done(JSON.parse(message), reply, subject)
        })
    }

    this.request = function (subject, message, done) {
        logger.debug('performing request', subject, message)
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
                logger.error('request ended in error:', error.message)
                return done(new Error(error.message))
            }
            logger.debug('response received:', res)
            return done(null, res)
        })
    }

}

module.exports = Wrapper
