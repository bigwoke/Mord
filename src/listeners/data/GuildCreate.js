const { Listener } = require('discord-akairo')

class GuildCreateListener extends Listener {
  constructor () {
    super('guildCreate', {
      emitter: 'client',
      event: 'guildCreate'
    })
  }

  exec (guild) {
    this.client.data.preloadGuild(guild)
  }
}

module.exports = GuildCreateListener
