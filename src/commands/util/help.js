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
          id: 'command',
          type: 'commandAlias',
          description: 'Command to get info for.',
          prompt: {
            optional: true,
            breakout: false,
            retry: 'No commands exist with that alias, what command do you need help with?',
            ended: 'Ending prompts. If you need help, use this command without arguments.'
          }
        }
      ]
    });
  }

  exec (message, args) {
    // If a command is given and it exists, display specific info, else general.
    const resp = args.command
      ? this.commandHelp(message, args.command)
      : this.generalHelp(message);

    // Only send a short message in a text channel to prevent spam.
    if (!isDM(message)) this.send(message, 'Check your DMs for a help message.');
    message.author.send(resp);
  }

  /**
   * Builds help for a specified command.
   * @param {Message} message - Message prompting command execution.
   * @param {Command} command - Command to generate help for.
   * @returns {string}
   */
  commandHelp (message, command) {
    // No usage will be returned if the user doesn't have adequate privileges.
    const usage = Command.buildUsage(command, message);
    if (!usage) this.noAccess(message);

    // Capitalize the first letter of the category ID
    const categoryName =
      command.categoryID[0].toUpperCase() +
      command.categoryID.slice(1);

    let resp = `__**Command Info**__ - "**${command.id}**" command: ` +
      `${command.description}\n\n` +
      `**Usage:** \`${usage}\`\n` +
      `**Aliases:** \`${command.aliases.join('`, `')}\`\n` +
      `**Category:** ${categoryName} (category:${command.categoryID})\n` +
      `${this.appendConditionals(command)}` +
      `**Details:** ${command.details}\n`;

    if (command.args) resp += this.appendArguments(message, command);
    if (command.examples) resp += this.appendExamples(message, command);

    return resp;
  }

  /**
   * Appends arguments for a given command.
   * @param {Message} message - Message prompting command execution.
   * @param {Command} command - Command to generate help for.
   * @returns {string}
   */
  appendArguments (message, command) {
    const isOwner = this.client.isOwner(message.author);

    // This method is described well in src/helpers/usage under [1] tag.
    const userPerms = message.guild
      ? message.member.permissions
      : new Permissions(isOwner * 8);

    let resp = '**Arguments:**\n';

    // If the argument object fails a permission test, don't add it.
    for (const arg of command.args) {
      let pass = true;
      if (arg.ownerOnly && !isOwner) pass = false;
      if (arg.userPermissions && !userPerms.has(arg.userPermissions)) pass = false;
      if (arg.flag && arg.flag === '--global' && !arg.description) arg.description =
        'Whether this command takes effect globally.';
      if (pass) resp += `\`${arg.id}\` ${arg.description ? `- ${arg.description}` : ''}\n`;
    }

    // If there are no arguments (one would include a grave), return empty.
    return resp.includes('`') ? resp : '';
  }

  /**
   * Appends conditionally displayed command attributes.
   * @param {Command} command - Command to generate help for.
   * @returns {string}
   */
  /* eslint-disable-next-line max-statements */
  appendConditionals (command) {
    let resp =
      `${command.protected ? '**Protected:** Yes\n' : ''}` +
      `${command.ownerOnly ? '**Owner Only:** Yes\n' : ''}`;

    if (command.channel) resp += `**Channel Restriction:** ${command.channel}`;

    if (command.userPermissions) {
      let rawPerms = Array.isArray(command.userPermissions)
        ? command.userPermissions.join(', ')
        : command.userPermissions;

      // Set all characters to lowercase, split by space & underscore.
      rawPerms = rawPerms.toLowerCase().split(/[\s_]/gu);

      let perms = [];
      for (const word of rawPerms) {
        perms.push(`${word[0].toUpperCase()}${word.slice(1)}`);
      }

      perms = perms.join(' ');

      resp += `**Permissions:** ${perms}\n`;
    }

    return resp;
  }

  /**
   * Appends examples for the given command.
   * @param {Message} message - Message prompting command execution.
   * @param {Command} command - Command to generate help for.
   * @returns {string}
   */
  appendExamples (message, command) {
    const isOwner = this.client.isOwner(message.author);

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

    return resp.includes('`') ? resp : '';
  }

  /**
   * Prints general help if no command is specified.
   * @param {Message} message - Message prompting command execution.
   * @returns {string}
   */
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
      'In command usage, angle brackets `<>` indicate variables. Those in ' +
      'brackets `[]` are optional. Non-variable text must be used as-is.\n\n' +
      `__**Commands *available to you* in ${guildName}:**__\n`;

    for (const category of this.handler.categories.values()) {
      resp += this.appendCategory(message, category);
    }

    return resp;
  }

  /**
   * Appends commands in a given category.
   * @param {Message} message - Message prompting command execution.
   * @param {Category} category - Category of modules.
   * @returns {string}
   */
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

    // Filter commands without usage and restricted to different channel type.
    commands = commands.filter(cmd => {
      const usage = typeof Command.buildUsage(cmd, message) !== 'undefined';
      const dmMatch = cmd.channel === 'dm' && isDM(message);
      const guildMatch = cmd.channel === 'guild' && message.channel.type === 'text';
      const channelMatch = !cmd.channel || dmMatch || guildMatch;
      return usage && channelMatch;
    });

    // If the command array is empty, don't add it.
    if (commands.length === 0) return '';

    let resp = `\n__${categoryName}__\n`;
    for (const cmd of commands) resp += `**${cmd.id}:** ${cmd.description}\n`;

    return resp;
  }

  /**
   * Displays messaging indicating lack of appropriate permissions.
   * @param {Message} message - Message prompting commmand execution.
   */
  noAccess (message) {
    let resp = 'You do not have access to this command.';
    if (isDM(message)) {
      resp += 'If you think you have adequate permissions, try using this ' +
        'command in a guild where you would have those permissions.';
    }
    this.send(message, resp);
  }
}

module.exports = HelpCommand;
