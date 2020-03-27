const Listener = require('../../MordListener.js')
const log = require('../../../log.js')

class CommandBreakoutListener extends Listener {
  constructor () {
    super('commandBlocked', {
      emitter: 'commandHandler',
      event: 'commandBlocked',
      destruct: 3000
    })
  }

  exec (message, command, reason) {
    const source = message.channel === 'dm'
      ? `DM with ${message.author.tag}`
      : `channel '${message.channel.name}' of guild '${message.guild.name}'`
    log.silly(`Command '${command.id}' blocked in ${source} because '${reason}'`)

    switch (reason) {
      case 'commandDisabledGuild':
        this.send(message, `\`${command.id}\` is disabled in this server.`)
        break
      default:
        break
    }
  }
}

module.exports = CommandBreakoutListener
