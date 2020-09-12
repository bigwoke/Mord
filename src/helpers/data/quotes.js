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

  return mongo.db(cfg.db.name).collection('settings')
    .findOneAndUpdate(query, update, opts)
    .then(res => {
      log.debug(`[DB] Advanced quote sequence for "${guild.name}" (${guild.id})`);
      return res;
    })
    .catch(err => log.error('[DB] Error updating counter sequence: %o', err));
}

/**
 * An index is set up in a quote database collection for the given guild,
 * ensuring that no two quotes will share the same number. A text index is also
 * set to make string-based queries possible.
 * @param {MongoClient} mongo - Instance of MongoClient with DB connection.
 * @param {Guild} guild - Discord Guild instance.
 */
function setQuoteIndexes (mongo, guild) {
  const indexSpecs = [
    { key: { number: 1 }, unique: true },
    { key: { quote: 'text' } }
  ];

  mongo.db(quoteDB).collection(guild.id)
    .createIndexes(indexSpecs)
    .catch(err => log.error('[DB] Error creating index: %o', err));
}

/**
 * Adds a quote to the database for a specific guild.
 * @param {MongoClient} mongo - Instance of MongoClient with DB connection.
 * @param {Guild} guild - Discord Guild instance.
 * @param {Object} document - Quote document to insert into database.
 * @returns {CommandResult}
 */
function addQuote (mongo, guild, document) {
  if (!guild.id) throw new Error('[DB] Guild without ID should not exist.');
  setQuoteIndexes(mongo, guild);

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
 * @param {MongoClient} mongo - Instance of MongoClient with DB connection.
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
 * Builds the query to use when finding quotes using the given filter.
 * @param {number | User | Date | string | null} filter - Quote filter.
 * @returns {Object}
 */
function buildFilterQuery (filter) {
  /*
   * If a quote is requested by number, filter for that number.
   * Else if request is for a User, filter by that user's ID.
   * Else if request is for a Date, filter by that date.
   * Else if filter is string, search for text matching the filter.
   */
  if (typeof filter === 'number') {
    return { number: filter };
  } else if (filter instanceof User) {
    return { 'author.id': filter.id };
  } else if (filter instanceof Date) {
    return { date: { $gte: filter } };
  } else if (typeof filter === 'string') {
    return { $text: { $search: filter } };
  }
  return {};
}

/**
 * Gets quote count of an entire collection by default, or counts quotes by
 * a specific user if one is provided in the form of a discord User instance.
 * @param {MongoClient} mongo - Instance of MongoClient with DB connection.
 * @param {Guild} guild - Discord Guild instance.
 * @param {User} author - Quote author as a User instance.
 * @returns {Promise<number>}
 */
function getQuoteCount (mongo, guild, author = null) {
  const query = author instanceof User
    ? { 'author.id': author.id }
    : {};
  const options = { maxTimeMS: 250 };

  return mongo.db(quoteDB).collection(guild.id).countDocuments(query, options)
    .catch(err => log.error('[DB] Error getting quote `count`: %o', err));
}

/**
 * Checks if the amount of quotes timed out recently matches or exceeds
 * the amount of total quotes in the given parameter, and if so will
 * remove the earliest quote added to the timeouts collection.
 * @param {Guild} guild - Discord Guild instance.
 * @param {number} count - Amount of quotes in a (?queried) collection.
 * @param {string} filter - Filter used to retrieve quote.
 * @returns {boolean}
 */
function manageTimeoutCount (guild, count, filter) {
  const recents = timeouts.get(guild.id);

  if (filter instanceof User) {
    const recentVals = recents.array();
    const timeoutsMatchingUser = recentVals.filter(v => v.author.id === filter.id);

    // If timeouts matching the user >= # of quotes by said user, del the first.
    if (timeoutsMatchingUser.length >= count) {
      for (const to of recents) {
        const [key, val] = to;
        if (val.author.id === filter.id) return recents.delete(key);
      }
    }
  } else if (recents.size >= count) {
      // If amount of recent timeouts exceeds number of quotes, delete the first.
      return recents.delete(recents.firstKey(1)[0]);
  }
}

/**
 * Gets a quote using the provided filter (random otherwise).
 * @param {MongoClient} mongo - Instance of MongoClient with DB connection.
 * @param {Guild} guild - Discord Guild instance.
 * @param {number | User | Date | string} filter - Filter used to get quote.
 * @returns {AggregationCursor}
 */
function getQuote (mongo, guild, filter = null) {
  const useTimeouts = filter instanceof User || filter === null;
  const filterQuery = buildFilterQuery(filter);

  // Make new collection for this guild in timeouts if one doesn't exist.
  if (!timeouts.has(guild.id)) timeouts.set(guild.id, new Collection());
  const recents = timeouts.get(guild.id);

  return getQuoteCount(mongo, guild, filter).then(ct => {
    if (useTimeouts) manageTimeoutCount(guild, ct, filter);

    // Set the recentQuery filter query to use timed out numbers if necessary
    const recentQuery = useTimeouts
      ? { number: { $nin: timeouts.get(guild.id).keyArray() } }
      : { number: { $nin: [] } };

    /**
     * In order, set the pipeline stages to match both the filter query
     * (querying by user ID, by number, or not at all), and the recent quote
     * query, preventing duplicates if using timeouts (search by user/none).
     * Then take a random sample from that result, choosing one document.
     */
    const pipeline = [
      { $match: { $and: [filterQuery, recentQuery] } },
      { $sample: { size: 1 } }
    ];

    // If filtering by date, sort in ascending order and limit to one result.
    if (filter instanceof Date) {
      pipeline.pop();
      pipeline.push(
        { $sort: { date: 1 } },
        { $limit: 1 },
        { $sample: { size: 1 } }
      );
    }

    return mongo.db(quoteDB).collection(guild.id)
      .aggregate(pipeline).toArray()
      .then(res => {
        // If using timeouts, add quote number to timeout collection.
        if (useTimeouts && res[0]) {
          const quoteNumber = res[0].number;
          const timeoutFunc = () => recents.delete(quoteNumber);
          const timeoutObject = {
            author: res[0].author,
            timeout: setTimeout(timeoutFunc, ct * 5000)
          };

          recents.set(quoteNumber, timeoutObject);
        }

        return res[0];
      })
      .catch(err => log.error('[DB] Error getting quote: %o', err));
  });
}


module.exports = {
  addQuote,
  delQuote,
  getQuote,
  getQuoteCount
};
