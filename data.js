const MongoDBProvider = require('akairo-provider-mongo')
const { MongoClient } = require('mongodb')
const log = require('./log.js')
const cfg = require('./config')

/**
 * Class containing helper functions for connecting the bot
 * client with the MongoDB database and setting provider.
 */
class Data {

  /**
   * Establishes connection with MongoDB database.
   * @returns {Promise<MongoClient>} MongoClient instance.
   */
  connect () {
    return MongoClient.connect(cfg.db.url, cfg.db.opts).then(mongo => {
      log.info('Connected to MongoDB database succesfully.')
      return mongo
    }).catch(err => {
      log.error(`Database connection error:\n${err.errmsg}\n${err.stack}`)
    })
  }

  /**
   * Creates a new setting provider instance with a connected MongoClient.
   * @param {MongoClient} mongoClient - MongoClient instance to link.
   * @returns {Promise<MongoDBProvider>} MongoDBProvider instance.
   */
  static async linkProvider (mongoClient) {
    return new MongoDBProvider(await mongoClient, cfg.db.name)
  }
}

module.exports = Data
