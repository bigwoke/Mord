const Command = require('../../types/MordCommand');
const log = require('../../helpers/log');

class AddQuoteCommand extends Command {
  // eslint-disable-next-line max-lines-per-function
  constructor () {
    super('addquote', {
      aliases: ['addquote', 'add-quote', 'newquote'],
      category: 'quotes',
      channel: 'guild',
      description: 'Adds a quote by a given user. Syntax is a bit particular.',
      details: 'Adds a given quote to the database, storing the quote, the ' +
        'author, the date and time (given or current), the person adding the ' +
        'quote, and an incrementing number that is different per-guild. Quotes ' +
        'are separate between guilds, and there are no global quotes. Note ' +
        'also, this command will __not__ prompt you for an author. To use ' +
        'a custom date, include the `--date` flag in the command, followed ' +
        'by a date resolvable string, like "3/21/2023 20:34" or "March 21, ' +
        '2023, 8:34 PM." Time zones are supported as well. Dates can be as ' +
        'specific or vague as you wish. See some valid examples if necessary.',
      destruct: 10000,
      cooldown: 5000,
      examples: [
        {
          text: 'addquote @Mord',
          notes: 'will prompt for quote and use current date'
        },
        {
          text: 'addquote Mord funny quote',
          notes: 'will use current date'
        },
        {
          text: 'addquote Mord funny quote --date 3/21/2023'
        },
        {
          text: 'addquote @Mord funny quote --date March 21, 2023, 8:34 PM PST'
        }
      ],
      args: [
        {
          id: 'author',
          type: 'user',
          description: 'Guild member who authored the quote.',
          otherwise: 'Could not parse a guild member from that command. Try again.'
        },
        {
          id: 'content',
          match: 'restContent',
          description: 'Quote to be added, optionally including a date flag.',
          prompt: {
            start: 'What is the quote you want to add?',
            retry: 'Please try again.'
          }
        }
      ]
    });
  }

  exec (message, args) {
    // Make the arguments easier to work with right away
    args = this.parseArgs(args);
    if (!args.date) return this.send(message, 'Invalid date. Try again.');

    this.addQuote(message, args);
  }

  addQuote (message, args) {
    const document = {
      quote: args.quote,
      date: args.date,
      author: args.author,
      submitter: message.author
    };

    this.client.data.addQuote(message.guild, document).then(res => {
      if (res.result.ok === 1) {
        const num = res.op.number;
        const { tag } = args.author;
        this.send(message, `Quote #${num} by ${tag} added successfully.`);
      } else {
        this.send(message, 'There was an issue adding that quote.');
      }
    }).catch(err => {
      this.send(message, 'Error after adding quote, let the bot owner know.');
      log.error(err);
    });
  }

  parseArgs (args) {
    const { content } = args;
    // Quote goes until the '--date' string, if it exists.
    let quote = content.includes('--date')
      ? content.substring(0, content.indexOf('--date')).trim()
      : content.trim();

    // Remove matching double quotes from the string if they're present.
    if (quote.startsWith('"') && quote.endsWith('"')) quote =
      quote.substring(1, quote.length - 1);

    // Date is the content after the '--date' string.
    const rawDate = content.includes('--date')
      ? Date.parse(content.substring(
          content.indexOf('--date') + '--date'.length,
          content.length
          ))
      : new Date(Date.now());

    const date = isNaN(rawDate)
      ? null
      : new Date(rawDate);

    // Remove raw content argument and replace with quote/date arguments
    delete args.content;
    args.quote = quote;
    args.date = date;

    return args;
  }
}

module.exports = AddQuoteCommand;
