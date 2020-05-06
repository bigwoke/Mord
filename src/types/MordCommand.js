const { Command } = require('discord-akairo');

/**
 * Extension of Command class made to apply new properties/methods
 * that allow easier messaging and enabling/disabling commands.
 * @param {string} id - Command identifier.
 * @param {CommandOptions} opts - Command initialization options.
 * @extends {Command}
 */
class MordCommand extends Command {
  constructor (id, opts) {
    super(id, opts);

    /**
     * Whether the command message should self-destruct.
     * Falsey for never, otherwise time in ms.
     * @type {number}
     * @default 0
     */
    this.destruct = opts.destruct || null;

    /**
     * Whether this command should be protected from disabling.
     * @type {boolean}
     * @default false
     */
    this.protected = opts.protected || false;

    /**
     * Command usage template for help command autofill.
     * @type {string}
     */
    this.usage = opts.usage || MordCommand.usage(id, opts);
  }

  /**
   * Sends a message using Akairo's `CommandUtil` send method.
   * @param {Message} message - Message object to provide context.
   * @param {StringResolvable|Object} content - Content to send as a message.
   * @param {MessageOptions|MessageAdditions} [options={}] - Options to apply to content.
   * @param {boolean} [isReply=false]  - Whether this message is a reply to a user.
   * @returns {Promise<Message>} Sent message(s).
   */
  send (message, content, options = {}, isReply = false) {
    if (!this.handler.commandUtil) throw new Error('CommandUtil is disabled.');
    const resp = isReply
      ? message.util.reply(content, options)
      : message.util.send(content, options);

    message.util.addMessage(resp);
    return resp;
  }

  /**
   * Builds generic usage string for a given command ID
   * @param {string} id - Command ID.
   * @param {Object} opts - Argument options object.
   * @returns {string}
   */
  static usage (id, opts) {
    let usage = `${id}`;
    if (!opts.args) return usage;

    for (const arg of opts.args) {
      // If argument seems required, add required argument to usage string.
      if (!arg.match && arg.type && arg.prompt) usage += ` <${arg.id}>`;
      // If argument seems optional, add optional argument to usage string.
      if (!arg.match && !arg.type) usage += ` [<${arg.id}>]`;
      // If argument is a flag match, add flag to usage string.
      if (arg.match === 'flag') usage += ` [${arg.flag}]`;
    }

    return usage;
  }
}

module.exports = MordCommand;
