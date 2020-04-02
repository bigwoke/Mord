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

  /**
   * Determine whether a module is protected or is a category containing one.
   * @param {AkairoModule|Category} module - Module or Category to check.
   * @returns {boolean}
   */
  static isProtected (module) {
    const protectedInCategory = module.some && module.some(mod => mod.protected)
    return module.protected || protectedInCategory
  }

  /**
   * Returns true if given message channel type is DM.
   * @param {Message} message - Message to check.
   * @returns {boolean}
   */
  static isDM (message) {
    return message.channel.type === 'dm'
  }
}

module.exports = Tools
