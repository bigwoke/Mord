const Command = require('../../types/MordCommand');
const { Permissions } = require('discord.js');
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
      destruct: 3000,
      protected: true,
      cooldown: 3000,
      examples: [
        {
          text: 'help'
        },
        {
          text: 'help prefix'
        }
      ],
      args: [
        {
          id: 'command'
        }
      ]
    });
  }

  exec (message, args) {
    let resp = '';

    // If a command is given and it exists, display specific info, else invalid.
    if (args.command) {
      const command = this.handler.modules.get(args.command);
      resp = command
        ? this.commandHelp(message, command)
        : this.invalidCommand();
    } else {
      resp = this.generalHelp(message);
    }

    // Only send a short message in a text channel to prevent spam.
    if (!isDM(message)) this.send(message, 'Check your DMs for a help message.');
    message.author.send(resp);
  }

  commandHelp (message, command) {
    // No usage will be returned if the user doesn't have adequte privileges.
    const usage = Command.buildUsage(command, message);
    if (!usage) return this.invalidCommand();

    // Capitalize the first letter of the category ID
    const categoryName =
      command.categoryID[0].toUpperCase() +
      command.categoryID.slice(1);

    let resp = `__**Command Info**__ - "**${command.id}**" command: ` +
      `${command.description}\n\n` +
      `**Usage:** \`${usage}\`\n` +
      `**Aliases:** \`${command.aliases.join('`, `')}\`\n` +
      `${command.protected ? '**Protected:** Yes\n' : ''}` +
      `**Category:** ${categoryName} (category:${command.categoryID})\n` +
      `**Details:** ${command.details}\n`;

    if (command.examples) resp += this.appendExamples(message, command);

    return resp;
  }

  appendExamples (message, command) {
    const isOwner = this.client.isOwner(message.author);

    // This method is described well in src/helpers/usage under [1] tag.
    const userPerms = message.guild
      ? message.member.permissions
      : new Permissions(isOwner * 8);

    let resp = '**Examples:**\n';

    // If the example object fails a permission test, don't add it.
    for (const ex of command.examples) {
      let pass = true;
      if (ex.ownerOnly && !isOwner) pass = false;
      if (ex.userPermissions && !userPerms.has(ex.userPermissions)) pass = false;
      if (pass) resp += `\`${ex.text}\` ${ex.notes ? `(${ex.notes})` : ''}\n`;
    }

    // If there are no examples (one would include a grave), return empty.
    if (!resp.includes('`')) return '';

    return resp;
  }


  generalHelp (message) {
    const guildName = message.guild ? `"${message.guild.name}"` : 'DM';
    const guildID = message.guild ? message.guild.id : 'global';

    // Get prefix for guild, or use global if it doesn't exist.
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
      'In DMs, a prefix is not necessary. Commands can always be run using ' +
      `\`@${at}\` as a prefix, regardless of guild or DM.\n\n` +
      'Use `help <command>` for details on any specific command.\n' +
      'In command usage, variables in brackets `[]` are optional, and those ' +
      'in angle brackets `<>` are required. All other text must be as-is.\n\n' +
      `__**Commands *available to you* in ${guildName}:**__\n`;

    for (const category of this.handler.categories.values()) {
      resp += this.appendCategory(message, category);
    }

    return resp;
  }

  appendCategory (message, category) {
    const { type } = message.channel;
    const categoryName =
      category.id[0].toUpperCase() +
      category.id.slice(1);

    let commands = [];
    for (const cmd of category.values()) {
      if (!cmd.channel || cmd.channel === type) commands.push(cmd);
      else if (cmd.channel === 'guild' && type === 'text') commands.push(cmd);
    }

    // Filter commands without usage (meaning user is missing permissions).
    commands = commands.filter(cmd => {
      const usage = Command.buildUsage(cmd, message);
      return typeof usage !== 'undefined';
    });

    // If the command array is empty, don't add it.
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
