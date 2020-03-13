const { MongoClient } = require('mongodb')
const cfg = require('./config.js')
const log = require('./log.js')

function mountData (mord) {
  MongoClient.connect(cfg.db.url, cfg.db.opts, (err, data) => {
    if (err) log.error(`Database connection error: ${err.stack}`)
    mord.data = data
  })
}

function verifyData (mord, guild) {
  const quotesIndexSpecs = [{ key: { number: 1 }, unique: true }]

  mord.data.db(guild.id).collection('quotes').createIndexes(quotesIndexSpecs, (err) => {
    if (err) log.error(`Error creating 'quotes' collection index: ${err.stack}`)
  })
}

function getNextSequenceValue (mord, guild, sequenceName, callback) {
  const query = { _id: sequenceName }
  const update = { $inc: { sequence_value: 1 } } // eslint-disable-line camelcase
  const options = { returnOriginal: false, upsert: true }

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
