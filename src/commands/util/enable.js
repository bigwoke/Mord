const { Argument } = require('discord-akairo')
const Command = require('../../MordCommand.js')
const { isDM } = require('../../../Tools.js')

class EnableCommand extends Command {
  constructor () {
    super('enable', {
      aliases: ['enable'],
      category: 'util',
      description: 'Enables the specified command in the current guild if ' +
        'disabled, or globally (not in each guild) with the --global flag. ' +
        'Categories must be prefixed with `category:` to distinguish them ' +
        'from commands.',
      destruct: 10000,
      protected: true,
      cooldown: 5000,
      ratelimit: 2,
      userPermissions: 'ADMINISTRATOR',
      args: [
        {
          id: 'mod',
          type: EnableCommand.determineType,
          prompt: {
            start: 'Which command or category do you want to enable? ' +
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
    })
  }

  exec (message, args) {
    // Set type of module to enable and get scope of this command.
    const type = args.mod instanceof Command ? 'command' : 'category'
    const scope = this.getScope(message, args)
    if (!scope) return

    // If the user gave an 'all' wildcard (command/category), just enable all.
    if (args.mod.includes && args.mod.includes('*')) return this.enableAll(message, args, scope)

    // Get responses and put together + send the appropriate end response.
    const responses = EnableCommand.getResponses(message, args, type, scope)
    const result = this.runLogic(message, args, scope)
    const resp = scope !== 'global' && !args.mod.globalEnabled
      ? responses[result] + responses.warning
      : responses[result]
    this.send(message, resp)

    // Enable the command if it should be, otherwise return.
    if (result === 'failure') return
    return this.client.settings.set(
      scope,
      type === 'command' ? 'disabled_cmd' : 'disabled_cat',
      { [args.mod.id]: false }
    )
  }

  /**
   * Enables all of given type (cmd/cat) available to the client in the given scope.
   * @param {Message} message - Prompting message used for context.
   * @param {Object} args - Parsed arguments from the command.
   * @param {string} scope - Where the command impacts, global or guild ID.
   * @returns {Promise<Message>}
   */
  enableAll (message, args, scope) {
    const type = args.mod === '*' ? 'command' : 'category'
    const { settings } = this.client
    const { modules, categories } = this.handler

    if (type === 'command') {
      modules.forEach(cmd => {
        if (cmd.disabledIn.has(scope)) cmd.disabledIn.delete(message.guild.id)
        settings.set(scope, 'disabled_cmd', { [cmd]: false })
      })
    }
    if (type === 'category') {
      categories.forEach(cat => {
        if (cat.disabledIn.has(scope)) cat.disabledIn.delete(message.guild.id)
        settings.set(scope, 'disabled_cat', { [cat]: false })
      })
    }

    return this.send(message, EnableCommand.getResponses(message, args, type, scope).all)
  }

  /**
   * Get the scope of the enabling action, either global or guild.
   * @param {Message} message - Prompting message used for context.
   * @param {Object} args - Parsed arguments from the command.
   * @returns {string|null} 'Global' or specific guild ID, otherwise null.
   */
  getScope (message, args) {
    if (this.client.isOwner(message.author)) {
      if (args.global) return 'global'
      if (isDM(message)) return 'global'
    }
    if (message.channel.type === 'text') return message.guild.id
    return null
  }

  /**
   * Determine whether a command should be enabled, if so then set status.
   * @param {Message} message - Prompting message used for context.
   * @param {Object} args - Parsed arguments from the command.
   * @param {string} scope - Where the command impacts, global or guild ID.
   * @returns {string} 'success' or 'failure' result from enabling.
   */
  runLogic (message, args, scope) {
    if (scope === 'global' && !args.mod.globalEnabled) {
      args.mod.globalEnabled = true
      return 'success'
    }
    if (args.mod.disabledIn.has(message.guild.id)) {
      args.mod.disabledIn.delete(message.guild.id)
      return 'success'
    }
    return 'failure'
  }

  /**
   * Determine whether the given argument is a command, category, or all wildcard.
   * @param {Message} message - Prompting message used for context.
   * @param {string} phrase - Argument text content.
   * @returns {Command|Category|string|null}
   */
  static async determineType (message, phrase) {
    const { resolver } = this.handler
    const catFlag = 'category:'
    const cmd = await Argument.cast('commandAlias', resolver, message, phrase)
    const cat = await Argument.cast('category', resolver, message, phrase.substr(catFlag.length))
    const all = await Argument.cast(['*', 'category:*'], resolver, message, phrase)
    return cmd || cat || all || null
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
    }
  }
}

module.exports = EnableCommand
