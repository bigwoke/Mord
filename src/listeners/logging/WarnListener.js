const Listener = require('../../types/MordListener');
const log = require('../../helpers/log');

class WarnListener extends Listener {
  constructor () {
    super('warn', {
      category: 'logging',
      emitter: 'client',
      event: 'warn'
    });
  }

  exec (message) {
    log.warn(message);
  }
}

module.exports = WarnListener;
