const Discord = require('discord.js')
const tools = require('../tools.js')

module.exports.run = async (mord, msg, args) => {
  let roles = tools.getBotRoles(mord, msg)
  let color = roles ? roles.last().color : 0

  let info = new Discord.RichEmbed()
    .setColor(color)
    .setAuthor('Mord Information Panel', 'http://memerust.tk/files/Mord.png')
    .setTitle('Mord is a multipurpose, semi-modular Discord chat bot.')
    .setDescription('Written from scratch using Node.JS and MongoDB, Mord was ' +
      'created as a quote-keeping bot, with other useful abilities and features.')
    .addField('Quotekeeping', 'Quotes can be kept from multiple different Discords.')
    .addField('Self-Clearing', 'Simple one-off responses are auto-removed to prevent spam.')
    .addField('Private Messages', 'Commands are accepted via DM where possible, with ' +
      'the exception of functionality that is tied to a specific server (e.g. quotes).')
    .addField('Creator', 'DJ#8074 on Discord', true)
    .addField('Source', '[bigwoke](https://github.com/bigwoke/) on GitHub', true)

  msg.channel.send({ embed: info }).then(resp => {
    if (msg.channel.type === 'text') {
      resp.delete(40000)
      msg.delete(40000)
    }
  })
}

module.exports.info = {
  name: 'info',
  usage: `${process.env.PREFIX}info`,
  desc: 'Provides basic bot information.',
  dm: true
}
