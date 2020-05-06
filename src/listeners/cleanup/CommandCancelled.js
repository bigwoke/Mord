const Listener = require('../../types/MordListener.js');
const { Message } = require('discord.js');

class CommandCancelledListener extends Listener {
  constructor () {
    super('commandCancelled', {
      emitter: 'commandHandler',
      event: 'commandCancelled'
    });
  }

  exec (message, command) {
    message.util.addMessage(message);

    if (!command.destruct) return;
    message.util.messages.forEach(m => {
      if (m instanceof Message && m.channel.type !== 'dm') {
        m.delete({
          timeout: command.destruct,
          reason: 'command cleanup'
        });
      }
    });
  }
}

module.exports = CommandCancelledListener;
