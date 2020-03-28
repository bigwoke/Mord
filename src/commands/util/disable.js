const { Argument } = require('discord-akairo')
const Command = require('../../MordCommand.js')
const { isDM } = require('../../../Tools.js')

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
    })
  }

  exec (message, args) {
    // Set type of module to disable and get scope of command.
    const type = args.mod instanceof Command ? 'command' : 'category'
    const scope = this.getScope(message, args)
    if (!scope) return

    const responses = DisableCommand.getResponses(message, args, type, scope)
    if (this.modIsProtected(args)) return this.send(message, responses.prot)

    // Determine whether the command should be disabled, respond accordingly.
    const result = this.runLogic(message, args, scope)
    const resp = scope !== 'global' && !args.mod.globalEnabled
      ? responses[result] + responses.warning
      : responses[result]
    this.send(message, resp)

    // If the command needs to be disabled, do it. Return otherwise.
    if (result === 'failure') return
    return this.client.settings.set(
      scope,
      type === 'command' ? 'disabled_cmd' : 'disabled_cat',
      { [args.mod.id]: true }
    )
  }

  /**
   * Get the scope of the disable action, either global or guild.
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
   * Determine whether a command is protected or a category contains one that is.
   * @param {Object} args - Parsed arguments from the command.
   * @returns {boolean}
   */
  modIsProtected (args) {
    const protectedInCategory = args.mod.some && args.mod.some(cmd => cmd.protected)
    return args.mod.protected || protectedInCategory
  }

  /**
   * Determine whether a command should be disabled, if so then set status.
   * @param {Message} message - Prompting message used for context.
   * @param {Object} args - Parsed arguments from the command.
   * @param {string} scope - Where the command impacts, global or guild ID.
   * @returns {string} 'success' or 'failure' result from disabling.
   */
  runLogic (message, args, scope) {
    if (scope === 'global' && args.mod.globalEnabled) {
      args.mod.globalEnabled = false
      return 'success'
    }
    if (!args.mod.disabledIn.has(message.guild.id)) {
      args.mod.disabledIn.add(message.guild.id)
      return 'success'
    }
    return 'failure'
  }

  /**
   * Determine whether the given argument is a command or category.
   * @param {Message} message - Prompting message used for context.
   * @param {string} phrase - Argument text content.
   * @returns {Command|Category|null}
   */
  static async determineType (message, phrase) {
    const { resolver } = this.handler
    const catFlag = 'category:'
    const cmd = await Argument.cast('commandAlias', resolver, message, phrase)
    const cat = await Argument.cast('category', resolver, message, phrase.substr(catFlag.length))
    return cmd || cat || null
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
      disabledGlobally: `The \`${args.mod.id}\` ${type} is already disabled globally.`,
      warning: `\nThis ${type} is disabled globally, so in the instance that it is ` +
        'enabled in a global scope, it will remain disabled here.',
      success: `The \`${args.mod.id}\` ${type} is now disabled ` +
        `${scope === 'global' ? 'globally' : `in ${message.guild.name}`}.`,
      failure: `The \`${args.mod.id}\` ${type} is already disabled ` +
        `${scope === 'global' ? 'globally' : `in ${message.guild.name}`}.`
    }
  }
}

module.exports = DisableCommand
