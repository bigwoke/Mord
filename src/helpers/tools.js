const { Message } = require('discord.js');

/**
 * Returns true if given message channel type is DM.
 * @param {Message} message - Message to check.
 * @returns {boolean}
 */
function isDM (message) {
  return message.channel.type === 'dm';
}

/**
 * Determines whether a given value is a promise.
 * @param {*} value - The value to test.
 * @returns {boolean}
 */
function isPromise (value) {
  return value &&
  typeof value.then === 'function' &&
  typeof value.catch === 'function';
}

/**
 * Determine whether a module is protected or is a category containing one.
 * @param {AkairoModule|Category} mod - Module or Category to check.
 * @returns {boolean}
 */
function isProtected (mod) {
  const protectedInCategory = mod.some && mod.some(m => m.protected);
  return mod.protected || protectedInCategory;
}

/**
 * Destructs messages sent by akairo modules if applicable.
 * @param {AkairoModule} sender - Module that sent messages to destruct.
 * @param {Message|Array<Message>} messages - Discord.js message(s).
 */
function destructMessage (sender, messages) {
  if (!sender.destruct) return;
  if (!(messages instanceof Array)) messages = [messages];

  for (const msg of messages) {
    if (msg.channel.type === 'dm') return;
    if (!(msg instanceof Message)) return;
    msg.delete({
      timeout: sender.destruct,
      reason: `${sender.constructor.name} cleanup`
    });
  }
}

module.exports = {
  isDM,
  isPromise,
  isProtected,
  destructMessage
};
