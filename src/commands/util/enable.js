const { Argument } = require('discord-akairo')
const Command = require('../../MordCommand.js')
const { isDM } = require('../../../Tools.js')

class EnableCommand extends Command {
  constructor () {
    super('enable', {
      aliases: ['enable'],
      category: 'util',
      description: 'Enables the specified command in the current guild if ' +
        'disabled, or globally (not in specific guilds) with the --global flag.',
      destruct: 10000,
      protected: true,
      cooldown: 5000,
      ratelimit: 2,
      userPermissions: 'ADMINISTRATOR',
      args: [
        {
          id: 'mod',
          type: Argument.union('category', 'command', 'commandAlias'),
          prompt: {
            start: 'Which command or category do you want to enable?',
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
    const type = args.mod instanceof Command ? 'command' : 'category'
    const scope = this.getScope(message, args)
    if (!scope) return

    const responses = {
      warning: `\nThis ${type} is disabled globally, so it will remain ` +
        'unusable until it is enabled in a global scope.',
      success: `The \`${args.mod.id}\` ${type} is now enabled for use ` +
        `${scope === 'global' ? 'globally' : `in ${message.guild.name}`}.`,
      failure: `The \`${args.mod.id}\` ${type} is already enabled for use ` +
        `${scope === 'global' ? 'globally' : `in ${message.guild.name}`}.`
    }

    const result = this.runLogic(message, args, scope)
    const resp = scope !== 'global' && !args.mod.globalEnabled
      ? responses[result] + responses.warning
      : responses[result]

    this.send(message, resp)
    if (result === 'failure') return

    return this.client.settings.set(
      scope,
      type === 'command' ? 'disabled_cmd' : 'disabled_cat',
      { [args.mod.id]: true }
    )
  }

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

  getScope (message, args) {
    if (this.client.isOwner(message.author)) {
      if (args.global) return 'global'
      if (isDM(message)) return 'global'
    }
    if (message.channel.type === 'text') return message.guild.id
    return null
  }
}

module.exports = EnableCommand
