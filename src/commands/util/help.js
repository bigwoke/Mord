const Command = require('../../types/MordCommand');
const { isDM } = require('../../helpers/tools');

class HelpCommand extends Command {
  constructor () {
    super('help', {
      aliases: ['help', 'info', 'about', 'commands'],
      category: 'util',
      description: 'Displays help and information about the bot.',
      details: 'This command can be used alone, or can be supplied with an ' +
        'argument in the form of a command name. Used alone, this command will ' +
        'output general information about the bot, its commands, and categories. ' +
        'When supplied with an argument, the help command will output more ' +
        'specific information about a command, including its usage, category, ' +
        'details, and examples if there are any.',
      examples: [
        'help',
        'help prefix'
      ],
      destruct: 3000,
      cooldown: 3000,
      args: [
        {
          id: 'command'
        }
      ]
    });
  }

  exec (message, args) {
    let resp = '';

    if (args.command) {
      const command = this.handler.modules.get(args.command);
      resp = this.commandHelp(message, command);
    } else {
      resp = this.generalHelp(message);
    }

    if (!isDM(message)) this.send(message, 'Check your DMs for a help message.');
    message.author.send(resp);
  }

  commandHelp (message, command) {
    if (!command) return this.invalidCommand();
    const usage = Command.buildUsage(command, message);
    if (!usage) return this.invalidCommand();

    const categoryName = command.categoryID[0].toUpperCase() + command.categoryID.slice(1);

    let resp = `__**Command Info**__ - "**${command.id}**" command: ` +
      `${command.description}\n\n` +
      `**Usage:** \`${usage}\`\n` +
      `**Aliases:** \`${command.aliases.join('`, `')}\`\n` +
      `**Category:** ${categoryName} (category:${command.categoryID})\n` +
      `**Details:** ${command.details}\n`;

    if (command.examples) resp += `**Examples:**\n\`${command.examples.join('`\n`')}\``;

    return resp;
  }


  generalHelp (message) {
    const guildName = message.guild ? `"${message.guild.name}"` : 'DM';
    const guildID = message.guild ? message.guild.id : 'global';

    const pf = this.client.settings.get(
      guildID,
      'prefix',
      this.client.settings.get('global', 'prefix')
      );
    const at = this.client.user.tag;

    let resp = 'Mord is a modular, per-guild configurable Discord chat bot ' +
      'created by DJ#8074 on Discord, or bigwoke on Github. The bot is ' +
      'written in JavaScript using Node.JS with discord.js and MongoDB.\n\n';

    resp += `To run commands in ${guildName}, use \`${pf}<command>\` or ` +
      `\`@${at} <command>\`. For example, \`${pf}prefix\` or \`@${at} prefix\`.\n` +
      'To run commands in DM, a prefix is not necessary. Commands can always ' +
      `be run using \`@${at}\` as a prefix, regardless of guild or DM.\n\n` +
      'Use `help <command>` for details on any specific command.\n\n' +
      `__**Available commands in ${guildName}:**__\n`;

    for (const category of this.handler.categories.values()) {
      resp += this.appendCategory(message, category);
    }

    return resp;
  }

  appendCategory (message, category) {
    const categoryName = category.id[0].toUpperCase() + category.id.slice(1);
    const msgType = message.channel.type;

    let commands = [];
    for (const cmd of category.values()) {
      if (!cmd.channel) commands.push(cmd);
      else if (cmd.channel === msgType) commands.push(cmd);
      else if (cmd.channel === 'guild' && msgType === 'text') commands.push(cmd);
    }

    commands = commands.filter(cmd => {
      const usage = Command.buildUsage(cmd, message);
      return typeof usage !== 'undefined';
    });

    if (commands.length === 0) return '';

    let resp = `\n__${categoryName}__\n`;
    for (const cmd of commands) resp += `**${cmd.id}:** ${cmd.description}\n`;

    return resp;
  }

  invalidCommand () {
    return 'That command could not be found, or help cannot be provided.';
  }
}

module.exports = HelpCommand;
