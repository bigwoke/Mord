const { Argument } = require('discord-akairo')
const Command = require('../../types/MordCommand.js')

class ReloadCommand extends Command {
  constructor () {
    super('reload', {
      aliases: ['reload'],
      category: 'util',
      description: 'Reloads the specified command.',
      ownerOnly: true,
      editable: true,
      destruct: 5000,
      args: [
        {
          id: 'cmd',
          type: Argument.union('command', 'commandAlias'),
          prompt: {
            start: 'Which command do you want to reload?',
            retry: 'Couldn\'t find that command.',
            retries: 2
          }
        }
      ]
    })
  }

  exec (message, args) {
    if (!args.cmd) {
      return this.send(message, 'Couldn\'t find that command.')
    }
    if (!args.cmd.filepath) {
      return this.send(message, 'That command file no longer exists?!')
    }

    args.cmd.reload()
    return this.send(message, `Command \`${args.cmd.constructor.name}\` reloaded.`)
  }
}

module.exports = ReloadCommand
