const MongoDBProvider = require('akairo-provider-mongo')
const { MongoClient } = require('mongodb')
const log = require('../log.js')
const cfg = require('../../../config')

/**
 * Class containing helper functions for connecting the bot
 * client with the MongoDB database and setting provider.
 */
class Data {
  constructor () {
    /**
     * MongoClient connection instance.
     * @type {MongoClient}
     * @private
     */
    this._db = Data.connect()

    /**
     * AkairoClient bot instance.
     * @type {AkairoClient}
     */
    this.client = null
  }

  /**
   * Establishes connection with MongoDB database.
   * @returns {Promise<MongoClient>} MongoClient instance.
   * @static
   */
  static connect () {
    return MongoClient.connect(cfg.db.url, cfg.db.opts).then(mongo => {
      log.info('Connected to MongoDB database succesfully.')
      return mongo
    }).catch(err => {
      log.error(`Database connection error:\n${err.errmsg}\n${err.stack}`)
      throw new Error(`Database connection error:\n${err.errmsg}\n${err.stack}`)
    })
  }

  /**
   * Connects setting provider with bot client.
   * @param {MongoClient} mongoClient - MongoClient instance with DB connection.
   * @param {string} dbName - Name of settings database.
   * @returns {MongoDBProvider} Setting provider.
   * @static
   */
  static async linkProvider (mongoClient) {
    return new MongoDBProvider(await mongoClient, cfg.db.name)
  }

  /**
   * Loads default data for guilds in the client's view.
   */
  loadDefaults () {
    const guildsCache = this.client.guilds.cache

    this.preloadGuild({ id: 'global' })
    guildsCache.forEach(guild => this.preloadGuild(guild))
  }

  /**
   * Sets all unset default data for a given guild.
   * @param {Guild|Object} guild - Guild to preconfigure.
   */
  preloadGuild (guild) {
    const { settings, commandHandler } = this.client

    // If settings cache does not have a guild, set its name.
    if (!settings.items.has(guild.id)) settings.set(guild.id, 'name', guild.name || 'global')

    const disabledCommands = settings.get(guild.id, 'disabled_cmd', {})
    for (const mod of commandHandler.modules.values()) {
      if (!mod.protected && typeof disabledCommands[mod.id] !== 'boolean') {
        settings.set(guild.id, 'disabled_cmd', { [mod.id]: false })
      }
    }

    const disabledCategories = settings.get(guild.id, 'disabled_cat', {})
    for (const cat of commandHandler.categories.values()) {
      if (typeof disabledCategories[cat.id] !== 'boolean') {
        settings.set(guild.id, 'disabled_cat', { [cat.id]: false })
      }
    }
  }
}

module.exports = Data
