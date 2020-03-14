const log = require('winston')
const cfg = require('./config.js')

/**
 * Setup Winston logging transports based on config.
 * @returns {Object} Configuration options.
 */
function buildLoggerOpts () {
  const opts = {
    transports: [
      new log.transports.Console({
        colorize: true,
        humanReadableUnhandledException: true,
        level: cfg.logging.console
      }),
      new log.transports.File({
        filename: 'output.log',
        timestamp: true,
        level: cfg.logging.file,
        json: false
      })
    ]
  }

  if (!cfg.logging.file) opts.transports.pop()
  return opts
}

log.configure(buildLoggerOpts())

module.exports = log
