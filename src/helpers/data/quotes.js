const cfg = require('../../../config');
const log = require('../../helpers/log');

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
    .catch(err => log.error('[DB] %o', err));
}

/**
 * An index is set up in a quote database collection for the given guild,
 * ensuring that no two quotes will share the same number.
 * @param {MongoClient} mongo - Instance of MongoClient with DB connection.
 * @param {Guild} guild - Discord Guild instance.
 */
function setQuoteIndex (mongo, guild) {
  const indexSpecs = [{ key: { number: 1 }, unique: true }];

  mongo.db(`${cfg.db.name}-Quotes`).collection(guild.id)
    .createIndexes(indexSpecs)
    .catch(err => log.error('[DB] %o', err));
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

    return mongo.db(`${cfg.db.name}-Quotes`).collection(guild.id)
      .insertOne(document)
      .then(r => {
        if (r.result.ok === 1) {
          log.verbose(`[DB] Quote #${document.number} in "${guild.name}" added.`);
        }

        return { result: r.result, op: r.ops[0] };
      })
      .catch(err => log.error('[DB] %o', err));
  });
}

module.exports = {
  addQuote
};
