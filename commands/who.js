const https = require('https')
const cfg = require('../config.js')
const Discord = require('discord.js')

module.exports.run = async (mord, msg, args) => {
  if (!args[0]) {
    return msg.reply('Missing "person" argument.').then(resp => {
      resp.delete(2000)
      msg.delete(2000)
    })
  }

  const query = args.join(' ')
  const key = cfg.googleapi
  const url = `https://kgsearch.googleapis.com/v1/entities:search?query=${query}&types=Person&key=${key}&limit=1`

  let resultEmbed = new Discord.RichEmbed()

  https.get(url, resp => {
    let data = ''

    resp.on('data', chunk => {
      data += chunk
    })

    resp.on('end', () => {
      let result = JSON.parse(data)
      if (result.itemListElement.length === 0) {
        return msg.reply('No result found.').then(resp => {
          resp.delete(2000)
          msg.delete(2000)
        })
      }

      result = result.itemListElement[0].result
      let validType = result['@type'].includes('Person')
      if (!validType) return console.log('this should not happen')

      console.log(result)

      let entity = {
        name: result.name,
        img: result.image ? result.image.contentUrl : undefined,
        desc: result.description || 'No description.',
        longdesc: result.detailedDescription ? result.detailedDescription.articleBody : 'No description.',
        url: result.detailedDescription ? result.detailedDescription.url : undefined
      }

      resultEmbed.setTitle(`${entity.name} - ${entity.desc}`)
      resultEmbed.setDescription(entity.longdesc)
      if (entity.url) resultEmbed.setURL(entity.url)
      if (entity.img) resultEmbed.setImage(entity.img)

      msg.channel.send({ embed: resultEmbed })
    })
  })
}

module.exports.info = {
  name: 'who',
  usage: `${process.env.PREFIX}who <person>`,
  desc: 'Returns basic information and a picture of the given person, sourced from the Google Knowledge Graph.',
  dm: true,
  permissions: 0
}
