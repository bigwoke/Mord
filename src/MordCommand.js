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
     * Guilds in which this command is disabled.
     * @type {Set}
     */
    this.disabledIn = new Set()

    /**
     * Whether this command should be protected from disabling.
     * @type {boolean}
     * @default false
     */
    this.protected = opts.protected || false

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

  get globalEnabled () {
    return this._globalEnabled
  }

  set globalEnabled (enabled) {
    if (typeof enabled !== 'boolean') {
      throw new TypeError('globalEnabled must be a boolean.')
    }
    this._globalEnabled = enabled
  }
}

module.exports = MordCommand
