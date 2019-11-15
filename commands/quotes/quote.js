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
      let lookup = args[0]
      let query = {}

      if (msg.mentions.users.size > 0) {
        lookup = msg.mentions.users.first()
        query = { 'author.id': lookup.id }
      } else {
        let search = mord.users.find(u =>
          u.username.toUpperCase() === args[0].toUpperCase() &&
          msg.guild.members.has(u.id)
        )
        if (search !== null) {
          lookup = search
          query = { 'author.id': lookup.id }
        } else {
          lookup = args[0]
          query = { author: lookup }
        }
      }

      mord.data.db(msg.guild.id).collection('quotes').findOne(query, (err, res) => {
        if (err) log.error(`Error getting quote from database: ${err.stack}`)
        if (res === null) {
          return msg.reply('There are no quotes by that author.').then(resp => {
            resp.delete(2000)
            msg.delete(2000)
          })
        }

        cb(res)
      })
    } else {
      let query = { number: parseInt(args[0]) }
      mord.data.db(msg.guild.id).collection('quotes').findOne(query, (err, res) => {
        if (err) log.error(`Error getting quote from database: ${err.stack}`)
        if (res === null) {
          return msg.reply('There is no quote with that number.').then(resp => {
            resp.delete(2000)
            msg.delete(2000)
          })
        }

        cb(res)
      })
    }
  } else {
    mord.data.db(msg.guild.id).collection('quotes').aggregate([{ $sample: { size: 1 } }])
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
      quote.setDescription(`"${q.quote}"`)
      quote.setFooter(`#${q.number} - ${date}`)
    } else {
      let author = msg.guild.members.find(m => m.id === q.author.id)
      quote.setColor(author.roles.last().color)
      quote.setAuthor(author.user.tag, author.user.displayAvatarURL)
      quote.setDescription(`"${q.quote}"`)
      quote.setFooter(`#${q.number} - ${date}`)
    }

    msg.channel.send({ embed: quote })
  })
}

module.exports.info = {
  name: 'quote',
  usage: `${process.env.PREFIX}quote [number | @user | name]`,
  desc: 'Prints a random quote, unless a number, discord user, or name is specified.',
  module: 'quotes',
  dm: false,
  permissions: 0
}
