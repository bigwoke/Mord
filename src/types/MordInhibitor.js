const { Inhibitor } = require('discord-akairo');
const { destructMessage } = require('../helpers/tools');

/**
 * Extension of Inhibitor class made to apply new properties that help
 * send and track messages, then optionally remove these messages.
 * @param {string} id - Inhibitor ID.
 * @param {InhibitorOptions} [options={}] - Options for the inhibitor.
 * @extends {Inhibitor}
 */
class MordInhibitor extends Inhibitor {
  constructor (id, opts) {
    super(id, opts);

    /**
     * Whether messages sent by the inhibitor should self-destruct.
     * Falsey for never, otherwise time in ms.
     * @type {number}
     * @default null
     */
    this.destruct = opts.destruct || null;
  }

  /**
   * Sends a message using Akairo's `CommandUtil` send method.
   * @param {Message} message - Message object to provide context.
   * @param {StringResolvable|Object} content - Content to send as a message.
   * @param {MessageOptions|MessageAdditions} [options={}] - Options to apply to content.
   * @param {boolean} [isReply=false] - Whether this message is a reply to a user.
   * @returns {Promise<Message>}
   */
  async send (message, content, options = {}, isReply = false) {
    if (!this.client.commandHandler.commandUtil) {
      throw new Error('CommandUtil is disabled.');
    }
    const resp = isReply
      ? message.util.reply(content, options)
      : message.util.send(content, options);

    destructMessage(this, [await resp, message]);
    return resp;
  }
}

module.exports = MordInhibitor;
