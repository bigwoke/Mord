const cfg = require('../../../config');
const log = require('../../helpers/log');
const { User, Collection } = require('discord.js');

// Collection of recently pulled quote timeouts, to prevent duplicates.
const timeouts = new Collection();

// Name of the quote database used across all methods.
const quoteDB = `${cfg.db.name}-Quotes`;

/**
 * This function finds, advances by one, and returns a quote counter sequence.
 * @param {MongoClient} mongo - Instance of MongoClient with DB connection.
 * @param {Guild} guild - Discord Guild instance.
 * @returns {Promise<Cursor>}
 */
function advanceSequence (mongo, guild) {
  const query = { _id: guild.id };
  const update = {
    $inc: { quote_sequence: 1 },
    $set: { name: guild.name }
  };
  const opts = { returnOriginal: false, upsert: true };

  return mongo.db(cfg.db.name).collection('counters')
    .findOneAndUpdate(query, update, opts)
    .then(res => {
      log.debug(`[DB] Advanced quote sequence for "${guild.name}" (${guild.id})`);
      return res;
    })
    .catch(err => log.error('[DB] Error updating counter sequence: %o', err));
}

/**
 * An index is set up in a quote database collection for the given guild,
 * ensuring that no two quotes will share the same number.
 * @param {MongoClient} mongo - Instance of MongoClient with DB connection.
 * @param {Guild} guild - Discord Guild instance.
 */
function setQuoteIndex (mongo, guild) {
  const indexSpecs = [{ key: { number: 1 }, unique: true }];

  mongo.db(quoteDB).collection(guild.id)
    .createIndexes(indexSpecs)
    .catch(err => log.error('[DB] Error creating index: %o', err));
}

/**
 * Adds a quote to the database for a specific guild.
 * @param {MongoClient} mongo - Instance of MongoClient with DB connections.
 * @param {Guild} guild - Discord Guild instance.
 * @param {Object} document - Quote document to insert into database.
 * @returns {CommandResult}
 */
function addQuote (mongo, guild, document) {
  if (!guild.id) throw new Error('[DB] Guild without ID should not exist.');
  setQuoteIndex(mongo, guild);

  return advanceSequence(mongo, guild).then(res => {
    document.number = res.value.quote_sequence;

    return mongo.db(quoteDB).collection(guild.id)
      .insertOne(document)
      .then(r => {
        if (r.result.ok === 1) {
          log.verbose(`[DB] + Quote #${document.number} in "${guild.name}" added.`);
        }

        return { result: r.result, op: r.ops[0] };
      })
      .catch(err => {
        log.error('[DB] Error adding quote: %o', err);
        throw err;
      });
  });
}

/**
 * Deletes a specific quote from the database by number.
 * @param {MongoClient} mongo - Instance of MongoClient with DB connections.
 * @param {Guild} guild - Discord Guild instance.
 * @param {number} number - Quote number to delete.
 * @returns {CommandResult}
 */
function delQuote (mongo, guild, number) {
  const filter = { number: number };

  return mongo.db(quoteDB).collection(guild.id)
    .findOneAndDelete(filter)
    .then(res => {
      if (res.value) {
        log.verbose(`[DB] - Quote #${number} in "${guild.name}" removed.`);
      }

      return res;
    })
    .catch(err => {
      log.error('[DB] Error deleting quote: %o', err);
      throw err;
    });
}

/**
 * Gets a quote using the provided filter (random otherwise).
 * @param {MongoClient} mongo - Instance of MongoClient with DB connections.
 * @param {Guild} guild - Discord Guild instance.
 * @param {number | User} filter - Filter used to get quote.
 * @returns {AggregationCursor}
 */
function getQuote (mongo, guild, filter = null) {
  const randomize = isNaN(parseInt(filter, 10));
  let filterQuery = {};

  if (typeof filter === 'number') {
    filterQuery = { number: filter };
  } else if (filter instanceof User) {
    filterQuery = { 'author.id': filter.id };
  }

  // Make new collection for this guild in timeouts if one doesn't exist.
  if (!timeouts.has(guild.id)) timeouts.set(guild.id, new Collection());
  const recents = timeouts.get(guild.id);

  return this.getQuoteCount(mongo, guild).then(ct => {
    // If the recents set contains all quotes, delete the first several added.
    if (randomize && recents.size === ct) {
      for (const key of recents.firstKey(1)) {
        clearTimeout(recents.get(key));
        recents.delete(key);
      }
    }

    // Set the recentQuery filter query to use timed out numbers if necessary
    const recentQuery = randomize
      ? { number: { $nin: timeouts.get(guild.id).keyArray() } }
      : { number: { $nin: [] } };

    /**
     * In order, set the pipeline stages to match both the filter query
     * (querying by user ID, by number, or not at all), and the recent quote
     * query, preventing duplicates if this is a randomized search (not by num).
     * Then take a random sample from that result, choosing one document.
     */
    const pipeline = [
      { $match: { $and: [filterQuery, recentQuery] } },
      { $sample: { size: 1 } }
    ];

    return mongo.db(quoteDB).collection(guild.id)
      .aggregate(pipeline).toArray()
      .then(res => {
        // If randomized search, add quote number to timeout collection.
        if (randomize && res[0]) {
          const quoteNumber = res[0].number;
          const timeoutFunc = () => recents.delete(quoteNumber);

          recents.set(quoteNumber, setTimeout(timeoutFunc, ct * 5000));
        }

        return res[0];
      })
      .catch(err => log.error('[DB] Error getting quote: %o', err));
  });
}

function getQuoteCount (mongo, guild) {
  return mongo.db(quoteDB).collection(guild.id).estimatedDocumentCount()
    .catch(err => log.error('[DB] Error getting quote count: %o', err));
}

module.exports = {
  addQuote,
  delQuote,
  getQuote,
  getQuoteCount
};
