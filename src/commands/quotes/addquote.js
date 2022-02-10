const Command = require('../../types/MordCommand');
const log = require('../../helpers/log');
const { Argument } = require('discord-akairo');

class AddQuoteCommand extends Command {
  // eslint-disable-next-line max-lines-per-function
  constructor () {
    super('addquote', {
      aliases: ['addquote', 'add-quote', 'newquote', 'qadd'],
      category: 'quotes',
      channel: 'guild',
      description: 'Adds a quote by a given user. *Syntax is a bit particular.*',
      details: 'Adds a given quote to the database. Quotes are separate between ' +
        'guilds, there are no global quotes. __The author must be mentioned, ' +
        'and the quote itself should be enclosed in quotation marks.__ This ' +
        'also applies to the date option input if one is included, and the url ' +
        'option if there is a space in the address. \n' +
        'To use a custom date (if the quote was said in the past) include the ' +
        '`--date` option in the command, followed by a string that resolves ' +
        'to a date. Time zones are supported, but optional. Dates can be ' +
        'as specific or vague as you wish, see some included examples for ' +
        'reference if necessary. Same procedure for a url; include `--url` ' +
        'followed by a *fully qualified* URL (so, including http or https).',
      destruct: 10000,
      cooldown: 5000,
      args: [
        {
          id: 'author',
          type: 'memberMention',
          description: 'Guild member (@mention) who authored the quote.',
          unordered: true,
          prompt: {
            start: 'Who is the author of the quote? @Mention them.',
            retry: 'Could not find that guild member. Try again.'
          }
        },
        {
          id: 'quote',
          match: 'phrase',
          type: async (message, phrase) => {
            const { resolver } = this.handler;
            const q = await Argument.cast('string', resolver, message, phrase);
            if (q && q.length <= 1800) return q;
            return null;
          },
          description: 'Quote to be added.',
          unordered: true,
          prompt: {
            retries: 0,
            start: 'What quote do you want to add?',
            ended: 'Quote is too long, quotes must be at most 1800 characters.'
          }
        },
        {
          id: 'date',
          type: 'date',
          match: 'option',
          description: 'Date the quote was authored.',
          flag: '--date',
          prompt: {
            retry: 'Could not resolve a valid date, what date do you want to use?',
            optional: true
          }
        },
        {
          id: 'url',
          type: async (message, phrase) => {
            const { resolver } = this.handler;
            const url = await Argument.cast('url', resolver, message, phrase);
            if (url.href && url.href.length <= 240) return url;
            return null;
          },
          match: 'option',
          description: 'URL containing the quote or context. ' +
            'Must include protocol (i.e. https://), and be under 240 chars.',
          flag: '--url',
          prompt: {
            retry: 'Could not set URL, what URL do you want to use? Remember ' +
              'to include the protocol and keep it below 240 chars.',
            optional: true
          }
        }
      ],
      examples: [
        {
          text: 'addquote',
          notes: 'will prompt for author and quote, use the current date, no url'
        },
        {
          text: 'addquote @Mord',
          notes: 'will use the current date and prompt for quote'
        },
        {
          text: 'addquote @Mord "funny quote"',
          notes: 'will use the current date'
        },
        {
          text: 'addquote "funny quote" @Mord --date "3/21/2023"'
        },
        {
          text: 'addquote --date "March 2023" "funny quote" @Mord'
        },
        {
          text: 'addquote @Mord "funny quote" --date "March 21, 2023 5:34:06 PM GMT-9"'
        },
        {
          text: 'addquote @Mord "funny quote" --date "2023"',
          notes: 'date is vague but 100% valid'
        },
        {
          text: 'addquote @Mord "funny quote" --url "https://google.com"',
          notes: 'quote will link to Google'
        }
      ]
    });
  }

  exec (message, args) {
    args.author = args.author.user;
    args.quote.replace(/^"+|"+$/gu, '');

    const document = {
      quote: args.quote.trim(),
      date: args.date || new Date(Date.now()),
      url: args.url,
      author: args.author,
      submitter: message.author
    };

    this.client.data.addQuote(message.guild, document).then(res => {
      if (res.acknowledged) {
        const num = res.insertedId;
        const { tag } = args.author;
        this.send(message, `Quote #${num} by ${tag} has been added.`);
      } else {
        this.send(message, 'There was an issue saving that quote.');
      }
    }).catch(err => {
      this.send(message, 'Error adding quote, let the bot owner know.');
      log.error(err);
    });
  }
}

module.exports = AddQuoteCommand;
