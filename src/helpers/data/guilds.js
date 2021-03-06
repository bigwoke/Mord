const { isProtected } = require('../tools');
const cfg = require('../../../config');
const log = require('../../helpers/log');

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

  // If the existing guild name does not match, set the guild's name in its record.
  if (guild.name && settings.get(guild.id, 'name') !== guild.name) {
    if (settings.get(guild.id, 'name')) {
      log.debug(`[DB] Since last start, guild ${guild.id} changed name from ` +
        `"${settings.get(guild.id, 'name')}" to "${guild.name}."`);
    } else {
      log.debug(`[DB] Added new guild ${guild.id} since last bot start.`);
    }

    settings.set(guild.id, 'name', guild.name);
  }

  assignDefaults(client, guild);
}

/**
 * Refreshes guild settings that will not otherwise be refreshed or
 * set "naturally" through other uses of the bot (like guild names).
 * This happens every hour.
 * @param {AkairoClient} client - Akairo bot client instance.
 */
function setRefreshInterval (client) {
  setInterval(() => {
    for (const guild of client.guilds.cache.values()) {
      const storedName = client.settings.get(guild.id, 'name');
      if (storedName && storedName !== guild.name) {
        log.debug(`[DB] Guild ${guild.id} recently changed name ` +
          `from "${storedName}" to "${guild.name}."`);
        client.settings.set(guild.id, 'name', guild.name);
      }
    }
  }, 3600000);
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
  log.verbose('[DB] Guild data setup is complete!');
  setRefreshInterval(client);
}

module.exports = {
  setupGuild,
  setupCurrentGuilds
};
