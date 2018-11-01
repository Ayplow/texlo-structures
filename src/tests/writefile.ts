import { Message } from "../myD.JS/modules/simpleUI";
import { get } from 'https'
import translate = require('google-translate-api')
const token = 'NDg4MDUzOTYyODIyMzg1NjY0.Dpy6dg.zIadU7C3smODriIsgD9r3V0AtCM'
const sourcelang = { "afrikaans": "af", "irish": "ga", "albanian": "sq", "italian": "it", "arabic": "ar", "japanese": "ja", "azerbaijani": "az", "kannada": "kn", "basque": "eu", "korean": "ko", "bengali": "bn", "latin": "la", "belarusian": "be", "latvian": "lv", "bulgarian": "bg", "lithuanian": "lt", "catalan": "ca", "macedonian": "mk", "chinese simplified": "zh-CN", "malay": "ms", "chinese traditional": "zh-TW", "maltese": "mt", "croatian": "hr", "norwegian": "no", "czech": "cs", "persian": "fa", "danish": "da", "polish": "pl", "dutch": "nl", "portuguese": "pt", "english": "en", "romanian": "ro", "esperanto": "eo", "russian": "ru", "estonian": "et", "serbian": "sr", "filipino": "tl", "slovak": "sk", "finnish": "fi", "slovenian": "sl", "french": "fr", "spanish": "es", "galician": "gl", "swahili": "sw", "georgian": "ka", "swedish": "sv", "german": "de", "tamil": "ta", "greek": "el", "telugu": "te", "gujarati": "gu", "thai": "th", "haitian creole": "ht", "turkish": "tr", "hebrew": "iw", "ukrainian": "uk", "hindi": "hi", "urdu": "ur", "hungarian": "hu", "vietnamese": "vi", "icelandic": "is", "welsh": "cy", "indonesian": "id", "yiddish": "yi" }
const { Client, MessageAttachment } = require('discord.js')
import { readdir } from 'fs'
const readdirAsync = (path, options) => new Promise((s, f) => readdir(path, options, (e, r) => e ? f(e) : s(r)))
const JIMP = require('jimp')
const client = new Client()
client.on('message', (message: Message) => {
  if (message.content === 'sendimg') new JIMP(60, 20, (err, image) => {
    JIMP.loadFont(JIMP.FONT_SANS_8_BLACK).then(async font => {
      image.print(font, 0, 0, 'Hello')
      message.channel.send(new MessageAttachment(await image.getBufferAsync(JIMP.MIME_PNG), 'nodejs.png'))
    })
  })
  if (message.content.startsWith('addchannel')) {
    const name = message.content.split(' ')[1]
    message.guild.roles.create({ data: { name } })
      .then(role => message.guild.channels.create(name, { type: 'category' })
        .then(category => message.guild.channels.create(name, {
          type: 'text', parent: category, overwrites: [
            { id: message.guild.id, deny: ['VIEW_CHANNEL'] },
            { id: role.id, allow: ['VIEW_CHANNEL'] }
          ]
        })))
  }
  else if (message.content.startsWith('delchannel')) {
    const name = message.content.split(' ')[1]
    message.guild.roles.find(role => role.name.toLowerCase() === name.toLowerCase()).delete()
    message.guild.channels.filter(channel => channel.name.toLowerCase() === name.toLowerCase()).forEach(channel => channel.delete())
  } else if (message.content === 'myperms') {
    let desc = ''
    message.guild.channels.forEach(channel => {
      const permissions = channel.permissionsFor(message.member).serialize()
      desc += `${channel.name}:${channel.type}\n${Object.keys(permissions).filter(permission => permissions[permission]).reduce((str, perm) => str + perm + '\n', '')}`
    })
    message.channel.send(desc.slice(0, 2000))
  } else if (message.content.startsWith('translate')) {
    const args = message.content.split(' ')
    const command = args.shift()
    const fromcode = sourcelang[args[args.indexOf('from') + 1]] || 'auto'
    const tocode = sourcelang[args[args.indexOf('to') + 1]] || 'en'
    const collector = message.channel.createMessageCollector(() => true)
    collector.on('collect', message => {
      if (message.content.startsWith(':i') || message.author.bot) return
      get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromcode}&tl=${tocode}&dt=t&q=${message.content}`, res => {
        let body = '';
        res.on('data', d => body += d)
          .on('end', () => console.log(body))
      })
    })
  } else if (message.content.startsWith('transconvo')) {
    const args = message.content.split(' ')
    const command = args.shift()
    const recipient = message.mentions.users.first()
    let fromcode = sourcelang[args[args.indexOf('from') + 1]] || 'auto'
    let tocode = sourcelang[args[args.indexOf('to') + 1]] || 'en'
    const collector = message.channel.createMessageCollector(target => !target.author.bot && [target.author, recipient].includes(target.author))
    collector.on('collect', target => {
      if (target.content === 'transend') return collector.stop()
      translate(target.content, {
        to: target.author === recipient ? fromcode : tocode,
        from: target.author === recipient ? tocode : fromcode
      }).then(response => {
        target.channel.send(response.text)
      }).catch(console.log)
      // get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${target.author === recipient ? tocode : fromcode}&tl=${target.author === recipient ? fromcode : tocode}&dt=t&q=${target.content}`, res => {
      //   let body = ''
      //   res.on('data', d => body += d)
      //      .on('end', () => {
      //        let translated = ''
      //        JSON.parse(body)[0].some(part => {
      //          if (!Array.isArray(part)) return true
      //          translated += part[0]
      //          return false
      //        })
      //        target.channel.send(translated)
      //       })
      // })
    })
  }
})
client.login(token)