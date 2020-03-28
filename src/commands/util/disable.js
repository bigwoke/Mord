const { Argument } = require('discord-akairo')
const Command = require('../../MordCommand.js')
const { isDM } = require('../../../Tools.js')

class DisableCommand extends Command {
  constructor () {
    super('disable', {
      aliases: ['disable'],
      category: 'util',
      description: 'Disables the specified command in the current guild,' +
        ' or globally with the --global flag.',
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
            start: 'Which command or category do you want to disable?',
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
      prot: `Sorry, the \`${args.mod.id}\` ${type} is protected and can't be disabled.`,
      disabledGlobally: `The \`${args.mod.id}\` ${type} is already disabled globally.`,
      warning: `\nThis ${type} is disabled globally, so in the instance that it is ` +
        'enabled in a global scope, it will remain disabled here.',
      success: `The \`${args.mod.id}\` ${type} is now disabled ` +
        `${scope === 'global' ? 'globally' : `in ${message.guild.name}`}.`,
      failure: `The \`${args.mod.id}\` ${type} is already disabled ` +
        `${scope === 'global' ? 'globally' : `in ${message.guild.name}`}.`
    }

    if (this.modIsProtected(args)) return this.send(message, responses.prot)

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

  modIsProtected (args) {
    const protectedInCategory = args.mod.some && args.mod.some(cmd => cmd.protected)
    return args.mod.protected || protectedInCategory
  }

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

  getScope (message, args) {
    if (this.client.isOwner(message.author)) {
      if (args.global) return 'global'
      if (isDM(message)) return 'global'
    }
    if (message.channel.type === 'text') return message.guild.id
    return null
  }
}

module.exports = DisableCommand
