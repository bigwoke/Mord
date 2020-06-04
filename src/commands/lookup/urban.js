const Command = require('../../types/MordCommand');
const log = require('../../helpers/log');
const { isDM } = require('../../helpers/tools');
const https = require('https');
const { MessageEmbed } = require('discord.js');

class UrbanCommand extends Command {
  constructor () {
    super('urban', {
      aliases: ['urban', 'urbandict', 'urban-dict'],
      category: 'lookup',
      description: 'Gets a word\'s top definitions from Urban Dictionary.',
      details: 'Searches for the given term or phrase using the Urban ' +
        'Dictionary API, and returns the top three results. Each term ' +
        'definition has a character limit of 2000, at which point the ' +
        'term\'s definition will be truncated.',
      args: [
        {
          id: 'term',
          match: 'text',
          destription: 'Term to search on Urban Dictionary.',
          prompt: {
            start: 'What term/phrase do you want to look up?'
          }
        }
      ],
      examples: [
        {
          text: 'urban',
          notes: 'prompts for search term'
        },
        {
          text: 'urban term'
        },
        {
          text: 'urban multi word phrase'
        }
      ]
    });
  }

  exec (message, args) {
    function appendField (embed, ct, response) {
      const title = `Definition ${ct + 1}, ${response[ct].thumbs_up} upvotes:`;
      const definition = response[ct].definition
        .replace(/[[\]]/gu, '')
        .replace(/\n+/gu, ' ')
        .slice(0, 2000);

      embed.addField(title, definition);
    }

    return this.makeRequest(args).then(response => {
      if (!response || response.length === 0) return this.emptyResponse(message);
      const entries = response.length >= 3 ? 3 : response.length;
      const urbanDict = 'https://www.urbandictionary.com/define.php?term=';
      const embed = new MessageEmbed();

      embed.setTitle(`Here are the top ${entries} entries ` +
        `on Urban Dictionary for the term "${args.term}"`);
      embed.setURL(`${urbanDict}${args.term.replace(' ', '+')}`);

      for (let ct = 0; ct < entries; ct++) {
        appendField(embed, ct, response);
      }

      this.send(message, '', { embed: embed });
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
    const urbanAPI = `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(args.term)}`;

    return new Promise((resolve, reject) => {
      const request = https.get(urbanAPI, resp => {
        let data = [];

        resp.on('data', d => {
          data.push(d);
        });

        resp.on('end', () => {
          data = data.join('');
          data = JSON.parse(data).list;

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
    message.channel.send('That term returned zero results.').then(m => {
      if (!isDM(m)) {
        message.delete({ timeout: 3000, reason: 'command cleanup' });
        m.delete({ timeout: 3000, reason: 'command cleanup' });
      }
    });
  }
}

module.exports = UrbanCommand;
