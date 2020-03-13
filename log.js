const log = require('winston');
const cfg = require('./config.js');

log.configure({
  transports: [
    new log.transports.File({
      filename: 'output.log',
      timestamp: true,
      level: cfg.loglevel.file,
      json: false
    }),
    new log.transports.Console({
      colorize: true,
      humanReadableUnhandledException: true,
      level: cfg.loglevel.console
    })
  ]
});

module.exports = log;