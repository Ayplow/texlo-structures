import { 
  
MessageEmbed, Message, Client, Guild, TextChannel, DMChannel, GroupDMChannel } from 'discord.js'
import { Track, VoiceHandler } from './simplemusic'
import { BigNumber } from 'bignumber.js'
const config = {
  client_id: "497128790426779649",
  client_secret: "CGhs-H2tp5hYvxZtryMV50qlL5D9ityK",
  host: "https://dev.tome.ml"
}
const infoTemplates = {
  status: (guild: Guild, event:{[key: string]: any} = {}) => new MessageEmbed({
    title: `${guild.voiceConnection ? `${guild.voiceHandler.dispatcher ? 'Playing' : 'Idle'} in ${guild.voiceConnection.channel.name}` : 'Not playing'} `,
    description: `${guild.voiceHandler.currentTrack ? guild.voiceHandler.currentTrack.title +
      `${guild.voiceHandler.currentTrack.queuePart.metadata ? ` from ${guild.voiceHandler.currentTrack.queuePart.metadata.snippet.title}` +
      `\nRequested by ${guild.voiceHandler.currentTrack.queuePart.requester.user.toString()}`: ''}\n` : ''}` +
      `${event.type === 'error' ? `🚫: ${event.data}\n` : ''}` +
        `${event.type === 'success' ? `✅: ${event.data}` : ''}` 
  }),
  queue: async (guild: Guild, trackIndex) => {
    let description = ''
    let detail = ''
    const mURL = `${config.host}/${new BigNumber(guild.id).toString(32).toLocaleUpperCase()}/track`
    while (description.length + detail.length < 2000 && trackIndex < guild.voiceHandler.size) {
      description += detail
      const Track = guild.voiceHandler.songs[trackIndex]
      // Make the conditional whatever we need for the description
      if (!Track.title) await Track.queuePart.fetch(Track)
      let title = Track.title
      let author = Track.author
      let playlistname = Track.queuePart.metadata ? Track.queuePart.metadata.snippet.title : ''
      title = title.replace(/ft\..*$|feat\..*$|\(.*?\)|\[.*?\]/, '')
      detail = `${trackIndex === guild.voiceHandler.index ? '**' : ''}[${trackIndex + 1}](${mURL}${trackIndex}): [${title}](https://www.youtube.com/watch?v=${Track.youtubeId}${Track.queuePart.metadata ? `&list=${Track.queuePart.metadata.id}` : ''})${trackIndex === guild.voiceHandler.index ? '**' : ''}\n`
      trackIndex += 1
    }
    return new MessageEmbed({
      title: "Current Queue",
      description: description
    })
  }
}
function getHandler(guild: Guild) {
  if (guild.voiceHandler) return guild.voiceHandler
  const handler = new VoiceHandler({ guild: guild })
  guild.voiceHandler = handler
  handler.on('playTrack', async (track: Track) => {
    if (!track.title) await track.queuePart.fetch(track);
    summonMusicMessage(guild, 'status')
  })
  handler.on('newDispatcher', () => handler.dispatcher.on('end', () => handler.dispatcher.destroyed ? NaN :  handler.index += 1))
  handler.on('queueComplete', () => summonMusicMessage(guild, 'status', {type: 'success', data: 'Queue complete'}))
  return handler
}
async function summonMusicMessage(context, type: string, event?) {
  let channel: TextChannel;
  if (context instanceof TextChannel) channel = context
  if (context instanceof Message && context.channel instanceof TextChannel) channel = context.channel
  if (context instanceof Guild) channel = context['musicMessage'] ? context['musicMessage'].channel : (context.channels.find(i => i instanceof TextChannel) as TextChannel)
  if (!channel) return
  if (channel.guild['musicMessage'] && channel.guild['musicMessage'].deletable) channel.guild['musicMessage'].delete()
  const content = await infoTemplates[type](channel.guild, event)
  return channel.send(content).then(message => channel.guild['musicMessage'] = message)
}
export default {
  play: async function (client: Client, message: Message, args) {
    let handler = getHandler(message.guild)
    if (!message.member.voice.channel) return summonMusicMessage(message, 'status', { type: 'error', data: "Join a voice channel" })
    handler.queue(args.join(" "), message.member).then(async tracks => {
      if (!handler.connection) handler.join(message.member.voice.channel)
      await handler.start()
      if (tracks[0].queuePart.metadata) summonMusicMessage(message, 'status', { type: 'success', data: `Queued ${tracks[0].queuePart.metadata.snippet.title}` })
      else tracks[0].fetch().then(track => summonMusicMessage(message, 'status', { type: 'success', data: `Queued ${track.title}` }))
    })
  },
  join: (client: Client, message: Message) => message.member.voice.channel ? message.guild.voiceHandler.join(message.member.voice.channel) : summonMusicMessage(message.guild, 'status', {type: 'error', data: 'You must be in a voice channel'}),
  log: (client: Client, message: Message) => console.log(message),
  skip: (client: Client, message: Message, args) => {
    const difference = parseInt(args[0]) || 1
    message.guild.voiceHandler.index += difference
  },
  queue: async (client: Client, message: Message, args) => {
    let trackIndex = parseInt(args[0]) - 1 || message.guild.voiceHandler.index
    message.guild['run'] = (path: string[], user) => {
      if (!message.guild.voiceConnection.channel.members.get(user.id)) return
      if (path[0].startsWith('track')) message.guild.voiceHandler.index = parseInt(path[0].slice(5))
      if (path[0].startsWith('time')) message.guild.voiceHandler.index = parseInt(path[0].slice(4))
    }
    summonMusicMessage(message, 'queue', trackIndex)
  },
  stop: (client: Client, message: Message) => {
    message.guild.voiceHandler.clearQueue()
    message.guild.voiceHandler.stop()
  },
  say: (client: Client, message: Message, args) => message.reply(args.join(' '))
} 