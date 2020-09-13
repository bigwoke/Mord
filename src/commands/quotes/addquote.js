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
      details: 'Adds a given quote to the database, storing the quote, its ' +
        'author, the date and time (given or current), the person adding the ' +
        'quote, and the quote\'s assigned incrementing number, different ' +
        'per-guild. Quotes are separate between guilds, there are no global ' +
        'quotes. __The quote itself *must* be enclosed in quotation marks.__ ' +
        'This also applies to the date option input if one is included, and ' +
        'the url option if there is a space in the address. To use a ' +
        'custom date (i.e. the quote was said in the past), include the ' +
        '`--date` option in the command, followed by a string that resolves ' +
        'to a date. Time zones are supported, but optional. Dates can be ' +
        'as specific or vague as you wish, see some included examples for ' +
        'reference if necessary. Same procedure for a url, include --url ' +
        'followed by a *fully qualified* URL (including protocol).',
      destruct: 10000,
      cooldown: 5000,
      args: [
        {
          id: 'author',
          type: 'member',
          description: 'Guild member who authored the quote.',
          unordered: true,
          prompt: {
            start: 'Who is the author of the quote?',
            retry: 'Could not find that guild member. Try again.'
          }
        },
        {
          id: 'quote',
          type: async (message, phrase) => {
            const { resolver } = this.handler;
            const q = await Argument.cast('string', resolver, message, phrase);
            if (q && q.length <= 1800) return q;
            return null;
          },
          description: 'Quote to be added.',
          unordered: true,
          prompt: {
            start: 'What quote do you want to add (remember, under 1800 chars)?',
            retry: 'Remember, quotes must be at most 1800 characters. Try again.'
          }
        },
        {
          id: 'date',
          type: 'date',
          match: 'option',
          description: 'Date the quote was authored.',
          default: new Date(Date.now()),
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
          text: 'addquote @Mord',
          notes: 'will use the current date and prompt for quote'
        },
        {
          text: 'addquote Mord "funny quote"',
          notes: 'will use the current date'
        },
        {
          text: 'addquote "funny quote" Mord --date "3/21/2023"'
        },
        {
          text: 'addquote --date "March 2023" "funny quote" Mord'
        },
        {
          text: 'addquote @Mord "funny quote" --date "March 21, 2023 5:34:06 PM GMT-9"'
        },
        {
          text: 'addquote @Mord "funny quote" --date "2023"',
          notes: 'date is vague but 100% valid'
        },
        {
          text: 'addquote Mord "funny quote" --url "google.com"'
        }
      ]
    });
  }

  exec (message, args) {
    args.author = args.author.user;
    const document = {
      quote: args.quote.trim(),
      date: args.date,
      url: args.url,
      author: args.author,
      submitter: message.author
    };

    this.client.data.addQuote(message.guild, document).then(res => {
      if (res.result.ok === 1) {
        const num = res.op.number;
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
