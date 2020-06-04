const MongoDBProvider = require('akairo-provider-mongo');
const { MongoClient } = require('mongodb');
const log = require('../log');
const cfg = require('../../../config');

/**
 * Establishes connection with MongoDB database.
 * @returns {Promise<MongoClient>} MongoClient instance.
 */
function connect () {
  return MongoClient.connect(cfg.db.url, cfg.db.opts).then(mongo => {
    log.info('[DB] Connected to MongoDB database succesfully.');
    return mongo;
  }).catch(err => {
    log.error('[DB] Database connection error: %o', err);
    throw err;
  });
}

/**
 * Connects setting provider with bot client.
 * @param {MongoClient} mongoClient - MongoClient instance with DB connection.
 * @returns {MongoDBProvider} Setting provider.
 */
async function linkProvider (mongoClient) {
  return new MongoDBProvider(await mongoClient, cfg.db.name);
}

module.exports = {
  connect,
  linkProvider
};
