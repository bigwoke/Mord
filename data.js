const { MongoClient } = require('mongodb')
const MongoDBProvider = require('akairo-provider-mongo')
const cfg = require('./config.js')
const log = require('./log.js')

class Data {
  constructor () {
    MongoClient.connect(cfg.db.url, cfg.db.opts, (err, data) => {
      if (err) log.error(`Database connection error:\n${err.errmsg}\n${err.stack}`)
      this._data = data
      this.settings = new MongoDBProvider(MongoClient, cfg.db.name)
    })
  }

  db (database) {
    return this._data.db(database)
  }

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

  advanceSequence (guildID, sequenceName, callback) {
    const query = { _id: sequenceName }
    const update = { $inc: { sequence_value: 1 } }
    const opts = { returnOriginal: false, upsert: true }

    this._data.db(guildID).collection('counters')
      .findOneAndUpdate(query, update, opts, (err, res) => {
        callback(err, res.value.sequence_value)
      })
  }
}

module.exports = Data
