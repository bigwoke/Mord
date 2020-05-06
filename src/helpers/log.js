const winston = require('winston');
const cfg = require('../../config.js');

// Create default logger at info level using splat formatter
const log = winston.createLogger({
  level: 'info',
  format: winston.format.splat(),
  transports: [
    // Add console transport using CLI formatting
    new winston.transports.Console({
      level: cfg.logging.console,
      format: winston.format.cli()
    })
  ]
});

// If file loglevel is configured, add file transport
if (cfg.logging.file) {
  log.add(new winston.transports.File({
    level: cfg.logging.file,
    filename: './output.log',
    // Combine simple + timestamp + errors w/ stack
    format: winston.format.combine(
      winston.format.simple(),
      winston.format.timestamp(),
      winston.format.errors({ stack: true })
    )
  }));
}

module.exports = log;
