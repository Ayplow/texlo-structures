const Discord = require('discord.js')
const ytdl = require('ytdl-core')

const client = new Discord.Client()
client.on('message', message => 
  message.guild.channels.find(channel => channel.type === 'voice')
  .join()
  .then(connection => connection.play(ytdl('https://www.youtube.com/watch?v=wGyUP4AlZ6I')))
  .then(dispatcher => dispatcher.on('end', () => dispatcher.player.voiceConnection.play(ytdl('https://www.youtube.com/watch?v=wGyUP4AlZ6I'))))
)
client.login('NDkyNDE4Mzk3MzkzNjQ5Njg0.DrddWQ.ggNVpKy9b7gFEfS5vl1hJJbdm-4')
