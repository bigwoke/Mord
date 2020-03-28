const { Listener } = require('discord-akairo')
const log = require('../../../log.js')

class GuildCreateListener extends Listener {
  constructor () {
    super('guildCreate', {
      emitter: 'client',
      event: 'guildCreate'
    })
  }

  exec (guild) {
    log.verbose(`Joined guild ${guild.name} (${guild.id}).`)
    this.client.data.preloadGuild(guild)
  }
}

module.exports = GuildCreateListener
