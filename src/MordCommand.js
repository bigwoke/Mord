const { Command } = require('discord-akairo')

/**
 * Extension of Command class made to apply new properties
 * that allow enabling and disabling of commands in guilds.
 * @param {string} id - Command identifier.
 * @param {CommandOptions} opts - Command initialization options.
 * @extends {Command}
 */
class MordCommand extends Command {
  constructor (id, opts) {
    super(id, opts)

    /**
     * Whether the command message should self-destruct.
     * `0` for never, otherwise time in ms.
     * @type {number}
     * @default 0
     */
    this.destruct = opts.destruct || null

    /**
     * Whether the command is enabled globally.
     * @type {boolean}
     * @private
     */
    this._globalEnabled = true
  }

  /**
   * Sends a message using Akairo's `CommandUtil` send method.
   * @param {Message} message - Message object to provide context.
   * @param {StringResolvable|Object} content - Content to send as a message.
   * @param {MessageOptions|MessageAdditions} options - Options to apply to content.
   * @param {boolean} isReply - Whether this message is a reply to a user.
   * @returns {Promise<(Message|Array<Message>)>} Sent message(s).
   */
  async send (message, content, options = {}, isReply = false) {
    const resp = isReply
      ? message.util.reply(content, options)
      : message.util.send(content, options)

    message.util.addMessage(await resp)
    return resp
  }
}

module.exports = MordCommand
