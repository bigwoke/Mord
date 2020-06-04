const Command = require('../../types/MordCommand');
const log = require('../../helpers/log');
const cfg = require('../../../config');
const { isDM } = require('../../helpers/tools');
const https = require('https');
const { MessageEmbed } = require('discord.js');

class WhoisCommand extends Command {
  constructor () {
    super('whois', {
      aliases: ['whois', 'who'],
      category: 'lookup',
      description: 'Attempts to display information about a given person.',
      details: 'Queries the publically accessible version of the Google ' +
        'Knowledge Graph, grabbing a description and picture of a given ' +
        'person. Not all popular people are guaranteed to be findable ' +
        'and results may be a bit odd at times (e.g. non-person results). ' +
        'This is simply a limitation of the public version of the Google KG.',
      args: [
        {
          id: 'person',
          match: 'text',
          destription: 'Person to search for.',
          prompt: {
            start: 'Who do you want to look up?'
          }
        }
      ],
      examples: [
        {
          text: 'whois',
          notes: 'prompts for person'
        },
        {
          text: 'whois John Madden'
        }
      ]
    });
  }

  exec (message, args) {
    return this.makeRequest(args).then(resp => {
      if (resp.error && resp.error.code === 400) throw new Error('Invalid API key.');
      if (resp.itemListElement.length === 0) return this.emptyResponse(message);
      const [{ result }] = resp.itemListElement;
      const embed = new MessageEmbed();

      // Build a temporary object containing needed information.
      const entity = {
        name: result.name,
        img: result.image ? result.image.contentUrl : null,
        desc: result.description || 'No description.',
        longdesc: result.detailedDescription
          ? result.detailedDescription.articleBody
          : 'No description.',
        url: result.detailedDescription ? result.detailedDescription.url : null
      };

      // Insert information into Discord embed.
      embed.setTitle(`${entity.name} - ${entity.desc}`);
      embed.setDescription(entity.longdesc);
      if (entity.url) embed.setURL(entity.url);
      if (entity.img) embed.setImage(entity.img);

      return this.send(message, '', { embed: embed });
    }).catch(err => {
      log.error('%o', err);
      return this.send(message, 'Error making request.');
    });
  }

  /**
   * Makes a request to the Urban Dictionary API to retrieve a definition.
   * @param {Object} args - Command arguments.
   * @returns {Promise<Array>}
   */
  makeRequest (args) {
    const key = cfg.keys.googlekg;
    const googleKG = 'https://kgsearch.googleapis.com/v1/entities:search' +
      `?query=${args.person}&types=Person&key=${key}&limit=1`;

    return new Promise((resolve, reject) => {
      const request = https.get(googleKG, resp => {
        let data = [];

        resp.on('data', d => {
          data.push(d);
        });

        resp.on('end', () => {
          data = data.join('');
          data = JSON.parse(data);

          resolve(data);
        });
      });

      request.on('error', reject);
    });
  }

  /**
   * Handles an empty response from a REST request.
   * @param {Message} message - Message prompting command execution.
   */
  emptyResponse (message) {
    message.channel.send('That query returned zero results.').then(m => {
      if (!isDM(m)) {
        message.delete({ timeout: 3000, reason: 'command cleanup' });
        m.delete({ timeout: 3000, reason: 'command cleanup' });
      }
    });
  }
}

module.exports = WhoisCommand;
