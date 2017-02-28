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
                return done(new Error('response timeout'));
            }
            var res = JSON.parse(response)
            const error = res.error
            delete response.error
            if (error) return done(new Error(error.message))
            return done(null, res)
        })
    }

}

module.exports = Wrapper
