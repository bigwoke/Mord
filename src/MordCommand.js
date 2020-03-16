const { Command } = require('discord-akairo')
const { Message } = require('discord.js')

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
    this.destruct = opts.destruct || 0

    /**
     * Whether the command is enabled globally.
     * @type {boolean}
     * @private
     */
    this._globalEnabled = true
  }

  /**
   * Sends a message using the given `message` context.
   * @param {Message} message - Message prompting the send, for context.
   * @param {string | Object} content - String to send to the channel or Embed object.
   * @param {boolean} isReply - Whether message should prepend a user mention.
   * @returns {Promise<Message>} Promise containing message sent.
   */
  send (message, content, isReply = false) {
    let sendType = ''
    if (typeof content === 'string') sendType = 'content'
    else if (content instanceof Array) sendType = 'files'
    else if (content instanceof Object) sendType = 'embed'
    else throw new RangeError('Message content cannot be empty.')

    return message.channel.send({
      [sendType]: content,
      reply: isReply ? message.author : null
    })
  }

  /**
   * Removes passed messages based on the `destruct` property of their instance.
   * @param {...any} args - Message objects to remove.
   */
  destructMessages (...args) {
    if (!this.destruct) return
    args.forEach(m => {
      if (m instanceof Message && m.channel.type !== 'dm') {
        m.delete({
          timeout: this.destruct,
          reason: 'command cleanup'
        })
      }
    })
  }
}

module.exports = MordCommand
