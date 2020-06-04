const Command = require('../../types/MordCommand');
const { isDM } = require('../../helpers/tools');

class BlacklistCommand extends Command {
  /* eslint-disable-next-line max-lines-per-function */
  constructor () {
    super('blacklist', {
      aliases: ['blacklist', 'block'],
      category: 'mod',
      description: 'Adds or removes a user from the blacklist.',
      details: 'Blacklisted users will not be able to use the bot in any ' +
        'capacity, though they can still be included in quotes or other ' +
        'similar functions.',
      destruct: 8000,
      ratelimit: 2,
      userPermissins: 'KICK_MEMBERS',
      args: [
        {
          id: 'action',
          type: BlacklistCommand.determineType,
          description: 'Whether to add or remove a user.',
          unordered: true,
          prompt: {
            start: 'Do you want to `add` or `remove` a user?',
            retry: 'That isn\'t an option, try again.'
          }
        },
        {
          id: 'user',
          type: 'member',
          description: 'User to add or remove from whitelist.',
          unordered: true,
          prompt: {
            start: 'Who do you want to add/remove?',
            retry: 'Could not find a guild member. Try again.'
          }
        },
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
          text: 'blacklist',
          notes: 'prompts for action and user'
        },
        {
          text: 'blacklist add',
          notes: 'prompts for user'
        },
        {
          text: 'blacklist remove @Mord'
        },
        {
          text: 'blacklist add @Mord --global',
          ownerOnly: true
        }
      ]
    });
  }

  exec (message, args) {
    args.user = args.user.user;
    const scope = this.getScope(message, args);
    if (!scope) return;

    if (args.action === 'add') this.addToBlacklist(message, args, scope);
    else this.removeFromBlacklist(message, args, scope);
  }

  /**
   * Adds a user to the blacklist in the given scope.
   * @param {Message} message - Prompting message used for context.
   * @param {Object} args - Parsed arguments from the command.
   * @param {string} scope - 'Global' or specific guild ID.
   * @returns {Message}
   */
  addToBlacklist (message, args, scope) {
    const { settings } = this.client;
    const blacklist = settings.get(scope, 'blacklist', []);

    // If the user is already blacklisted, abort.
    for (const entry of blacklist) {
      if (entry.id === args.user.id) {
        return this.send(message, 'That user is already blacklisted.');
      }
    }

    // Push the new blacklisted user to the array and set it.
    blacklist.push(args.user);
    settings.set(scope, 'blacklist', blacklist);

    return this.send(message, `${args.user.tag} added to 
      \`${scope === 'global' ? 'global' : message.guild.name}\` blacklist.`);
  }

  /**
   * Removes a user from the blacklist in the given scope.
   * @param {Message} message - Prompting message used for context.
   * @param {Object} args - Parsed arguments from the command.
   * @param {string} scope - 'Global' or specific guild ID.
   * @returns {Message}
   */
  removeFromBlacklist (message, args, scope) {
    const { settings } = this.client;
    let blacklist = settings.get(scope, 'blacklist', []);

    // If the user is not present in the blacklist, abort.
    let present = false;
    for (const entry of blacklist) if (entry.id === args.user.id) present = true;
    if (!present) return this.send(message, 'That user is not blacklisted.');

    // Filter the blacklisted user out of the array and set it.
    blacklist = blacklist.filter(u => u.id !== args.user.id);
    settings.set(scope, 'blacklist', blacklist);

    return this.send(message, `${args.user.tag} removed from
      ${scope === 'global' ? 'global' : message.guild.name} blacklist.`);
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

  /**
   * Determine action to take on the given user, add or remove.
   * @param {Message} message - Prompting message used for context.
   * @param {string} phrase - Argument text content.
   * @returns {string|null}
   */
  static determineType (message, phrase) {
    phrase = phrase.toLowerCase();
    return ['add', 'remove'].includes(phrase) ? phrase : null;
  }
}

module.exports = BlacklistCommand;
