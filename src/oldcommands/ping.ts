import {Client, Message} from 'discord.js';
import '../myD.JS';
module.exports = (client: Client, message: Message) => message.channel.send('Ping?').then((msg: Message) => msg.edit(`Pong! Latency is ${msg.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`));