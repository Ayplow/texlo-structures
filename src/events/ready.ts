import { Client } from 'discord.js';
import '../myD.JS';
module.exports = function (client: Client) {
  // Log that the bot is online.
  client.logger(`${client.user.tag}, ready to serve ${client.users.size} users in ${client.guilds.size} servers.`);
  
  // Make the bot activity 'Listening to any mentions', alluding to the mention functionality that can tell users the prefix to use.
  client.user.setActivity('pings', { type: 'LISTENING' });
};
