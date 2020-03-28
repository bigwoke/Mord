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
    command.client.on('ready', () => {
      const { settings } = command.client

      settings.items.forEach(item => {
        const isDisabled = item.disabled_cmd[command.id]
        if (isDisabled) command.disabledIn.add(item._id)
      })

      const disabledCommands = settings.get('global', 'disabled_cmd')
      if (disabledCommands && disabledCommands[command.id]) {
        command.globalEnabled = false
      }
    })

    this.verifyID(command)
    log.verbose(`Command ${command.id} loaded.`)
  }

  verifyID (command) {
    const { categories } = command.handler
    const duplicateID = categories.some(cat => cat.id === command.id)
    if (duplicateID) throw new Error('Category and command IDs must be unique.')
  }
}

module.exports = CommandRegister
