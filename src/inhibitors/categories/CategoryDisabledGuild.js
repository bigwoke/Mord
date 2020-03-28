const Inhibitor = require('../../MordInhibitor.js')

class CategoryDisabledGuildInhibitor extends Inhibitor {
  constructor () {
    super('categoryDisabledGuild', {
      reason: 'categoryDisabledGuild',
      priority: 2
    })
  }

  exec (message, command) {
    if (message.channel.type === 'dm') return false

    const disabledCategories = this.client.settings.get(message.guild.id, 'disabled_cat')
    if (disabledCategories && disabledCategories[command.category.id]) return true
  }
}

module.exports = CategoryDisabledGuildInhibitor
