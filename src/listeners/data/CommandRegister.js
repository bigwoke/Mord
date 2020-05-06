const Listener = require('../../types/MordListener');
const log = require('../../helpers/log');

class CommandRegisterListener extends Listener {
  constructor () {
    super('commandRegister', {
      emitter: 'commandHandler',
      event: 'load'
    });
  }

  exec (command) {
    this.verifyID(command);
    log.verbose(`Command ${command.id} loaded.`);
  }

  verifyID (command) {
    const { categories } = command.handler;
    const duplicateID = categories.some(cat => cat.id === command.id);
    if (duplicateID) throw new Error('Category and command IDs must be unique.');
  }
}

module.exports = CommandRegisterListener;
