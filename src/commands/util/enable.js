const { Argument } = require('discord-akairo');
const Command = require('../../types/MordCommand');
const { isDM } = require('../../helpers/tools');

class EnableCommand extends Command {
  constructor () {
    super('enable', {
      aliases: ['enable'],
      category: 'util',
      description: 'Enables a command or category in a guild.',
      details: 'Enables the specified command or category in the current ' +
        'guild if disabled. Categories must be prefixed with `category:` to ' +
        'distinguish them from commands. Will prompt for a module to enable ' +
        'if none is provided, and will not breakout if a command is used ' +
        'mid-prompt. This command, like disable, requires "Manage Server."',
      destruct: 10000,
      protected: true,
      ratelimit: 2,
      userPermissions: 'MANAGE_GUILD',
      examples: [
        {
          text: 'enable',
          notes: 'prompts for argument'
        },
        {
          text: 'enable prefix'
        },
        {
          text: 'enable prefix --global',
          notes: 'enables prefix command across all guilds',
          ownerOnly: true
        }
      ],
      args: [
        {
          id: 'mod',
          type: EnableCommand.determineType,
          description: 'Module to enable, either command or category.',
          prompt: {
            breakout: false,
            start: 'Which command or category do you want to enable? ' +
            'Categories must use `category:` flag, i.e. `category:name`.',
            retry: 'That command or category does not exist, try again.'
          }
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
    // Get effective scope of this command.
    const scope = this.getScope(message, args);
    if (!scope) return;

    // If the user gave an 'all' wildcard (command/category), just enable all.
    if (args.mod.includes && args.mod.includes('*')) return this.enableAll(message, args, scope);

    // Enable command/category if necessary, send end message.
    const result = this.runLogic(message, args, scope);
    return this.sendResponse(message, args, scope, result);
  }

  /**
   * Enables all of given type (cmd/cat) available to the client in the given scope.
   * @param {Message} message - Prompting message used for context.
   * @param {Object} args - Parsed arguments from the command.
   * @param {string} scope - Where the command impacts, global or guild ID.
   * @returns {Promise<Message>}
   */
  enableAll (message, args, scope) {
    // Set collection to enable, data key, and type based on input.
    const collToEnable = args.mod === '*' ? this.handler.modules : this.handler.categories;
    const dataKey = args.mod === '*' ? 'disabled_cmd' : 'disabled_cat';
    const type = args.mod === '*' ? 'command' : 'category';

    // Every module with a current true (disabled) value is enabled.
    const disabledModules = this.client.settings.get(scope, dataKey);
    for (const mod of collToEnable) {
      if (disabledModules[mod.id] === true) this.enableModule(scope, dataKey, mod);
    }

    return this.send(message, EnableCommand.getResponses(message, args, type, scope).all);
  }

  /**
   * Enables a command using the given scope, key, and module
   * @param {string} scope - Where the command impacts, global or guild ID.
   * @param {string} dataKey - Key to set data for, `disabled_cmd` or `disabled_cat`.
   * @param {Command|Category} mod - Command or Category to enable.
   * @returns {Promise}
   */
  enableModule (scope, dataKey, mod) {
    return this.client.settings.set(scope, dataKey, { [mod.id]: false });
  }

  /**
   * Get the scope of the enabling action, either global or guild.
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
   * Determine whether a command should be enabled, if so then set status.
   * @param {Message} message - Prompting message used for context.
   * @param {Object} args - Parsed arguments from the command.
   * @param {string} scope - Where the command impacts, global or guild ID.
   * @returns {string} 'success' or 'failure' result from enabling.
   */
  runLogic (message, args, scope) {
    const dataKey = args.mod instanceof Command ? 'disabled_cmd' : 'disabled_cat';
    const disabledModules = this.client.settings.get(scope, dataKey);

    if (disabledModules[args.mod.id] === true) {
      this.enableModule(scope, dataKey, args.mod);
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
    const responses = EnableCommand.getResponses(message, args, type, scope);

    const globalEnabled = this.client.settings.get('global', dataKey)[args.mod.id] === false;
    const resp = scope !== 'global' && !globalEnabled
      ? responses[result] + responses.warning
      : responses[result];
    return this.send(message, resp);
  }

  /**
   * Determine whether the given argument is a command, category, or all wildcard.
   * @param {Message} message - Prompting message used for context.
   * @param {string} phrase - Argument text content.
   * @returns {Command|Category|string|null}
   */
  static async determineType (message, phrase) {
    const { resolver } = this.handler;
    const catFlag = 'category:';
    const cmd = await Argument.cast('commandAlias', resolver, message, phrase);
    const cat = await Argument.cast('category', resolver, message, phrase.substr(catFlag.length));
    const all = await Argument.cast(['*', 'category:*'], resolver, message, phrase);
    return cmd || cat || all || null;
  }

  /**
   * Get object of responses for enabling options.
   * @param {Message} message - Prompting message used for context.
   * @param {Object} args - Parsed arguments from the command.
   * @param {string} type - Argument type, either 'command' or 'category'.
   * @param {string} scope - Where the command impacts, global or guild ID.
   * @returns {Object}
   */
  static getResponses (message, args, type, scope) {
    return {
      warning: `\nThis ${type} is disabled globally, so it will remain ` +
      'unusable until it is enabled in a global scope.',
      success: `The \`${args.mod.id}\` ${type} is now enabled for use ` +
        `${scope === 'global' ? 'globally' : `in ${message.guild.name}`}.`,
      failure: `The \`${args.mod.id}\` ${type} is already enabled for use ` +
        `${scope === 'global' ? 'globally' : `in ${message.guild.name}`}.`,
      all: `Any disabled ${type} modules have now been enabled ` +
        `${scope === 'global' ? 'globally' : `in ${message.guild.name}`}.`
    };
  }
}

module.exports = EnableCommand;
