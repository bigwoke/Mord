const log = require('../../log.js')
const db = require('../../db.js')

module.exports.run = async (mord, msg, args) => {
  if (!args[0]) {
    return msg.reply('Missing "name" argument.').then(resp => {
      resp.delete(2000)
      msg.delete(2000)
    })
  }
  if (!args[1]) {
    return msg.reply('Missing quote.').then(resp => {
      resp.delete(2000)
      msg.delete(2000)
    })
  }

  let author = args[0]

  if (msg.mentions.users.size > 0) {
    author = msg.mentions.users.first()
    delete author.lastMessage
    delete author.settings
  } else {
    let lookup = mord.users.find(u => u.username.toUpperCase() === author.toUpperCase())
    if (lookup !== null) {
      author = lookup
      delete author.lastMessage
      delete author.settings
    }
  }

  let datePos = args.indexOf('--date')
  let hasDate = datePos !== -1

  let quote = hasDate ? args.slice(1, datePos).join(' ') : args.slice(1).join(' ')
  if (quote.length >= 1920) {
    return msg.reply('Quote is too long, maximum is 1920 characters.').then(resp => {
      resp.delete(6000)
      msg.delete(6000)
    })
  }

  let date
  if (hasDate) {
    let dateRaw = args.slice(datePos + 1).join(' ')
    date = new Date(Date.parse(dateRaw))

    if (Number.isNaN(Date.parse(dateRaw))) {
      return msg.reply('Date given is invalid.').then(resp => {
        resp.delete(6000)
        msg.delete(6000)
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
      author: author,
      date: date
    }

    mord.data.db(msg.guild.id).collection('quotes').insertOne(doc, (error, result) => {
      if (error) log.error(`Error inserting quote: ${error.stack}`)

      if (result && result.result.ok === 1) {
        let name = author.tag ? author.tag : `"${author}"`
        log.info(`Quote #${num} in guild '${msg.guild.name}' added by ${msg.author.tag}`)
        msg.channel.send(`Quote #${num} by ${name} successfully added to the database.`)
      }
    })
  })
}

module.exports.info = {
  name: 'addquote',
  usage: `${process.env.PREFIX}addquote <@user | name> <quote> [--date mm/dd/yyyy [hh:mm [am/pm]]]`,
  desc: 'Adds a quote with optional date, attached by appending "--date", followed by a date. ' +
    'If no date is provided, the current date and time is autofilled.',
  module: 'quotes',
  dm: false
}
