const Command = require('../../types/MordCommand');
const { isDM } = require('../../helpers/tools');

class BlacklistedCommand extends Command {
  constructor () {
    super('blacklisted', {
      aliases: ['blacklisted', 'blacklist-list'],
      category: 'mod',
      description: 'Lists users on the blacklist.',
      details: 'Blacklisted users can be added or removed using `blacklist`, ' +
        'and checked with `blacklisted`. Blacklisted users cannot use bot ' +
        'functions in the scope they are blacklisted in.',
      destruct: 3000,
      userPermissions: 'BAN_MEMBERS',
      args: [
        {
          id: 'global',
          match: 'flag',
          flag: '--global',
          description: 'Whether the action should be applied globally.',
          ownerOnly: true
        }
      ],
      examples: [
        {
          text: 'blacklisted'
        },
        {
          text: 'blacklisted --global',
          ownerOnly: true
        }
      ]
    });
  }

  exec (message, args) {
    const scope = this.getScope(message, args);
    if (!scope) return;

    // Get blacklist from settings and check if it has users.
    const blacklist = this.client.settings.get(scope, 'blacklist', []);
    const environment = scope === 'global' ? 'global' : message.guild.name;

    if (blacklist.length === 0) {
      return this.send(message, `No users are on the ${environment} blacklist.`);
    }

    // Build response and send messages.
    const resp = this.buildResponse(blacklist, environment);

    if (!isDM(message)) this.send(message, 'Check your DMs for a list of blacklisted users.');
    message.author.send(`${resp}\n\u200b`);
  }

  /**
   * Builds the response containing blacklisted users.
   * @param {Array} blacklist - Blacklist in the message's environment.
   * @param {string} environment - Message environment; 'global' or guild name.
   * @returns {string}
   */
  buildResponse (blacklist, environment) {
    let resp = `The following users are on the ${environment} blacklist:\n`;

    const users = [];
    for (const u of blacklist) {
      users.push(`__${u.username}#${u.discriminator}__ (${u.id})`);
    }

    resp += users.join(', ');
    return resp;
  }

  /**
   * Get the scope of the disable action, either global or guild.
   * @param {Message} message - Prompting message used for context.
   * @param {Object} args - Parsed arguments from the command.
   * @returns {string|null} 'Global' or specific guild ID, otherwise null.
   */
  getScope (message, args) {
    if (this.client.isOwner(message.author)) {
      if (args.global) return 'global';
      if (isDM(message)) return 'global';
    }
    if (message.channel.type === 'text') return message.guild.id;
    return null;
  }
}

module.exports = BlacklistedCommand;
