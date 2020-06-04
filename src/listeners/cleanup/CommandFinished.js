const Listener = require('../../types/MordListener');
const { Message } = require('discord.js');
const { isPromise } = require('../../helpers/tools');

class CommandFinishedListener extends Listener {
  constructor () {
    super('commandFinished', {
      emitter: 'commandHandler',
      event: 'commandFinished'
    });
  }

  exec (message, command) {
    message.util.addMessage(message);

    if (!command.destruct) return;

    const deleteMessages = () => {
      message.util.messages.forEach(async msg => {
        if (isPromise(msg)) msg = await msg;
        if (msg instanceof Message && msg.channel.type !== 'dm') {
          msg.delete({
            reason: 'command cleanup'
          });
        }
      });
    };

    setTimeout(deleteMessages, command.destruct);
  }
}

module.exports = CommandFinishedListener;
