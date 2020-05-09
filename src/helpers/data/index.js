const guilds = require('./guilds');
const mongo = require('./mongo');
const quotes = require('./quotes');

/**
 * Class containing helper functions for connecting the bot
 * client with the MongoDB database and setting provider.
 * @param {AkairoClient} client - AkairoClient instance.
 * @param {MongoClient} db - MongoClient database instance.
 */
class Data {
  constructor (client, db) {

    /**
     * AkairoClient bot instance.
     * @type {AkairoClient}
     */
    this.client = client;

    /**
     * MongoClient connection instance.
     * @type {MongoClient}
     */
    this.db = db;
  }

  /**
   * Adds a quote document to the database.
   * @param {Guild} guild - Discord Guild instance.
   * @param {Object} document - Quote document to insert into DB.
   */
  async addQuote (guild, document) {
    return quotes.addQuote(await this.db, guild, document);
  }

  /**
   * Loads default values for settings of all guilds in
   * view of the client, and global settings.
   */
  setupCurrentGuilds () {
    guilds.setupCurrentGuilds(this.client);
  }

  /**
   * Sets all unset default data for a given guild.
   * @param {string} guild - Guild object to preconfigure.
   */
  setupGuild (guild) {
    guilds.setupGuild(this.client, guild);
  }

  /**
   * Establishes connection with MongoDB database.
   * @returns {Promise<MongoClient>} MongoClient instance.
   * @static
   */
  static connect () {
    return mongo.connect();
  }

  /**
   * Connects setting provider with bot client.
   * @param {MongoClient} mongoClient - MongoClient instance with DB connection.
   * @returns {MongoDBProvider} Setting provider.
   * @static
   */
  static linkProvider (mongoClient) {
    return mongo.linkProvider(mongoClient);
  }
}

module.exports = Data;
