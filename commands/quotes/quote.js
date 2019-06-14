const log = require('../../log.js')

module.exports.run = async (mord, msg, args) => {
  if (!args[0]) {
    getRandomQuote((err, quote) => {
      if (err) log.error(`Error getting quote from database: ${err.stack}`)
      let opts = formatQuote(quote)
      let date = quote.date.toLocaleString(undefined, opts)

      msg.channel.send(`#${quote.number} - ${quote.author}: "${quote.quote}"\t*${date}*`)
    })
  } else {
    getQuote((err, quote) => {
      if (err) log.error(`Error getting quote from database: ${err.stack}`)
      let opts = formatQuote(quote)
      let date = quote.date.toLocaleString(undefined, opts)

      msg.channel.send(`#${quote.number} - ${quote.author}: "${quote.quote}"\t*${date}*`)
    })
  }

  function getQuote (num, callback) {
    if (!Number.isInteger(parseInt(num))) {
      return msg.reply('"number" argument is not a number.').then(resp => {
        resp.delete(3000)
        msg.delete(3000)
      })
    }

    let query = { number: parseInt(num) }
    mord.data.db(msg.guild.id).collection('quotes').findOne(query, (err, res) => {
      if (err) {
        callback(err)
      } else {
        callback(null, res)
      }
    })
  }

  function getRandomQuote (callback) {
    mord.data.db(msg.guild.id).collection('quotes')
      .aggregate([{ $sample: { size: 1 } }]).toArray((err, res) => {
        if (err) {
          callback(err)
        } else {
          callback(null, res[0])
        }
      })
  }

  function formatQuote (q) {
    let vague = !q.date.getSeconds() && !q.date.getMilliseconds()
    let opts = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short'
    }

    if (vague) {
      opts.second = undefined

      if (q.date.getMinutes() === 0) {
        opts.minute = undefined

        if (q.date.getHours() === 0) {
          opts.hour = undefined
          opts.timeZoneName = undefined
          opts.month = 'short'

          if (q.date.getDate() === 1) {
            opts.day = undefined
            opts.month = 'long'
          }
        }
      }
    }
    return opts
  }
}

module.exports.info = {
  name: 'quote',
  usage: `${process.env.PREFIX}quote [number]`,
  desc: 'Prints a random quote, unless a number is specified.',
  module: 'quotes',
  dm: false
}
