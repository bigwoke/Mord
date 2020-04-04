const Command = require('../../types/MordCommand.js')
const cfg = require('../../../config.js')

class PrefixCommand extends Command {
  constructor () {
    super('prefix', {
      aliases: ['prefix'],
      category: 'util',
      description: 'Displays or changes the current prefix.',
      destruct: 5000,
      cooldown: 5000,
      ratelimit: 2,
      userPermissions: 'ADMINISTRATOR',
      args: [
        {
          id: 'prefix'
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
    const { settings } = this.client
    const { guild } = message
    const current = settings.get(args.global ? 'global' : guild.id, 'prefix', null)
    if (args.global) {
      switch (args.prefix) {
        case null:
          this.send(message, `Global prefix is currently: \`${current}\``)
          break
        case 'default':
          settings.set('global', 'prefix', cfg.client.prefix)
          this.send(message, `Global prefix reset to default: \`${cfg.client.prefix}\``)
          break
        default:
          settings.set('global', 'prefix', args.prefix)
          this.send(message, `Global prefix has been set to: \`${args.prefix}\``)
      }
    } else {
      switch (args.prefix) {
        case null:
          this.send(message, `Prefix in \`${guild.name}\` is currently: \`${current}\``)
          break
        case 'default':
          settings.delete(guild.id, 'prefix')
          this.send(message, `Prefix in \`${guild.name}\` reset to: \`${args.prefix}\``)
          break
        default:
          settings.set(guild.id, 'prefix', args.prefix)
          this.send(message, `Prefix in \`${guild.name}\` is now: \`${args.prefix}\``)
          break
      }
    }
  }
}

module.exports = PrefixCommand
