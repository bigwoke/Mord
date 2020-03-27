const { Listener } = require('discord-akairo')
const { Message } = require('discord.js')
const { isPromise } = require('../../../Tools.js')

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
    message.util.messages.forEach(async msg => {
      if (isPromise(msg)) msg = await msg
      if (msg instanceof Message && msg.channel.type !== 'dm') {
        msg.delete({
          timeout: command.destruct,
          reason: 'command cleanup'
        })
      }
    })
  }
}

module.exports = CommandFinishedListener
