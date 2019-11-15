const log = require('../../log.js')

module.exports.run = async (mord, msg, args) => {
  if (!args[0]) {
    return msg.reply('Missing "number" argument.').then(resp => {
      resp.delete(2000)
      msg.delete(2000)
    })
  }

  let num = parseInt(args[0])
  let quote = await mord.data.db(msg.guild.id).collection('quotes').findOne({ number: num })
  if (!quote) {
    return msg.reply('Could not find a quote with that number for this guild.').then(resp => {
      resp.delete(3000)
      msg.delete(3000)
    })
  }

  mord.data.db(msg.guild.id).collection('quotes').deleteOne({ number: num }, (err, res) => {
    if (err) log.error(`Error deleting quote from database: ${err.stack}`)
    if (res.result.ok === 1) {
      log.info(`Quote #${num} in guild '${msg.guild.name}' deleted by ${msg.author.tag}`)
      msg.channel.send(`Quote #${num} by "${quote.author}" successfully deleted.`)
    }
  })
}

module.exports.info = {
  name: 'delquote',
  usage: `${process.env.PREFIX}delquote <number>`,
  desc: 'Deletes the quote with the given number from the database. This number is never reused.',
  module: 'quotes',
  dm: false,
  permissions: 8224
}
