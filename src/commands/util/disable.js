const { Argument } = require('discord-akairo');
const Command = require('../../types/MordCommand.js');
const { isDM, isProtected } = require('../../helpers/Tools.js');

class DisableCommand extends Command {
  constructor () {
    super('disable', {
      aliases: ['disable'],
      category: 'util',
      description: 'Disables the specified command or category in the current ' +
        'guild, or globally with the --global flag. Categories must be prefixed ' +
        'with `category:` to distinguish them from commands.',
      destruct: 10000,
      protected: true,
      cooldown: 5000,
      ratelimit: 2,
      userPermissions: 'ADMINISTRATOR',
      args: [
        {
          id: 'mod',
          type: DisableCommand.determineType,
          prompt: {
            start: 'Which command or category do you want to disable? ' +
              'Categories must use `category:` flag, i.e. `category:name`.',
            retry: 'That command or category does not exist, try again.'
          }
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
    // Get effective scope of command.
    const scope = this.getScope(message, args);
    if (!scope) return;

    if (isProtected(args)) return this.sendResponse(message, args, scope, 'prot');

    // Disable the command if needed, respond accordingly.
    const result = this.runLogic(message, args, scope);
    return this.sendResponse(message, args, scope, result);
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
   * Determine whether a command should be disabled, if so then set status.
   * @param {Message} message - Prompting message used for context.
   * @param {Object} args - Parsed arguments from the command.
   * @param {string} scope - Where the command impacts, global or guild ID.
   * @returns {string} 'success' or 'failure' result from disabling.
   */
  runLogic (message, args, scope) {
    const dataKey = args.mod instanceof Command ? 'disabled_cmd' : 'disabled_cat';
    const disabledModules = this.client.settings.get(scope, dataKey);

    if (disabledModules[args.mod.id] === false) {
      this.client.settings.set(scope, dataKey, { [args.mod.id]: true });
      return 'success';
    }
    return 'failure';
  }

  /**
   * Sends the end response to the user to reflect changes made.
   * @param {Message} message - Prompting message used for context.
   * @param {Object} args - Parsed arguments from the command.
   * @param {string} scope - Where the command impacts, global or guild ID.
   * @param {string} result - Result of prior command processing.
   * @returns {Promise<Message>}
   */
  sendResponse (message, args, scope, result) {
    const type = args.mod instanceof Command ? 'command' : 'category';
    const dataKey = args.mod instanceof Command ? 'disabled_cmd' : 'disabled_cat';
    const responses = DisableCommand.getResponses(message, args, type, scope);
    if (result === 'prot') return this.send(message, responses[result]);

    const globalEnabled = this.client.settings.get('global', dataKey)[args.mod.id] === false;
    const resp = scope !== 'global' && !globalEnabled
      ? responses[result] + responses.warning
      : responses[result];
    return this.send(message, resp);

  }

  /**
   * Determine whether the given argument is a command or category.
   * @param {Message} message - Prompting message used for context.
   * @param {string} phrase - Argument text content.
   * @returns {Command|Category|null}
   */
  static async determineType (message, phrase) {
    const { resolver } = this.handler;
    const catFlag = 'category:';
    const cmd = await Argument.cast('commandAlias', resolver, message, phrase);
    const cat = await Argument.cast('category', resolver, message, phrase.substr(catFlag.length));
    return cmd || cat || null;
  }

  /**
   * Get object of responses for disabling options.
   * @param {Message} message - Prompting message used for context.
   * @param {Object} args - Parsed arguments from the command.
   * @param {string} type - Argument type, either 'command' or 'category'.
   * @param {string} scope - Where the command impacts, global or guild ID.
   * @returns {Object}
   */
  static getResponses (message, args, type, scope) {
    return {
      prot: `Sorry, the \`${args.mod.id}\` ${type} is protected and can't be disabled.`,
      warning: `\nThis ${type} is disabled globally, so in the instance that it is ` +
        'enabled in a global scope, it will remain disabled here.',
      success: `The \`${args.mod.id}\` ${type} is now disabled ` +
        `${scope === 'global' ? 'globally' : `in ${message.guild.name}`}.`,
      failure: `The \`${args.mod.id}\` ${type} is already disabled ` +
        `${scope === 'global' ? 'globally' : `in ${message.guild.name}`}.`
    };
  }
}

module.exports = DisableCommand;
