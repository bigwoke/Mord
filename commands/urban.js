const Discord = require('discord.js')
const https = require('https')

module.exports.run = async (mord, msg, args) => {
  let phrase = args.join(' ')
  if (!phrase) {
    return msg.reply('Missing "phrase" argument.').then(resp => {
      resp.delete(2000)
      msg.delete(2000)
    })
  }

  let dictURI = 'https://api.urbandictionary.com/v0/define?term=' + encodeURIComponent(phrase)
  https.get(dictURI, resp => {
    let data = ''

    resp.on('data', chunk => {
      data += chunk
    })

    resp.on('end', () => {
      let response = JSON.parse(data).list
      console.log(response)
      let entries = response.length >= 3 ? 3 : response.length
      let embed = new Discord.RichEmbed()
      embed.setTitle(`Here are the top ${entries} entries on Urban Dictionary for "${phrase}":`)
      embed.setURL(`https://www.urbandictionary.com/define.php?term=${phrase.replace(' ', '+')}`)

      for (let ct = 0; ct < entries; ct++) {
        let def = response[ct].definition.replace(/[[\]]/g, '').replace(/\n+/g, ' ').slice(0, 1024)
        let votes = response[ct].thumbs_up
        let title = `Definition ${ct + 1}, ${votes} upvotes:`
        embed.addField(title, def)
      }
      msg.channel.send({ embed: embed })
    })
  })
}

module.exports.info = {
  name: 'urban',
  usage: `${process.env.PREFIX}urban <phrase>`,
  desc: 'Gets top entries for the given term from Urban Dictionary.',
  dm: true,
  permissions: 0
}
