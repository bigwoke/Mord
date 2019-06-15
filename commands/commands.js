const Discord = require('discord.js')
const tools = require('../tools.js')

module.exports.run = async (mord, msg, args) => {
  let roles = tools.getBotRoles(mord, msg)
  let color = roles ? roles.last().color : 0

  let cmdEmbed = new Discord.RichEmbed()
    .setColor(color)
    .setAuthor('List of available Mord commands', 'http://memerust.tk/files/Mord.png')

  let commands = mord.commands.sort((a, b) => {
    if (a[0] < b[0]) return -1
    if (a[0] > b[0]) return 1
    return 0
  })

  if (msg.channel.type === 'dm') {
    cmdEmbed.setFooter('Commands unavailable in DM will not be listed.')
  }

  commands.forEach(cmd => {
    // Check permissions here
    if (msg.channel.type === 'dm' && !cmd.info.dm) return
    cmdEmbed.addField(cmd.info.usage, cmd.info.desc)
  })

  msg.channel.send({ embed: cmdEmbed }).then(resp => {
    if (msg.channel.type === 'text') {
      resp.delete(60000)
      msg.delete(60000)
    }
  })
}

module.exports.info = {
  name: 'commands',
  usage: `${process.env.PREFIX}commands`,
  desc: 'Lists available commands, including usage and descriptions.',
  dm: true
}
