const Inhibitor = require('../../types/MordInhibitor');

class BlacklistGlobal extends Inhibitor {
  constructor () {
    super('blacklistGlobal', {
      reason: 'blacklistGlobal',
      priority: 2
    });
  }

  exec (message) {
    const globalBlacklist = this.client.settings.get('global', 'blacklist', []);
    return globalBlacklist.some(user => user.id === message.author.id);
  }
}

module.exports = BlacklistGlobal;
