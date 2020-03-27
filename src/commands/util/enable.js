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
          id: 'cmd',
          type: Argument.union('command', 'commandAlias'),
          prompt: {
            start: 'Which command do you want to enable?',
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
      warning: '\nThis command is disabled globally, so it will remain ' +
        'unusable until it is enabled in a global scope.',
      success: `The \`${args.cmd.id}\` command is now enabled for use ` +
        `${scope === 'global' ? 'globally' : `in ${message.guild.name}`}.`,
      failure: `\`${args.cmd.id}\` is already enabled for use ` +
        `${scope === 'global' ? 'globally' : `in ${message.guild.name}`}.`
    }

    const result = this.runLogic(message, args, scope)
    let resp = responses[result]

    if (scope !== 'global' && !args.cmd.globalEnabled) resp += responses.warning
    this.send(message, resp)
    if (result === 'failure') return

    return this.client.settings.set(scope, 'disabled', { [args.cmd.id]: false })
  }

  runLogic (message, args, scope) {
    if (scope === 'global' && !args.cmd.globalEnabled) {
      args.cmd.globalEnabled = true
      return 'success'
    }
    if (args.cmd.disabledIn.has(message.guild.id)) {
      args.cmd.disabledIn.delete(message.guild.id)
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
