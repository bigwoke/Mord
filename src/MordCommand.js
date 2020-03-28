const { Command } = require('discord-akairo')

/**
 * Extension of Command class made to apply new properties/methods
 * that allow easier messaging and enabling/disabling commands.
 * @param {string} id - Command identifier.
 * @param {CommandOptions} opts - Command initialization options.
 * @extends {Command}
 */
class MordCommand extends Command {
  constructor (id, opts) {
    super(id, opts)

    /**
     * Whether the command message should self-destruct.
     * Falsey for never, otherwise time in ms.
     * @type {number}
     * @default 0
     */
    this.destruct = opts.destruct || null

    /**
     * Whether this command should be protected from disabling.
     * @type {boolean}
     * @default false
     */
    this.protected = opts.protected || false
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
    if (!this.handler.commandUtil) throw new Error('CommandUtil is disabled.')
    const resp = isReply
      ? message.util.reply(content, options)
      : message.util.send(content, options)

    message.util.addMessage(resp)
    return resp
  }
}

module.exports = MordCommand
