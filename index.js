const NATS = require('nats')
const logger = require('./lib/logger');


function Wrapper(options) {

    if (!(this instanceof Wrapper)) {
        return new Wrapper(options)
    }

    options = options ? options : {
        requestTimeout: 10000
    }

    const nats = options.connection || NATS.connect(options.url);
    logger.info('connected to NATS:', nats.currentServer.url.host);

    this.request = function (subject, message, done) {
        logger.debug('performing request', subject, message);
        nats.requestOne(subject, JSON.stringify(message), null, options.requestTimeout, function (response) {
            if (response.code && response.code === NATS.REQ_TIMEOUT) {
                logger.error('response timeout');
                return done(new Error('response timeout'));
            }
            var res = JSON.parse(response)
            const error = res.error
            delete res.error
            if (error) {
                logger.error('request ended in error:', error.message);
                return done(new Error(error.message))
            }
            logger.debug('response received:', res);
            return done(null, res)
        })
    }

}

module.exports = Wrapper
