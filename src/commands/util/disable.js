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
          id: 'cmd',
          type: Argument.union('command', 'commandAlias'),
          prompt: {
            start: 'Which command do you want to disable?',
            retry: 'That command does not exist.'
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
    const scope = this.getScope(message, args)
    if (!scope) return

    const responses = {
      prot: `Sorry, the \`${args.cmd.id}\` command is protected and can't be disabled.`,
      disabledGlobally: `\`${args.cmd.id}\` is already disabled globally.`,
      warning: '\nThis command is disabled globally, so in the instance that it is ' +
        'enabled in a global scope, it will remain disabled here.',
      success: `The \`${args.cmd.id}\` command is now disabled ` +
        `${scope === 'global' ? 'globally' : `in ${message.guild.name}`}.`,
      failure: `\`${args.cmd.id}\` is already disabled ` +
        `${scope === 'global' ? 'globally' : `in ${message.guild.name}`}.`
    }

    if (args.cmd.protected) return this.send(message, responses.prot)

    const result = this.runLogic(message, args, scope)
    let resp = responses[result]

    if (scope !== 'global' && !args.cmd.globalEnabled) resp += responses.warning
    this.send(message, resp)
    if (result === 'failure') return

    return this.client.settings.set(scope, 'disabled', { [args.cmd.id]: true })
  }

  runLogic (message, args, scope) {
    if (scope === 'global' && args.cmd.globalEnabled) {
      args.cmd.globalEnabled = false
      return 'success'
    }
    if (!args.cmd.disabledIn.has(message.guild.id)) {
      args.cmd.disabledIn.add(message.guild.id)
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
