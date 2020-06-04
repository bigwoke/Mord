const Listener = require('../../types/MordListener');
const log = require('../../helpers/log');

class GuildCreateListener extends Listener {
  constructor () {
    super('guildCreate', {
      emitter: 'client',
      event: 'guildCreate'
    });
  }

  exec (guild) {
    log.verbose(`Joined guild ${guild.name} (${guild.id}).`);
    this.client.data.setupGuild(guild);
  }
}

module.exports = GuildCreateListener;
