const Listener = require('../../types/MordListener');
const log = require('../../helpers/log');

class CommandBlockedListener extends Listener {
  constructor () {
    super('commandBlocked', {
      emitter: 'commandHandler',
      event: 'commandBlocked',
      destruct: 3000
    });
  }

  exec (message, command, reason) {
    const source = message.channel.type === 'dm'
      ? `DM with ${message.author.tag}`
      : `channel '${message.channel.name}' of guild '${message.guild.name}'`;
    log.debug(`Command '${command.id}' blocked in ${source} because '${reason}'`);

    switch (reason) {
      case 'commandDisabledGuild':
        this.send(message, `\`${command.id}\` is disabled in this server.`);
        break;
      default:
        break;
    }
  }
}

module.exports = CommandBlockedListener;
