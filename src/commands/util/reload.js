const { Argument } = require('discord-akairo');
const Command = require('../../types/MordCommand');

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
          id: 'command',
          type: Argument.union('command', 'commandAlias'),
          prompt: {
            start: 'Which command do you want to reload?',
            retry: 'Couldn\'t find that command, try again.',
            retries: 2
          }
        }
      ]
    });
  }

  exec (message, args) {
    if (!args.command) {
      return this.send(message, 'Couldn\'t find that command.');
    }
    if (!args.command.filepath) {
      return this.send(message, 'That command file no longer exists?!');
    }

    args.command.reload();
    return this.send(message, `Command \`${args.command.constructor.name}\` reloaded.`);
  }
}

module.exports = ReloadCommand;
