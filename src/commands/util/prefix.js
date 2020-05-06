const Command = require('../../types/MordCommand');
const cfg = require('../../../config');
const { isDM } = require('../../helpers/tools');

class PrefixCommand extends Command {
  constructor () {
    super('prefix', {
      aliases: ['prefix'],
      category: 'util',
      description: 'Displays or changes the current prefix.',
      destruct: 10000,
      cooldown: 5000,
      ratelimit: 2,
      args: [
        {
          id: 'prefix'
        },
        {
          id: 'global',
          match: 'flag',
          flag: '--global'
        }
      ]
    });
  }

  exec (message, args) {
    const action = this.getAction(message, args);

    // If a prefix needs to be set or changed, call setPrefixes
    if (action.includes('set')) this.setPrefixes(message, args, action);

    this.sendMessage(message, args, action, args.prefix === 'default');
  }

  getAction (message, args) {
    const isOwner = this.client.isOwner(message.author);

    // If no new prefix is given, return current prefix in some scope.
    if (args.prefix === null) {
      return args.global || isDM(message) ? 'returnGlobal' : 'returnGuild';
    }

    // If global scope, set global prefix if owner or return it if not.
    if (args.global || isDM(message)) {
      return isOwner ? 'setGlobal' : 'returnGlobal';
    }

    // In guild scope, if member has permission, set prefix.
    if (isOwner || message.member.hasPermission('MANAGE_MESSAGES')) {
      return 'setGuild';
    }

    // Otherwise, just return the guild prefix.
    return 'returnGuild';
  }

  sendMessage (message, args, action, isReset) {
    const { settings } = this.client;
    const currentGlobal = this.client.settings.get('global', 'prefix');

    // If the message has a guild, set currentPrefix and name to proper values
    const [currentPrefix, name] = message.guild
      ? [
        settings.get(message.guild.id, 'prefix') || currentGlobal,
        message.guild.name
      ]
      : [null, null];

    const responses = {
      returnGlobal: `Global prefix is currently: \`${currentGlobal}\``,
      returnGuild: `Prefix in \`${name}\` is currently: \`${currentPrefix}\``,
      setGlobal: `Global prefix has been set to: \`${args.prefix}\``,
      setGuild: `Prefix in \`${name}\` is now: \`${args.prefix}\``,
      resetGlobal: `Global prefix reset to default: \`${cfg.client.prefix}\``,
      resetGuild: `Prefix in \`${name}\` reset to: \`${currentGlobal}\``,
      info: '\nUsers with the "Manage Messages" permission can change this.'
    };

    if (['setGlobal', 'setGuild'].includes(action) && isReset) {
      action = `re${action}`;
    }

    let response = responses[action];

    // If the current guild prefix is the same as global, append relevant text.
    response += action === 'returnGuild' && currentPrefix === currentGlobal
      ? ' (same as global)'
      : '';

    // If the user lacks permission to change prefix, append appropriate info.
    response += action === 'returnGuild' && args.prefix
      ? response += responses.info
      : '';

    this.send(message, response);
  }

  setPrefixes (message, args, action) {
    const { settings } = this.client;
    const guildID = message.guild ? message.guild.id : null;

    if (action === 'setGlobal') {
      if (args.prefix === 'default') {
        settings.set('global', 'prefix', cfg.client.prefix);
      } else {
        settings.set('global', 'prefix', args.prefix);
      }
    } else if (action === 'setGuild') {
      if (args.prefix === 'default') {
        settings.delete(guildID, 'prefix');
      } else {
        settings.set(guildID, 'prefix', args.prefix);
      }
    }
  }
}

module.exports = PrefixCommand;
