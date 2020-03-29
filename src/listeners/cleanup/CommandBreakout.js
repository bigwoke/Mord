const Listener = require('../../types/MordListener.js')

/*
 * Akairo constant object is missing COMMAND_BREAKOUT object
 * entry, inadvertently setting it as a property instead.
 */
const { CommandHandlerEvents } = require('discord-akairo/src/util/Constants')
const { Message } = require('discord.js')

class CommandBreakoutListener extends Listener {
  constructor () {
    super('commandBreakout', {
      emitter: 'commandHandler',
      event: CommandHandlerEvents.COMMAND_BREAKOUT
    })
  }

  exec (message, command, newMessage) {
    message.util.addMessage(message)

    if (!command.destruct) return
    message.util.messages.forEach(m => {
      if (m instanceof Message && m.channel.type !== 'dm') {
        if (m === newMessage) return
        m.delete({
          timeout: command.destruct,
          reason: 'command cleanup'
        })
      }
    })
  }
}

module.exports = CommandBreakoutListener
