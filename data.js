const { MongoClient } = require('mongodb')
const MongoDBProvider = require('akairo-provider-mongo')
const cfg = require('./config.js')
const log = require('./log.js')

/**
 * A database helper class that maintains MongoDB
 * properties and centralizes database connection.
 */
class Data {
  /**
   * @param {MordClient} client - AkairoClient with a method `setProvider`.
   */
  constructor (client) {
    MongoClient.connect(cfg.db.url, cfg.db.opts, (err, data) => {
      if (err) log.error(`Database connection error:\n${err.errmsg}\n${err.stack}`)
      else log.info('Connected to MongoDB database succesfully.')
      this._data = data

      this.linkProvider(client)
    })
  }

  /**
   * Convenience function to return specified database.
   * @param {string} database - Name of database to access.
   * @returns {MongoClient#Db}
   */
  db (database) {
    return this._data.db(database)
  }

  /**
   * Builds data indexes for unique collection values.
   * @param {number} guildID - ID of guild to create indexes for.
   */
  buildIndexes (guildID) {
    const indexSpecs = {
      quotes: [{ key: { number: 1 }, unique: true }]
    }

    for (const key in indexSpecs) {
      if (Array.isArray(indexSpecs[key])) {
        this._data.db(guildID).collection(`${key}`)
          .createIndexes(indexSpecs[key], (err) => {
            if (err) log.error(`Error creating '${key}' index:\n${err.stack}`)
          })
      } else {
        throw new TypeError('Database index specs should be an array.')
      }
    }
  }

  /**
   * Advances a counter sequence for a guild.
   * @param {number} guildID - ID of guild to advance sequence in.
   * @param {string} sequenceName - Name of sequence to advance.
   * @param {function} callback - Callback with results of update operation.
   */
  advanceSequence (guildID, sequenceName, callback) {
    const query = { _id: sequenceName }
    const update = { $inc: { sequence_value: 1 } }
    const opts = { returnOriginal: false, upsert: true }

    this._data.db(guildID).collection('counters')
      .findOneAndUpdate(query, update, opts, (err, res) => {
        callback(err, res.value.sequence_value)
      })
  }

  /**
   * Links the data provider with the bot client.
   * @param {MordClient} client - AkiroClient with setProvider helper method.
   */
  linkProvider (client) {
    client.setProvider(new MongoDBProvider(this._data, cfg.db.name))
      .then(() => log.debug('Data provider initialized.'))
      .catch(err => log.error(`Error with provider:\n${err.stack}`))
  }
}

module.exports = Data
