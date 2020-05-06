const { isProtected } = require('../Tools.js');
const cfg = require('../../../config.js');

/**
 * Assigns default values for commands and categories to a given guild.
 * @param {AkairoClient} client - Client holding settings object.
 * @param {string} guild - Guild object to assign defaults to.
 */
function assignDefaults (client, guild) {
  const { settings, commandHandler } = client;

  const disabledCommands = settings.get(guild.id, 'disabled_cmd', {});
  for (const cmd of commandHandler.modules.values()) {
    if (!isProtected(cmd) && typeof disabledCommands[cmd.id] !== 'boolean') {
      settings.set(guild.id, 'disabled_cmd', { [cmd.id]: false });
    }
  }

  const disabledCategories = settings.get(guild.id, 'disabled_cat', {});
  for (const cat of commandHandler.categories.values()) {
    if (!isProtected(cat) && typeof disabledCategories[cat.id] !== 'boolean') {
      settings.set(guild.id, 'disabled_cat', { [cat.id]: false });
    }
  }
}

/**
 * Sets all unset default data for a given guild.
 * @param {AkairoClient} client - Akairo bot client instance.
 * @param {string} guild - Guild object to preconfigure.
 */
function setupGuild (client, guild) {
  const { settings } = client;

  // If global is not set yet (first start), setup default prefix.
  if (guild.id === 'global' && !settings.items.has(guild.id)) {
    settings.set(guild.id, 'prefix', cfg.client.prefix);
  }

  // If the settings cache does not have a guild, set the guild's name in its record.
  if (!settings.items.has(guild.id)) settings.set(guild.id, 'name', guild.name || 'global');

  assignDefaults(client, guild);
}

/**
 * Loads default values for settings of all guilds in view
 * of the client, and global settings.
 * @param {AkairoClient} client - Akairo bot client instance.
 */
function setupCurrentGuilds (client) {
  setupGuild(client, { id: 'global' });
  const guildsCache = client.guilds.cache;
  for (const guild of guildsCache.values()) setupGuild(client, guild);
}

module.exports = {
  setupGuild,
  setupCurrentGuilds
};
