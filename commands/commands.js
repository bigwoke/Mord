const Discord = require('discord.js')
const tools = require('../tools.js')

module.exports.run = async (mord, msg, args) => {
  let roles = tools.getBotRoles(mord, msg)
  let color = roles ? roles.last().color : 0

  let cmdEmbed = new Discord.RichEmbed()
    .setColor(color)
    .setAuthor('List of available Mord commands', 'http://memerust.tk/files/Mord.png')

  let commands = mord.commands.sort((a, b) => {
    if (a.info.name < b.info.name) return -1
    if (a.info.name > b.info.name) return 1
    return 0
  })

  if (msg.channel.type === 'dm') {
    cmdEmbed.setFooter('Commands unavailable in DM will not be listed.')
  }

  let authorPerms = msg.guild.members.find(m => m.user.id === msg.author.id).permissions.bitfield
  commands.forEach(cmd => {
    if (cmd.info.permissions !== 0 && (authorPerms & cmd.info.permissions) === 0) return
    if (msg.channel.type === 'dm' && !cmd.info.dm) return
    if (cmd.info.usage.length === 0 || cmd.info.desc.length === 0) return
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
  dm: true,
  permissions: 0
}
