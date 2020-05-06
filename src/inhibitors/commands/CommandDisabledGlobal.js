const Inhibitor = require('../../types/MordInhibitor.js');

class CommandDisabledGlobalInhibitor extends Inhibitor {
  constructor () {
    super('commandDisabledGlobal', {
      reason: 'commandDisabledGlobal',
      priority: 3
    });
  }

  exec (message, command) {
    const disabledCommands = this.client.settings.get('global', 'disabled_cmd');
    return disabledCommands[command.id] === true;
  }
}

module.exports = CommandDisabledGlobalInhibitor;
