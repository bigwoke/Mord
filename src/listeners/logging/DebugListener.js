const Listener = require('../../types/MordListener');
const log = require('../../helpers/log');

class DebugListener extends Listener {
  constructor () {
    super('debug', {
      category: 'logging',
      emitter: 'client',
      event: 'debug'
    });
  }

  exec (message) {
    if (message.startsWith('[WS => Shard 0]') && message.includes('Heartbeat')) {
      log.silly(message);
    } else {
      log.debug(message);
    }
  }
}

module.exports = DebugListener;
