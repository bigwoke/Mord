const Listener = require('../../types/MordListener.js');
const log = require('../../helpers/log.js');

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
