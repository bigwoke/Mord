const Command = require('../../types/MordCommand');
const log = require('../../helpers/log');

class DelQuoteCommand extends Command {
  constructor () {
    super('delquote', {
      aliases: ['delquote', 'del-quote', 'deletequote', 'rmquote'],
      category: 'quotes',
      channel: 'guild',
      description: 'Deletes a quote by number.',
      details: 'This command will delete a quote with the given number, and ' +
        'that number __will not__ be available for use again in the guild.',
      destruct: 10000,
      cooldown: 5000,
      examples: [
        {
          text: 'delquote',
          notes: 'will prompt for quote number'
        },
        {
          text: 'delquote 9995'
        }
      ],
      args: [
        {
          id: 'number',
          type: 'number',
          description: 'Number of the quote to remove.',
          prompt: {
            start: 'What quote number do you want to remove?',
            retry: 'That does not cast to a number. Try again.'
          }
        }
      ]
    });
  }

  exec (message, args) {
    this.client.data.delQuote(message.guild, args.number).then(res => {
      if (res.value) {
        const tag = `${res.value.author.username}${res.value.author.discriminator}`;
        this.send(message, `Quote #${args.number} by ${tag} has been removed.`);
      } else {
        this.send(message, 'No quote was found with that number.');
      }
    }).catch(err => {
      this.send(message, 'Error after deleting quote, let the bot owner know.');
      log.error(err);
    });
  }
}

module.exports = DelQuoteCommand;
