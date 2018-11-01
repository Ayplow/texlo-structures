import {Message, version} from 'discord.js';
import Client from '../tools/mydiscord.js';
module.exports = {
  run: function(client: Client, message: Message) {
    message.channel.send(`= STATISTICS =
  • Mem Usage  :: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
  • Uptime     :: ${new Date(client.uptime).toTimeString().slice(0, 8)}
  • Users      :: ${client.users.size.toLocaleString()}
  • Servers    :: ${client.guilds.size.toLocaleString()}
  • Channels   :: ${client.channels.size.toLocaleString()}
  • Discord.js :: v${version}
  • Node       :: ${process.version}`, {code: 'asciidoc'});
  },

  conf: {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: 'User',
  },

  help: {
    category: 'Miscelaneous',
    description: 'Gives some useful bot statistics',
    usage: 'stats',
  },
};
