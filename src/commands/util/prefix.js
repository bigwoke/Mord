const Command = require('../../types/MordCommand.js');
const cfg = require('../../../config.js');
const { isDM } = require('../../helpers/Tools.js');

class PrefixCommand extends Command {
  constructor () {
    super('prefix', {
      aliases: ['prefix'],
      category: 'util',
      description: 'Displays or changes the current prefix.',
      details: 'Depending on the context, this command will return either ' +
        'the current guild prefix (if in a guild), or the global bot prefix, ' +
        'which also acts as the default prefix if no custom one is set in a ' +
        'guild. It will indicate when the guild prefix is the same as the ' +
        'global prefix, and guild members with "Manage Channels" have the ' +
        'ability to change the guild prefix.',
      destruct: 10000,
      ratelimit: 2,
      examples: [
        {
          text: 'prefix'
        },
        {
          text: 'prefix ?',
          userPermissions: 'MANAGE_CHANNELS'
        },
        {
          text: 'prefix >> --global',
          ownerOnly: true
        }
      ],
      args: [
        {
          id: 'prefix',
          userPermissions: 'MANAGE_CHANNELS',
          description: 'New prefix to use.'
        },
        {
          id: 'global',
          match: 'flag',
          flag: '--global',
          ownerOnly: true
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
    if (isOwner || message.member.hasPermission(args.prefix.userPermissions)) {
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
      info: '\nUsers with the "Manage Channels" permission can change this.'
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
      ? responses.info
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
