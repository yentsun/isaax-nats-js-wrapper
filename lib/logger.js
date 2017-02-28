const winston = require('winston')
const moment = require('moment')

const formatter = function (options)  {
    return [options.timestamp(), 'nats', options.level.toUpperCase(), options.message || '', options.meta && Object.keys(options.meta).length ? JSON.stringify(options.meta) : ''].join(' ')

};

const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            level: process.env.NATS_LOG_LEVEL || 'info',
            timestamp: function ()  { return moment().toISOString() },
            formatter: formatter
        })
    ]
})

module.exports = logger
