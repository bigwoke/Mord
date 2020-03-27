const Inhibitor = require('../MordInhibitor.js')

class DisabledGuildInhibitor extends Inhibitor {
  constructor () {
    super('disabledGuild', {
      reason: 'disabledGuild',
      priority: 1
    })
  }

  exec (message, command) {
    // Don't inhibit DM commands, that's for CommandDisabledGlobalInhibitor.
    if (message.channel.type === 'dm') return false

    // If this guild has commands disabled, and this command is one of them, inhibit.
    const disabledCommands = this.client.settings.get(message.guild.id, 'disabled_cmd')
    if (disabledCommands && disabledCommands[command.id]) return true
  }
}

module.exports = DisabledGuildInhibitor
