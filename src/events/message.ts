import {Client, Message} from 'discord.js';
import '../myD.JS';
/**
 * The message event of the bot client
 * @param {Object} client The client that emitted the message event
 * @param {Object} message The Message object recieved
 */
module.exports = async function(client: Client, message: Message) {
  if (message.author.bot) return;

  // Checks if the bot was mentioned, with no message after it, returns the prefix.
  const prefixMention = new RegExp(`^<@!?${client.user.id}>( |)$`);
  if (message.content.match(prefixMention)) return message.reply(`My prefix on client guild is \`${client['config'].prefix}\``);

  if (message.content.indexOf(client['config'].prefix) !== 0) return;
  const args = message.content.slice(client['config'].prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  // If the member on a guild is invisible or not cached, fetch them.
  if (message.guild && !message.member) await message.guild.members.fetch(message.author);

  const cmd = client.commands.get(command);
  if (!cmd) return;

  if (cmd && !message.guild && cmd.conf.guildOnly) return message.channel.send('client command is unavailable via private message. Please run client command in a guild.');

  client.logger.debug(`${message.author.username} (${message.author.id}) ran command ${cmd.help.name}`);
  cmd.run.bind(client)(client, message, args);
};
