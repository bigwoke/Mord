const log = require('../../log.js')
const db = require('../../db.js')

module.exports.run = async (mord, msg, args) => {
  if (!args[0]) {
    return msg.reply('Missing "name" argument.').then(resp => {
      resp.delete(2500)
      msg.delete(2500)
    })
  }
  if (!args[1]) {
    return msg.reply('Missing quote.').then(resp => {
      resp.delete(2500)
      msg.delete(2500)
    })
  }

  let name = args[0]
  let datePos = args.indexOf('-date')
  let hasDate = datePos !== -1

  let quote = hasDate ? args.slice(1, datePos).join(' ') : args.slice(1).join(' ')
  if (quote.length >= 1920) {
    return msg.reply('Quote is too long, maximum is 1920 characters.').then(resp => {
      resp.delete(3000)
      msg.delete(3000)
    })
  }

  let date
  if (hasDate) {
    let dateRaw = args.slice(datePos + 1).join(' ')
    date = new Date(Date.parse(dateRaw))

    if (Number.isNaN(Date.parse(dateRaw))) {
      return msg.reply('Date given is invalid.').then(resp => {
        resp.delete(2500)
        msg.delete(2500)
      })
    }
  } else {
    date = new Date(Date.now())
  }

  db.verifyData(mord, msg.guild)
  db.nextValue(mord, msg.guild, 'quotenumber', (err, res) => {
    if (err) log.error(`Error updating counters collection: ${err.stack}`)

    let num = res
    let doc = {
      quote: quote,
      number: num,
      author: name,
      date: date
    }

    mord.data.db(msg.guild.id).collection('quotes').insertOne(doc, (error, result) => {
      if (error) log.error(`Error inserting quote: ${error.stack}`)

      if (result.result.ok === 1) {
        log.info(`Quote #${num} in guild '${msg.guild.name}' added by ${msg.author.tag}`)
        msg.channel.send(`Quote #${num} by "${name}" successfully added to the database.`)
      }
    })
  })

  /* db.setupIndexes(mord, msg.guild.id)
  db.checkCounters(mord, msg.guild.id)
  db.nextValue(mord, `quotenumber_g${msg.guild.id}`, (err, res) => {
    if (err) log.error(`Error updating counters collection: ${err.stack}`)

    let num = res
    let doc = {
      quote: quote,
      number: num,
      author: name,
      date: date
    }

    mord.data.collection('quotes').insertOne(doc, (error, result) => {
      if (error) log.error(`Error inserting quote: ${error.stack}`)

      if (result.result.ok === 1) {
        log.info(`Quote #${num} in guild '${msg.guild.name}' added by ${msg.author.tag}`)
        msg.channel.send(`Quote #${num} by "${name}" successfully added to the database.`)
      }
    })
  }) */
}

module.exports.info = {
  name: 'addquote',
  usage: `${process.env.PREFIX}addquote <name> <quote> [-date mm/dd/yyyy [hh:mm [am/pm]]]`,
  desc: 'Adds a quote with optional date, attached by appending "-date", followed by a date. ' +
    'If no date is provided, the current date and time is autofilled.',
  module: 'quotes',
  dm: false
}
