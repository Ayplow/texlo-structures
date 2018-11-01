// The EVAL command will execute **ANY** arbitrary javascript code given to it.
// client IS PERMISSION LEVEL 10 FOR A REASON! It's perm level 10 because eval
// can be used to do **anything** on your machine, from stealing information to
// purging the hard drive. DO NOT LET ANYONE ELSE USE client


// However it's, like, super ultra useful for troubleshooting and doing stuff
// you don't want to put in a command.
import {inspect} from 'util';
import {Client, Message} from 'discord.js';
import '../myD.JS';
module.exports = {
  run: async function(client: Client, message: Message, args) {
    const cleanText = (input): string => inspect(input, { depth: 2 }).replace(client.token, '[TOKEN]');
    const code = args.join(' ');
    try {
      const evaled = eval(code);
      const clean = cleanText(eval(code));
      if (clean.length > 1990) {
        if (client.config.logLongOutput) {
          client.logger(evaled);
          return message.channel.successEmbed('Execution complete and output to console');
        } else {
          return message.channel.send('Execution complete, output has been trimmed```\n' + clean.substring(0, 1949) + '```');
        }
      }
      message.channel.send('```js\n' + clean + '```');
    } catch (err) {
      const clean = cleanText(err);
      if (clean.length > 1990) {
        if (client.config.logLongOutput) {
          client.logger(err);
          return message.channel.errorEmbed('Execution failed and stacktrace logged');
        } else {
          return message.channel.errorEmbed('Execution failed, stacktrace has been trimmed```\n' + clean.substring(0, 1995) + '```');
        }
      }
      message.channel.errorEmbed('```xl\n' + clean + '```');
    }
  },

  conf: {
    permLevel: 8,
  },

  help: {
    category: 'System',
    description: 'Evaluates arbitrary javascript.',
    usage: 'eval [...code]',
  },
};
