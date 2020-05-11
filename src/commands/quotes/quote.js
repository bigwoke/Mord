const Command = require('../../types/MordCommand');
const { Argument } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');

class QuoteCommand extends Command {
  constructor () {
    super('quote', {
      aliases: ['quote', 'getquote', 'q'],
      category: 'quotes',
      channel: 'guild',
      description: 'Displays a quote, its date, and author.',
      details: 'When provided with no arguments, this will return a random ' +
        'quote from that guild, displaying the quote, author, and date. ' +
        'Providing a number will return the quote with that number, and ' +
        'providing a user will return a random quote by that user.' +
        'Requesting a non-specific quote (random or user search), the ' +
        'returned quote will be given a cooldown amounting to the command ' +
        'cooldown time, multiplied by the amount of quotes stored for that ' +
        'guild. This is done to prevent excessive duplicates, and quotes ' +
        'still be accessed during this time by specifying their number. ',
      cooldown: 5000,
      examples: [
        { text: 'quote' },
        { text: 'quote 45' },
        { text: 'quote Mord' }
      ],
      args: [
        {
          id: 'filter',
          type: async (message, phrase) => {
            const { resolver } = this.handler;
            const num = await Argument.cast('number', resolver, message, phrase);
            const user = await Argument.cast('user', resolver, message, phrase);
            return num || user || null;
          },
          description: 'Number or user to retrieve a quote with.'
        }
      ]
    });
  }

  exec (message, args) {
    this.client.data.getQuote(message.guild, args.filter).then(quote => {
      if (!quote && !args.filter) return this.send(message, 'None exist, add some!');
      else if (!quote) this.send(message, 'Could not find a matching quote.');

      // Prepare date and author for display
      const date = quote.date.toLocaleString('en-US', this.dateOpts(quote.date));
      const author = message.guild.members.resolve(quote.author.id) || quote.author;

      const embed = new MessageEmbed();
      embed.setColor(author.displayColor);
      embed.setAuthor(
        author.displayName || author.username,
        author.user.displayAvatarURL()
        );
      embed.setDescription(`"${quote.quote}"`);
      embed.setFooter(`#${quote.number} - ${date}`);

      this.send(message, null, { embed: embed });
    });
  }

  dateOpts (date) { // eslint-disable-line max-statements
    // If a date does not have second or ms precision, consider it vague.
    const vague = !date.getSeconds() && !date.getMilliseconds();

    // Set default options for date string formatting.
    const opts = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short'
    };

    // Go down the list of "vagueness," gradually reducing output precision.
    if (vague) {
      delete opts.second;
      if (!date.getMinutes()) {
        delete opts.minute;
        if (!date.getHours()) {
          delete opts.hour;
          delete opts.timeZoneName;
          opts.month = 'short';
          if (date.getDate() === 1) {
            delete opts.day;
            opts.month = 'long';
          }
        }
      }
    }

    return opts;
  }
}

module.exports = QuoteCommand;
