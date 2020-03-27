const { Listener } = require('discord-akairo')
const log = require('../../../log.js')

class CommandRegister extends Listener {
  constructor () {
    super('commandRegister', {
      emitter: 'commandHandler',
      event: 'load'
    })
  }

  exec (command) {
    const { settings } = command.client
    settings.items.forEach(item => {
      const isDisabled = item.disabled_cmd[command.id]
      if (isDisabled) command.disabledIn.add(command.id)
    })

    command.client.on('ready', () => {
      const disabledCommands = settings.get('global', 'disabled_cmd')
      if (disabledCommands && disabledCommands[command.id]) {
        command.globalEnabled = false
      }
    })

    log.verbose(`Command ${command.id} loaded.`)
  }
}

module.exports = CommandRegister
