const { Listener } = require('discord-akairo')
const { Message } = require('discord.js')

class CommandFinishedListener extends Listener {
  constructor () {
    super('commandFinished', {
      emitter: 'commandHandler',
      event: 'commandFinished'
    })
  }

  exec (message, command) {
    message.util.addMessage(message)

    if (!command.destruct) return
    message.util.messages.forEach(m => {
      if (m instanceof Message && m.channel.type !== 'dm') {
        m.delete({
          timeout: command.destruct,
          reason: 'command cleanup'
        })
      }
    })
  }
}

module.exports = CommandFinishedListener
