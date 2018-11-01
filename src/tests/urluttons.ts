import { MessageEmbed, Client, Message, TextChannel } from 'discord.js';
import { createServer } from 'http';
import { request, get } from 'https'
import { parse } from 'url'
import { BigNumber } from 'bignumber.js';
const userCache = {};
import pages = require('./pages.js');
const client = new Client();
client.token = 'NDkyNDE4Mzk3MzkzNjQ5Njg0.DpZ4eA.NfJzvrFbyuxIzhQ9jMhZbBhV5Xo';
client.on('ready', () => console.log('Online'));
const config = {
  client_id: "497128790426779649",
  client_secret: "CGhs-H2tp5hYvxZtryMV50qlL5D9ityK",
  host: "https://dev.tome.ml"
}
import {createHash} from 'crypto'
const a = createHash('sha256').update('myval').digest('hex')

client.on('message', message => {
  if (!message.content.startsWith('.test')) return;
  let args = message.content.split(' ');
  args.shift();
  message.channel.send('_ _ ').then((prompt: Message) => {
    const mURL = `${config.host}/${new BigNumber(prompt.channel.id).toString(32).toLocaleUpperCase()}/${new BigNumber(prompt.id).toString(32).toLocaleUpperCase()}`
    prompt['percent'] = 0
    prompt['percentup'] = setInterval(() => {
      prompt['percent'] += 0.01
      if (prompt['percent']>=1) prompt['percent'] = 0
    }, 400)
    prompt['run'] = (args, user) => {
      if (Number(args[0]) >= 0) prompt['percent'] = Number(args[0]) / 10
      const blocks = Math.floor(prompt['percent'] * 10)
      let bar = '';
      for (let i = 0; i<blocks; i++) bar += `[⣿](${mURL}/${i})`
      bar += `[${["⣀","⣄","⣆","⣇","⣧","⣷",][Math.floor(prompt['percent'] * 100 % 10 * 0.6)]}](${mURL}/${blocks})`
      for (let i = blocks + 1; i<=10; i++) bar += `[⣀](${mURL}/${i})`
      prompt.edit(new MessageEmbed({ 
        thumbnail: {
          url: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/45/Divide_cover.png/220px-Divide_cover.png'
        },
        color: 7506394,
        title: 'Playing in General',
        description: `Song 4 of 12:\n[Shape of you](https://google.com) from [Divide](https://google.com)\n` + bar + `\n\n[ℹ](${mURL}/refresh)`
      }))
    }
    prompt['run']([])
  })
});
function userFromToken(token) {
  return new Promise((resolve, reject) => {
    const url = parse('https://discordapp.com/api/users/@me')
    url['headers'] = { Authorization: `Bearer ${token}` }
    request(url, res => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => JSON.parse(body) ? resolve(JSON.parse(body)) : reject(body))
    }).end()
  })
}
function setupSession(path, flags, response) {
  if (path[0] === "authorized") {
    if (!userCache[flags['state']]) return response.end()
    const thisCache = userCache[flags['state']]
    thisCache.code = flags['code'];
    const url = parse(`https://discordapp.com/api/oauth2/token?scope=identify&grant_type=authorization_code&client_id=${config.client_id}&client_secret=${config.client_secret}&redirect_uri=${config.host}/authorized&code=${thisCache.code}`)
    url['method'] = 'POST'
    url['headers'] = { 'Content-Type': 'application/x-www-form-urlencoded' }
    return request(url, (res) => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', async () => {
        if (JSON.parse(body).access_token) thisCache.token = JSON.parse(body).access_token
        thisCache.user = await userFromToken(thisCache.token)
        response.writeHead(302, {
          'Set-Cookie': `session=${flags['state']}; Max-Age=3600`,
          'Location': thisCache.path.reduce((path, part) => `${path}/${part}`, '')
        })
        response.end()
      })
    }).end();
  }
  const sessionID = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
  userCache[sessionID] = {}
  userCache[sessionID]['path'] = path
  response.writeHead(302, {
    Location: `https://discordapp.com/oauth2/authorize?response_type=code&scope=identify&redirect_uri=${config.host}/authorized&client_id=${config.client_id}&state=${sessionID}`
  });
  return response.end();
}
createServer(async (req, res) => {
  const flags = req.url.indexOf('?') > 0 ? req.url.slice(req.url.indexOf('?') + 1).split('&').reduce((obj, flag) => {
    const parts = flag.trim().split('=');
    obj[parts[0]] = parts[1];
    return obj;
  }, {}) : {};
  const cookies = req.headers.cookie ? (req.headers.cookie as string).split(';').reduce((obj, cookie) => {
    const parts = cookie.trim().split('=');
    obj[parts[0]] = parts[1];
    return obj;
  }, {}) : {};
  const path = (req.url.indexOf('?') > 0 ? req.url.slice(0, req.url.indexOf('?')) : req.url).split('/').slice(1);
  if (path[0] === "favicon.ico") return res.end()
  if (!userCache[cookies['session']] || !userCache[cookies['session']].user) return setupSession(path, flags, res)
  const cache = userCache[cookies['session']]
  const channelId = new BigNumber(path.shift(), 32).toString();
  const messageId = new BigNumber(path.shift(), 32).toString();
  const channel = (client.channels.get(channelId) as TextChannel);
  if (channel) channel.messages.fetch(messageId).then(message => message['run'] ? message['run'](path, cache.user) : NaN);
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(pages.authorized(cache.user));
}).listen(8080);

client.login();