const MongoClient = require('mongodb').MongoClient
const cfg = require('./config.js')
const log = require('./log.js')

function mountData (mord) {
  MongoClient.connect(cfg.db.url, cfg.db.opts, (err, data) => {
    if (err) log.error(`Database connection error: ${err.stack}`)
    mord.data = data
  })
}

function verifyData (mord, guild) {
  let quotesIndexSpecs = [{ key: { number: 1 }, unique: true }]

  mord.data.db(guild.id).collection('quotes').createIndexes(quotesIndexSpecs, (err, res) => {
    if (err) log.error(`Error creating 'quotes' collection index: ${err.stack}`)
  })
}

function getNextSequenceValue (mord, guild, sequenceName, callback) {
  let query = { _id: sequenceName }
  let update = { $inc: { sequence_value: 1 } }
  let options = { returnOriginal: false, upsert: true }

  mord.data.db(guild.id).collection('counters')
    .findOneAndUpdate(query, update, options, (err, res) => {
      if (err) {
        callback(err)
      } else {
        callback(null, res.value.sequence_value)
      }
    })
}

module.exports = {
  mountData: mountData,
  verifyData: verifyData,
  nextValue: getNextSequenceValue
}
