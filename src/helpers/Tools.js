const { Message } = require('discord.js')

/**
 * Utility class providing convenient helper methods.
 */
class Tools {
  /**
   * Determines whether a given value is a promise.
   * @param {*} value - The value to test.
   * @returns {boolean}
   */
  static isPromise (value) {
    return value &&
    typeof value.then === 'function' &&
    typeof value.catch === 'function'
  }

  /**
   * Destructs messages sent by akairo modules if applicable.
   * @param {AkairoModule} sender - Module that sent messages to destruct.
   * @param {Message|Array<Message>} messages - Discord.js message(s).
   */
  static destructMessage (sender, messages) {
    if (!sender.destruct) return
    if (!(messages instanceof Array)) messages = [messages]

    for (const msg of messages) {
      if (msg.channel.type === 'dm') return
      if (!(msg instanceof Message)) return
      msg.delete({
        timeout: sender.destruct,
        reason: `${sender.constructor.name} cleanup`
      })
    }
  }

  static isDM (message) {
    return message.channel.type === 'dm'
  }
}

module.exports = Tools
