import { Client, Message } from 'discord.js';
import '../myD.JS';
import Linguister from 'linguister'

module.exports = (client: Client, message: Message, args: string[]) => Linguister(args.join(' ')).then(res => message.channel.send(res.text))