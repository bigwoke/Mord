const Inhibitor = require('../../types/MordInhibitor');

class BlacklistGuild extends Inhibitor {
  constructor () {
    super('blacklistGuild', {
      reason: 'blacklistGuild',
      priority: 1
    });
  }

  exec (message) {
    // Don't inhibit DM commands because they are global
    if (message.channel.type === 'dm') return false;

    const guildBlacklist = this.client.settings.get(message.guild.id, 'blacklist', []);
    return guildBlacklist.some(user => user.id === message.author.id);
  }
}

module.exports = BlacklistGuild;
