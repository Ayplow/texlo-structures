// The EVAL command will execute **ANY** arbitrary javascript code given to it.
// client IS PERMISSION LEVEL 10 FOR A REASON! It's perm level 10 because eval
// can be used to do **anything** on your machine, from stealing information to
// purging the hard drive. DO NOT LET ANYONE ELSE USE client

// However it's, like, super ultra useful for troubleshooting and doing stuff
// you don't want to put in a command.
import { inspect } from "util";
import { Client, Message, MessageEmbed } from "discord.js";
import { request } from "https";
import "../myD.JS";
module.exports = {
  run: async function(client: Client, message: Message, args: Array<string>) {
    const cleanText = async (input): Promise<string> =>
      inspect(input instanceof Promise ? await input : input, { depth: 2 })
        .replace(client.token, "[TOKEN]")
        .replace(/`/g, String.fromCharCode(8203) + "$&");
    const evalHistory: Array<any> = (message.author["evalHistory"] =
      message.author["evalHistory"] || []);
    let suppress = false;
    let haste = false;
    if (args[0] === "-suppress") suppress = Boolean(args.shift());
    if (args[0] === "-haste") haste = Boolean(args.shift());
    const code = args.join(" ");
    try {
      const evaled = eval(code);
      const clean = await cleanText(evaled);
      if (haste) return request(
        {
          host: "hastebin.com",
          path: "/documents",
          method: "POST"
        },
        res => {
          let body = "";
          res.on("data", chunk => (body += chunk));
          res.on("end", () =>
            message.channel.send(new MessageEmbed({
              type: 'rich',
              title: 'Uploaded to hastebin',
              url: `https://hastebin.com/${JSON.parse(body).key}`
            }))
          );
        }
      ).end(clean);
      if (!suppress) {
        if (clean.length > 1990) {
          if (client.config.logLongOutput) {
            client.logger(evaled);
            message.channel.successEmbed(
              "Execution complete and output to console"
            );
          } else
            message.channel.send(
              "Execution complete, output has been trimmed```\n" +
                clean.substring(0, 1949) +
                "```"
            );
        } else message.channel.send("```js\n" + clean + "```");
      }
      evalHistory.unshift(await evaled);
      if (evalHistory.length > 10) evalHistory.pop();
    } catch (err) {
      const clean = await cleanText(err);
      if (!suppress) {
        if (clean.length > 1990) {
          if (client.config.logLongOutput) {
            client.logger(err);
            return message.channel.errorEmbed(
              "Execution failed and stacktrace logged"
            );
          } else {
            return message.channel.errorEmbed(
              "Execution failed, stacktrace has been trimmed```\n" +
                clean.substring(0, 1995) +
                "```"
            );
          }
        }
      }
      message.channel.errorEmbed("```xl\n" + clean + "```");
    }
  },

  conf: {
    permLevel: 8
  },

  help: {
    category: "System",
    description: "Evaluates arbitrary javascript.",
    usage: "eval [...code]"
  }
};
