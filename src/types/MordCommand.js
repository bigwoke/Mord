const { Command } = require('discord-akairo');
const log = require('../helpers/log');
const buildUsageString = require('../helpers/usage');

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
     * Array of command arguments if applicable.
     * @type {Array<Object>}
     * @default null
     */
    this.args = opts.args || null;

    /**
     * Detailed description of command.
     * @type {string}
     * @default null
     */
    this.details = opts.details || opts.description || null;

    /**
     * Whether the command message should self-destruct.
     * Falsey for never, otherwise time in ms.
     * @type {number}
     * @default null
     */
    this.destruct = opts.destruct || null;

    /**
     * Array of command usage examples for help text.
     * @type {Array<Object>}
     * @default null
     */
    this.examples = opts.examples || null;

    /**
     * Whether this command should be protected from disabling.
     * @type {boolean}
     * @default false
     */
    this.protected = opts.protected || false;
  }

  /**
   * Sends a message using Akairo's `CommandUtil` send method.
   * @param {Message} message - Message object to provide context.
   * @param {StringResolvable|Object} content - Content to send as a message.
   * @param {MessageOptions|MessageAdditions} [options={}] - Options to apply to content.
   * @param {boolean} [isReply=false] - Whether this message is a reply to a user.
   * @returns {Promise<Message>} Sent message(s).
   */
  send (message, content, options = {}, isReply = false) {
    if (!this.handler.commandUtil) throw new Error('CommandUtil is disabled.');
    const resp = isReply
      ? message.util.reply(content, options).catch(e => log.error('%o', e))
      : message.util.send(content, options).catch(e => log.error('%o', e));

    message.util.addMessage(resp).catch(e => log.error('%o', e));
    return resp;
  }

  /**
   * Builds a usage string for the given command using the environment/scope
   * determined by the message and its context, including the channel, author,
   * their permissions, and parameters of the command. A user without access
   * to a command will get an undefined result from this method for the command.
   * @param {Command} command - Instance of a command.
   * @param {Message} message - Message prompting command run.
   * @returns {string | undefined}
   */
  static buildUsage (command, message) {
    return buildUsageString(command, message);
  }
}

module.exports = MordCommand;
