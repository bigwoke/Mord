const Discord = require('discord.js')
const log = require('../../log.js')

function formatDate (q) {
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

function getQuote (mord, msg, args, cb) {
  if (args[0]) {
    if (Number.isNaN(parseInt(args[0]))) {
      return msg.reply('"number" argument is not a number.').then(resp => {
        resp.delete(3000)
        msg.delete(3000)
      })
    }

    let query = { number: parseInt(args[0]) }
    mord.data.db(msg.guild.id).collection('quotes').findOne(query, (err, res) => {
      if (err) log.error(`Error getting quote from database: ${err.stack}`)
      if (res === null) {
        return msg.reply('There is no quote with that number.').then(resp => {
          resp.delete(3000)
          msg.delete(3000)
        })
      }

      cb(res)
    })
  } else {
    mord.data.db(msg.guild.id).collection('quotes').aggregate([{ sample: { size: 1 } }])
      .toArray((err, res) => {
        if (err) log.error(`Error getting quote from database: ${err.stack}`)

        cb(res[0])
      })
  }
}

module.exports.run = async (mord, msg, args) => {
  getQuote(mord, msg, args, q => {
    let opts = formatDate(q)
    let date = q.date.toLocaleString(undefined, opts)

    let quote = new Discord.RichEmbed()

    if (typeof q.author === 'string') {
      quote.setColor(0)
      quote.setAuthor(q.author)
      quote.setTitle(`"${q.quote}"`)
      quote.setFooter(`#${q.number} - ${date}`)
    } else {
      let author = msg.guild.members.find(m => m.id === q.author.id)
      quote.setColor(author.roles.last().color)
      quote.setAuthor(author.user.tag, author.user.displayAvatarURL)
      quote.setTitle(`"${q.quote}"`)
      quote.setFooter(`#${q.number} - ${date}`)
    }

    msg.channel.send({ embed: quote })
  })
}

module.exports.info = {
  name: 'quote',
  usage: `${process.env.PREFIX}quote [number]`,
  desc: 'Prints a random quote, unless a number is specified.',
  module: 'quotes',
  dm: false
}
