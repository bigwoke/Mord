const Listener = require('../../types/MordListener');
const log = require('../../helpers/log');

class ErrorListener extends Listener {
  constructor () {
    super('error', {
      category: 'logging',
      emitter: 'client',
      event: 'error'
    });
  }

  exec (message) {
    log.error(message);
  }
}

module.exports = ErrorListener;
