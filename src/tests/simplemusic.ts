import {
  Client,
  VoiceChannel,
  VoiceBroadcast,
  VoiceConnection,
  StreamOptions,
  StreamDispatcher,
  Guild,
  GuildMember,
  MessageEmbed
} from "discord.js";
import * as ytdl from "ytdl-core";
import { EventEmitter } from "events";
import { Readable } from "stream";
import { google, youtube_v3 } from "googleapis";
import { parse } from "url";
import { createServer } from "http";
import { request } from "https";
import { BigNumber } from "bignumber.js";
import commands from "./simplemusiccommands";
import { TextChannel } from "discord.js";
import pages = require("./pages.js");
import { Node } from "lavalink";
const token = "NDkyNDE4Mzk3MzkzNjQ5Njg0.Dpp7CQ.e8e6ai1RKkq7dyVGfJLJqNOOuWo";
const prefix = ".m";
const googletoken = "AIzaSyBpGtRWqCGgfs7B5tgWserJzESFJklqJ4E";
const youtube = google.youtube("v3");
const userCache = {};
const config = {
  client_id: "497128790426779649",
  client_secret: "CGhs-H2tp5hYvxZtryMV50qlL5D9ityK",
  host: "https://dev.tome.ml"
};
declare module "discord.js" {
  interface Guild {
    voiceHandler: VoiceHandler;
  }
  interface StreamDispatcher {
    voiceHandler: VoiceHandler;
    destroyed: true;
  }
}

type TrackFetchables = {
  /** Keys used to find `title` property. If invalid, it is assumed a fetch needs to be run */
  title?: string[];
  /** Keys used to find `author` property. If invalid, it is assumed a fetch needs to be run */
  author?: string[];
  /** Keys used to find `length` property. If invalid, it is assumed a fetch needs to be run */
  length?: string[];
  /** Keys used to find `youtubeId` property. If invalid, it is assumed a fetch needs to be run */
  youtubeId?: string[];
};
type TrackOptions = {
  /** A return object from the youtube api */
  video?: youtube_v3.Schema$PlaylistItem | youtube_v3.Schema$SearchResult;
  _get?: TrackFetchables;
};
const TrackFetchMethods = {
  ytVideoId: {
    parameters: ["youtubeId"],
    fetch: (track: Track) => {
      return new Promise(resolve => {
        if (
          ["id", "player", "snippet", "contentDetails"].every(part =>
            track.video.hasOwnProperty(part)
          )
        )
          return resolve();
        youtube.videos.list(
          {
            auth: googletoken,
            id: track.youtubeId,
            part: "id, player, snippet, contentDetails"
          },
          (err, response) => {
            if (err) throw err;
            merge(track, {
              video: response.data.items[0],
              _get: {
                title: ["video", "snippet", "title"],
                youtubeId: ["video", "id"],
                author: ["video", "snippet", "channelTitle"]
              }
            });
            resolve();
          }
        );
      });
    }
  }
};
function merge(old, add) {
  Object.keys(add).forEach(key => {
    if (old[key] && old[key].constructor === Object.prototype.constructor)
      old[key] = merge(old[key], add[key]);
    else old[key] = add[key];
  });
  return old;
}
export class Track {
  private _get: TrackFetchables;
  constructor(options: TrackOptions, parent: SubQueue) {
    this.queuePart = parent;
    merge(this, options);
  }
  /** Gets all available data on the track. Generally should be awaited */
  public async fetch() {
    const method = TrackFetchMethods[this.queuePart.fetchMethod];
    await method.fetch(this);
    return this;
  }
  /** A return object from the youtube api */
  public video?:
    | youtube_v3.Schema$PlaylistItem
    | youtube_v3.Schema$SearchResult;
  /** The QueuePart this track is in */
  public queuePart: SubQueue;
  /** The title of the track */
  public get title() {
    return this._get.title
      ? this._get.title.reduce((current, key) => current[key], this)
      : undefined;
  }
  /** The title of the track */
  public get author() {
    return this._get.author
      ? this._get.author.reduce((current, key) => current[key], this)
      : undefined;
  }
  /** The length of the video the youtubeId resembles */
  public get length() {
    return this._get.length
      ? this._get.length.reduce((current, key) => current[key], this)
      : undefined;
  }
  /** The youtubeId for this track */
  public get youtubeId() {
    return this._get.youtubeId
      ? this._get.youtubeId.reduce((current, key) => current[key], this)
      : undefined;
  }
  /** Details on how to fetch more infomation on the track */
}
type GroupType = "track" | "album" | "playlist";
type GroupScope = "youtubeSearch" | "youtubeId";
const QueuePartFetchMethods = {
  ytVideoId: {
    fetch: (queuePart: SubQueue, index) => {
      return new Promise(resolve => {
        const tracks = queuePart
          .slice(Math.max(index - 10, 0))
          .filter(
            track =>
              !["id", "player", "snippet", "contentDetails"].every(part =>
                track.video.hasOwnProperty(part)
              )
          )
          .slice(0, 50);
        if (tracks.length < 50)
          tracks.concat(
            queuePart
              .slice(0, Math.max(index - 10, 0))
              .filter(
                track =>
                  !["id", "player", "snippet", "contentDetails"].every(part =>
                    track.video.hasOwnProperty(part)
                  )
              )
              .slice(0, 50)
          );
        if (tracks.length < 1) return resolve();
        const ids = tracks.map(track => track.youtubeId);
        if (ids.length)
          youtube.videos.list(
            {
              auth: googletoken,
              id: ids.reduce((str, youtubeId) => str + youtubeId + ",", ""),
              part: "id, player, snippet, contentDetails"
            },
            (err, response) => {
              if (err) throw err;
              response.data.items.forEach(video => {
                merge(tracks.find(track => track.youtubeId === video.id), {
                  video: video,
                  _get: {
                    title: ["video", "snippet", "title"],
                    youtubeId: ["video", "id"],
                    author: ["video", "snippet", "channelTitle"]
                  }
                });
              });
              resolve();
            }
          );
      });
    }
  }
};
class SubQueue extends Array<Track> {
  public type: GroupType;
  public requester: GuildMember;
  public scope: GroupScope;
  public metadata: youtube_v3.Schema$Playlist;
  public query: string;
  public fetchMethod: "ytVideoId" | "none";
  private state: "finished" | "partial" | "fetching";
  public constructor(
    query: string,
    requester?: GuildMember,
    callback?: (item?: SubQueue, start?: number, end?: number) => void
  ) {
    super();
    if (/[http|https]:\/\//.test(query)) {
      // Is link
      const URL_SEGMENTS = query.replace(/http:\/\/|https:\/\//, "").split("/");
      const pathEnd = URL_SEGMENTS.pop().split(/(?=[#\?])/);
      const host = URL_SEGMENTS.shift();
      const path = URL_SEGMENTS.concat(pathEnd.shift());
      const parameters = pathEnd
        .filter(str => str.startsWith("?"))
        .reduce((arr, str) => {
          str
            .slice(1)
            .split("&")
            .forEach(str => (arr[str.split("=")[0]] = str.split("=")[1]));
          return arr;
        }, {});
      const anchor = pathEnd.filter(str => str.startsWith("#"))[0]
        ? pathEnd.filter(str => str.startsWith("#"))[0].slice(1)
        : undefined;
      if (host === "www.youtube.com") {
        if (path[0] !== "watch") return;
        const videoId = parameters["v"];
        const playlistId = parameters["list"];
        if (playlistId) {
          this.type = "playlist";
          this.scope = "youtubeId";
          this.state = "fetching";
          this.fetchMethod = "ytVideoId";
          this.query = query;
          this.requester = requester;
          new Promise(async res => {
            this.metadata = await new Promise(res =>
              youtube.playlists.list(
                {
                  part: "snippet",
                  auth: googletoken,
                  id: playlistId
                },
                (err, response) => {
                  res(response.data.items[0]);
                }
              )
            );
            let pageToken = "";
            let items = [];
            while (typeof pageToken === "string") {
              const params = {
                part: "snippet",
                playlistId: parameters["list"],
                auth: googletoken,
                maxResults: 50,
                pageToken: pageToken
              };
              const [err, response] = (await new Promise(res =>
                youtube.playlistItems.list(params, (err, response) =>
                  res([err, response.data])
                )
              )) as [Error, youtube_v3.Schema$PlaylistItemListResponse];
              if (err) return;
              pageToken = response.nextPageToken;
              items = items.concat(response.items);
            }
            res(items);
          }).then((items: Array<youtube_v3.Schema$PlaylistItem>) => {
            this.push(
              ...items.map(
                item =>
                  new Track(
                    {
                      video: item,
                      _get: {
                        title: ["video", "snippet", "title"],
                        youtubeId: [
                          "video",
                          "snippet",
                          "resourceId",
                          "videoId"
                        ],
                        author: ["video", "snippet", "channelTitle"]
                      }
                    },
                    this
                  )
              )
            );
            this.state = "finished";
            if (callback)
              callback(
                this,
                this.findIndex(track => track.youtubeId === videoId)
              );
          });
        } else if (videoId) {
          this.type = "track";
          this.scope = "youtubeId";
          this.state = "fetching";
          this.fetchMethod = "ytVideoId";
          this.requester = requester;
          this.query = query;
          this.push(
            new Track(
              {
                video: {
                  id: videoId
                },
                _get: {
                  youtubeId: ["video", "id"]
                }
              },
              this
            )
          );
          this.state = "finished";
          if (callback) callback(this);
        }
      }
    } else {
      // Treat as search terms
      this.type = "track";
      this.scope = "youtubeSearch";
      this.state = "fetching";
      this.fetchMethod = "ytVideoId";
      this.requester = requester;
      this.query = query;
      youtube.search.list(
        {
          auth: googletoken,
          maxResults: 1,
          part: "snippet",
          type: "video",
          q: query
        },
        (err, response) => {
          this.push(
            new Track(
              {
                video: response.data.items[0],
                _get: {
                  title: ["video", "snippet", "title"],
                  youtubeId: ["video", "id", "videoId"],
                  author: ["video", "snippet", "channelTitle"]
                }
              },
              this
            )
          );
          this.state = "finished";
          if (callback) callback(this);
        }
      );
    }
  }
  public async fetch(item: number | Track = 0) {
    if (item instanceof Track) item = this.indexOf(item);
    if (item < 0 || item > this.length)
      throw new Error("Item not in this QueuePart");
    await QueuePartFetchMethods[this.fetchMethod].fetch(this, item);
    return this;
  }
  static get [Symbol.species]() {
    return Array;
  }
}
export class Queue extends Array<Track> {
  static get [Symbol.species]() {
    return Array;
  }
  constructor(...args) {
    super(...args);
  }
}
type VoiceHandlerOptions = {
  guild: Guild;
  youtubeToken?: string;
};
const autoPlay = true;
export class VoiceHandler extends EventEmitter {
  /** The guild this handler belongs to */
  public guild: Guild;
  public get connection() {
    return this.guild.voiceConnection;
  }
  /** The most recently used voice channel. Used for reconnecting */
  private _channel: VoiceChannel;
  private _dispatcher: StreamDispatcher & { destroyed?: boolean };
  private _youtubeToken: string;
  private _queue = new Queue();
  private _queueIndex = 0;
  stream: Readable;
  get index(): number {
    return this._queueIndex;
  }
  set index(val: number) {
    if (Array.isArray(val)) val = val[0];
    if (typeof val !== "number") return;
    this._queueIndex = Math.max(0, val);
    if (!this.dispatcher || !autoPlay) return;
    if (this.songs[this._queueIndex])
      this.playTrack(this.songs[this._queueIndex]);
    else {
      this.stop();
      this.emit("queueComplete");
    }
  }
  get songs() {
    return this._queue;
  }
  get size() {
    return this._queue.length;
  }
  get currentTrack() {
    return this.songs[this.index];
  }
  public constructor(options: VoiceHandlerOptions) {
    super();
    this.guild = options.guild;
    this._youtubeToken = options.youtubeToken || googletoken;
  }
  set dispatcher(dispatcher: StreamDispatcher) {
    dispatcher.voiceHandler = this;
    this._dispatcher = dispatcher;
    this.emit("newDispatcher", (this._dispatcher = dispatcher));
  }
  get dispatcher() {
    return this._dispatcher;
  }
  public clearQueue() {
    this._queue = new Queue();
  }
  public queue(query: string, member: GuildMember): Promise<Array<Track>> {
    return new Promise(
      res =>
        new SubQueue(query, member, (queuePart, start = 0, end) => {
          end = end || queuePart.length;
          const tracks = queuePart.slice(start, end);
          this._queue = this._queue.concat(tracks);
          res(tracks);
        })
    );
  }
  public stop() {
    if (this.dispatcher) this.dispatcher.destroy();
  }
  public async start() {
    if (!this.dispatcher && this.songs[this._queueIndex])
      await this.playTrack(this.songs[this._queueIndex]);
  }
  public async join(channel: VoiceChannel) {
    if (channel.guild !== this.guild) return;
    this._channel = channel;
    const connection = await channel.join();
    return connection;
  }
  private async playTrack(track) {
    if (!track.youtubeId) await track.queuePart.fetch(track);
    this.emit("playTrack", track);
    if (track.youtubeId)
      this.playStream(
        (this.stream = ytdl(
          "https://www.youtube.com/watch?v=" + track.youtubeId,
          { filter: "audioonly" }
        ))
      );
  }
  private playStream(
    input: string | VoiceBroadcast | Readable,
    channel: VoiceChannel = this._channel,
    options?: StreamOptions
  ): Promise<StreamDispatcher> {
    return new Promise(res =>
      this.join(channel).then(connection => {
        if (this.dispatcher) this.dispatcher.destroyed = true;
        res((this.dispatcher = connection.play(input, options)));
      })
    );
  }
}
const delcommands = true;
const client = new Client();
client.on("ready", () => console.log("Online"));
client.on("message", async message => {
  if (!message.guild) return;
  if (!message.content.startsWith(prefix)) return;
  const args = message.content
    .slice(prefix.length)
    .trim()
    .split(" ");
  const command = args.shift();
  if (commands[command]) commands[command](client, message, args);
  if (delcommands) message.delete();
});
client.login(token);
// const voice = new Node({
//   password: '32908hbweASF]#~}',
//   userID: client.user.id,
//   send(guildId, packet) {
//     if (client.guilds.has(guildId)) return client.ws.send(packet);
//     throw new Error('attempted to send a packet on the wrong shard');
//   }
// })
function setupSession(path, flags, response) {
  if (path[0] === "authorized") {
    const url = parse(
      `https://discordapp.com/api/oauth2/token?scope=identify&grant_type=authorization_code&client_id=${
        config.client_id
      }&client_secret=${config.client_secret}&redirect_uri=${
        config.host
      }/authorized&code=${flags["code"]}`
    );
    url["method"] = "POST";
    url["headers"] = { "Content-Type": "application/x-www-form-urlencoded" };
    return request(url, res => {
      let body = "";
      res.on("data", chunk => (body += chunk));
      res.on("end", async () => {
        if (!JSON.parse(body).access_token) response.end();
        const url = parse("https://discordapp.com/api/users/@me");
        url["headers"] = {
          Authorization: `Bearer ${JSON.parse(body).access_token}`
        };
        request(url, res => {
          let body = "";
          res.on("data", chunk => (body += chunk));
          res.on("end", () => {
            const sessionID =
              Math.random()
                .toString(36)
                .slice(2) +
              Math.random()
                .toString(36)
                .slice(2);
            userCache[sessionID] = client.users.get(JSON.parse(body).id);
            response.writeHead(302, {
              "Set-Cookie": `session=${sessionID}; Max-Age=3600`,
              Location: flags["state"].replace("%2F", "/")
            });
            response.end();
          });
        }).end();
      });
    }).end();
  }
  response.writeHead(302, {
    Location: `https://discordapp.com/oauth2/authorize?response_type=code&scope=identify&redirect_uri=${
      config.host
    }/authorized&client_id=${config.client_id}&state=/${path.join("%2F")}`
  });
  return response.end();
}
createServer(async (req, res) => {
  const flags =
    req.url.indexOf("?") > 0
      ? req.url
          .slice(req.url.indexOf("?") + 1)
          .split("&")
          .reduce((obj, flag) => {
            const parts = flag.trim().split("=");
            obj[parts[0]] = parts[1];
            return obj;
          }, {})
      : {};
  const cookies = req.headers.cookie
    ? (req.headers.cookie as string).split(";").reduce((obj, cookie) => {
        const parts = cookie.trim().split("=");
        obj[parts[0]] = parts[1];
        return obj;
      }, {})
    : {};
  const path = (req.url.indexOf("?") > 0
    ? req.url.slice(0, req.url.indexOf("?"))
    : req.url
  )
    .split("/")
    .slice(1);
  if (path[0] === "favicon.ico") return res.end();
  if (!userCache[cookies["session"]]) return setupSession(path, flags, res);
  const user = userCache[cookies["session"]];
  let Object1;
  const Snowflake1 = new BigNumber(path.shift(), 32).toString();
  let Snowflake2;
  if ((Object1 = client.channels.get(Snowflake1))) {
    if ((Snowflake2 = new BigNumber(path.shift(), 32).toString()))
      (Object1 as TextChannel).messages
        .fetch(Snowflake2)
        .then(message => (message["run"] ? message["run"](path, user) : NaN));
    else if (Object1["run"]) Object1["run"](path, user);
  } else if ((Object1 = client.guilds.get(Snowflake1))) {
    if (Object1["run"]) Object1["run"](path, user);
  }
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(pages.authorized(user));
}).listen(8080);
