import {Client} from 'discord.js'
import fetch from 'node-fetch'
import { Duplex } from 'stream';
const client = new Client()
client.on('ready', () => console.log('online'))
client.on('message', message => {
  message.delete()
})
client.login('NDkyNDE4Mzk3MzkzNjQ5Njg0.DqjMDQ.tjAOBOJj2irG7nz8-ctoa0jvvec')
