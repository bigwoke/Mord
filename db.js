const MongoClient = require('mongodb').MongoClient
const cfg = require('./config.js')
const log = require('./log.js')

function mountData (mord) {
  MongoClient.connect(cfg.db.url, cfg.db.opts, (err, data) => {
    if (err) log.error(`Database connection error: ${err.stack}`)
    mord.data = data.db(cfg.db.name)
    setupIndexes(mord)
  })
}

function setupIndexes (mord) {
  let quotesIndexSpecs = [{ key: { number: 1 }, unique: true }]
  mord.data.collection('quotes').createIndexes(quotesIndexSpecs, (err, res) => {
    if (err) log.error(`Error creating 'quotes' collection index: ${err.stack}`)
  })
}

function checkCounters (mord, guildid) {
  mord.data.collection('counters').findOne({ _id: `quotenumber_g${guildid}` }, (err, res) => {
    if (err) log.error(`Error querying 'counters' collection: ${err.stack}`)
    if (!res) {
      mord.data.collection('counters')
        .insertOne({ _id: `quotenumber_g${guildid}`, sequence_value: 0 })
    }
  })
}

function getNextSequenceValue (mord, sequenceName, callback) {
  let query = { _id: sequenceName }
  let update = { $inc: { sequence_value: 1 } }
  let options = { returnOriginal: false }

  mord.data.collection('counters').findOneAndUpdate(query, update, options, (err, res) => {
    if (err) {
      callback(err)
    } else {
      if (res.value === null) {
        callback(null, 1)
      } else {
        callback(null, res.value.sequence_value + 1)
      }
    }
  })
}

module.exports = {
  mountData: mountData,
  setupIndexes: setupIndexes,
  checkCounters: checkCounters,
  nextValue: getNextSequenceValue
}
