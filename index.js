const NATS = require('nats')
const logger = require('./lib/logger')
const merge = require('lodash/merge')
const keys = require('lodash/keys')


function Wrapper(options) {

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

            // if response is wrapped in a single key - unwrap it
            const keys_ = keys(res)
            if (keys_.length == 1) res = res[keys_[0]]

            logger.debug('<<<', res)
            return done(null, res)
        })
    }

}

module.exports = Wrapper
