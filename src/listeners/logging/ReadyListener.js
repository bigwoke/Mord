const Listener = require('../../types/MordListener');
const log = require('../../helpers/log');

class ReadyListener extends Listener {
  constructor () {
    super('ready', {
      category: 'logging',
      emitter: 'client',
      event: 'ready',
      type: 'once'
    });
  }

  exec () {
    log.info(`Connected to Discord as ${this.client.user.tag} (${this.client.user.id})`);
  }
}

module.exports = ReadyListener;
