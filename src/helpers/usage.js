const { Permissions } = require('discord.js');
const { isDM } = require('../helpers/tools');

/**
 * Here, a command's argument will either be skipped due to permissions or
 * owner authorization, or it will be formatted according to what type of
 * argument it appears to match best (optional, required, or flag currently).
 * @param {Object} arg - Single argument object from a command.
 * @param {boolean} isOwner - whether message author is the bot owner.
 * @param {Permissions} userPerms - Permissions of the user if in a guild.[1]
 * @returns {string}
 */
function appendArgumentUsage (arg, isOwner, userPerms) {
  // If the argument is marked owner only and author is not the owner, skip.
  if (arg.ownerOnly && !isOwner) return '';
  // If argument has permission requirement, and user doesn't have them, skip.
  else if (arg.userPermissions && !userPerms.has(arg.userPermissions)) return '';
  // If argument seems required, add required arg to usage string.
  else if (!arg.match && arg.prompt && !arg.prompt.optional) return ` <${arg.id}>`;
  // If argument seems optional, add optional arg to usage string.
  else if (!arg.match && !arg.type) return ` [<${arg.id}>]`;
  // If argument is a flag match, add flag to usage string.
  else if (arg.match === 'flag') return ` [${arg.flag}]`;
  // If argument is an option match, add argument to usage string.
  else if (arg.match === 'option') return ` [${arg.flag} <${arg.id}>]`;
  // Failing all else, just assume it's optional for now.
  return ` [<${arg.id}>]`;
}

/**
 * This function essentially determines whether to add the given command
 * to the usage list, based on a list of factors that determine whether
 * a user would be able to run the command. These are (in order): Owner
 * authorization, DM channel restriction, guild channel restriction, user
 * permission authorization, and per-user permission authorization bypass.
 * @param {Command} command - Command instance to check values against.
 * @param {Message} message - Message instance prompting command run.
 * @param {boolean} isOwner - Whether message author is the bot owner.
 * @param {Permissions} userPerms - Permissions of the user if in a guild.[1]
 * @returns {boolean}
 */
function checkPermissionsAndScope (command, message, isOwner, userPerms) {
  // If the command is owner only, and the author is not owner, return false.
  if (command.ownerOnly && !isOwner) return false;

  // If command has permission restrictions and the user doesn't have them...
  if (command.userPermissions && !userPerms.has(command.userPermissions)) {
    // If there is no ignorePermissions property, return false.
    if (!command.ignorePermissions) return false;
    // If ignorePermissions is a function, return false if its result is false.
    else if (typeof command.ignorePermissions === 'function' &&
      !command.ignorePermissions(message, command)) return false;
    // If ignorePermissions is an array that includes the author's ID, return false.
    else if (command.ignorePermissions instanceof Array &&
      command.ignorePermissions.includes(message.author.id)) return false;
    // If ignorePermissions is a string that DNE the author's id, return false.
    else if (command.ignorePermissions !== message.author.id) return false;
  }

  // By this point the command has passed all checks, so return true.
  return true;
}

/**
 * This is where a usage string will be built for a given command.
 * @param {Command} command - A command to build a usage string for.
 * @param {Message} message - The message calling the command for context.
 * @returns {string | undefined}
 */
function buildUsageString (command, message) {
  const isOwner = command.client.isOwner(message.author);

  /**
   * [1] This variable is intended to retrieve a member's permissions from a
   * guild based on roles, but with no guild present (DM), no roles are either.
   * If there is no guild to get member permissions from, set this variable
   * to a Permissions instance amounting to either zero (0) if the user is
   * not the bot owner, or eight (8) if they are. Eight is the 'Administrator'
   * permission value, allowing DM sourced commands to return all usage entries
   * to the bot owner as if they had full permissions (which they do).
   */
  const userPerms = message.guild
    ? message.member.permissions
    : new Permissions(isOwner * 8);

  // If the command doesn't pass these checks, skip it.
  if (!checkPermissionsAndScope(command, message, isOwner, userPerms)) return;

  let usage = `${command.id}`;

  if (command.args) {
    for (const arg of command.args) {
      // For each command, append it appropriately.
      usage += appendArgumentUsage(arg, isOwner, userPerms);
    }
  }

  return usage;
}

module.exports = buildUsageString;
