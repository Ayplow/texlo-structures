import { Message, Client, PartialTextBasedChannelFields } from 'discord.js';
import '../myD.JS';

module.exports = {
  run: function (client: Client, message: Message, args) {
    if (!args || args.length < 1) return message.channel.errorEmbed('Must provide a command to reload. Derp.');
    this.unloadCommand(args[0]).then((cmd) => {
      if (cmd instanceof Error) return message.channel.errorEmbed(`Error Unloading: ${cmd.message}`);
      const res = this.loadCommand(cmd);
      if (res instanceof Error) return message.channel.errorEmbed(`Error Loading: ${res.message}`);
      message.channel.successEmbed(`The command \`${cmd}\` has been reloaded`);
    });
  },

  conf: {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: 'Bot Admin'
  },

  help: {
    category: 'System',
    description: 'Reloads a command that"s been modified.',
    usage: 'reload [command]'
  }
};
