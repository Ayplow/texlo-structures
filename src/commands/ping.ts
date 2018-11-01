import { Client, Message } from 'discord.js';
import '../myD.JS';
module.exports = (client: Client, message: Message) => {
  message.channel.infoEmbed('<:HZ:496261900405833739>Ping?').then((msg: Message) => msg.channel.infoEmbed(`🏓 ${msg.createdTimestamp - message.createdTimestamp}ms.`, msg));
};