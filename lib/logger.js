const winston = require('winston')
const moment = require('moment')

module.exports = function (group) {
  const formatter = function (options) {
    return [options.timestamp(), 'nats.' + group, options.level.toUpperCase(), options.message || '', options.meta && Object.keys(options.meta).length ? JSON.stringify(options.meta) : ''].join(' ')
  }

  return new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        level: process.env.NATS_LOG_LEVEL || 'debug',
        timestamp: function () { return moment().toISOString() },
        formatter: formatter
      })
    ]
  })
}
