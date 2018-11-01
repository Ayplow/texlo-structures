import { Client, Message, MessageEmbed } from "discord.js";
import "../myD.JS";
import { get } from "https";
const GOOGLE_TOKEN = "AIzaSyBpGtRWqCGgfs7B5tgWserJzESFJklqJ4E";
function merge(old, add) {
  Object.keys(add).forEach(key => {
    if (old[key] && old[key].constructor === Object.prototype.constructor)
      old[key] = merge(old[key], add[key]);
    else old[key] = add[key];
  });
  return old;
}
const getPlaylistItemsFromPage = (id, pageToken?): Promise<any> =>
  new Promise(resolve => {
    get(
      `https://www.googleapis.com/youtube/v3/playlistItems?maxResults=50&part=snippet&key=${GOOGLE_TOKEN}&playlistId=${id}${
        pageToken ? "&pageToken=" + pageToken : ""
      }`,
      res => {
        let body = "";
        res.on("data", chunk => (body += chunk));
        res.on("end", () => {
          const playlistItems = JSON.parse(body);
          const after = playlistItems.nextPageToken
            ? getPlaylistItemsFromPage(id, playlistItems.nextPageToken)
            : [];
          let videos: any[] = playlistItems.items;
          videos.forEach(
            video =>
              video.snippet.title === "Private video" &&
              video.snippet.description === "This video is private."
                ? (video.kind = "youtube#private")
                : null
          );
          let toDetail = {};
          videos.forEach(
            (video, index) =>
              video.kind === "youtube#playlistItem"
                ? (toDetail[video.snippet.resourceId.videoId] = index)
                : null
          );
          get(
            `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&key=${GOOGLE_TOKEN}&id=${Object.keys(
              toDetail
            ).join(",")}`,
            res => {
              let body = "";
              res.on("data", chunk => (body += chunk));
              res.on("end", () => {
                JSON.parse(body).items.forEach((video, index) =>
                  merge(videos[toDetail[video.id]], video)
                );
                if (Array.isArray(after)) return resolve(videos);
                after.then(afters => resolve(videos.concat(afters)));
              });
            }
          );
        });
      }
    );
  });
const getWholePlaylist = (id): Promise<any> =>
  Promise.all([
    new Promise(resolve =>
      get(
        `https://www.googleapis.com/youtube/v3/playlists?part=snippet&key=${GOOGLE_TOKEN}&id=${id}`,
        res => {
          let body = "";
          res
            .on("data", chunk => (body += chunk))
            .on("end", () => resolve(JSON.parse(body).items[0]));
        }
      )
    ),
    getPlaylistItemsFromPage(id)
  ]).then(([metadata, items]) => {
    items.metadata = metadata;
    return items;
  });
const getPlaylist = (id): Promise<any> =>
  Promise.all([
    new Promise(resolve =>
      get(
        `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&key=${GOOGLE_TOKEN}&id=${id}`,
        res => {
          let body = "";
          res
            .on("data", chunk => (body += chunk))
            .on("end", () => resolve(JSON.parse(body).items[0]));
        }
      )
    ),
    new Promise(resolve => {
      get(
        `https://www.googleapis.com/youtube/v3/playlistItems?maxResults=50&part=snippet&key=${GOOGLE_TOKEN}&playlistId=${id}`,
        res => {
          let body = "";
          res.on("data", chunk => (body += chunk));
          res.on("end", () => {
            const playlistItems = JSON.parse(body);
            let videos: any[] = playlistItems.items;
            videos.forEach(
              video =>
                video.snippet.title === "Private video" &&
                video.snippet.description === "This video is private."
                  ? (video.kind = "youtube#private")
                  : null
            );
            let toDetail = {};
            videos.forEach(
              (video, index) =>
                video.kind === "youtube#playlistItem"
                  ? (toDetail[video.snippet.resourceId.videoId] = index)
                  : null
            );
            get(
              `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&key=${GOOGLE_TOKEN}&id=${Object.keys(
                toDetail
              ).join(",")}`,
              res => {
                let body = "";
                res.on("data", chunk => (body += chunk));
                res.on("end", () => {
                  JSON.parse(body).items.forEach((video, index) =>
                    merge(videos[toDetail[video.id]], video)
                  );
                  resolve([videos, playlistItems.nextPageToken]);
                });
              }
            );
          });
        }
      );
    })
  ]).then(([metadata, [videos, pageToken]]: any) => {
    let items = new Array(metadata.contentDetails.itemCount).fill({
      kind: "youtube#deleted",
      contentDetails: { duration: "0S" }
    });
    videos.forEach(video => (items[video.snippet.position] = video));
    const playlist = {
      items,
      metadata,
      promise: null
    };
    playlist.promise = pageToken
      ? getPlaylistItemsFromPage(id, pageToken).then(videos => {
          videos.forEach(video => (items[video.snippet.position] = video));
          return playlist;
        })
      : Promise.resolve(playlist);
    return playlist;
  });
const parseDuration = duration =>
  duration.match(/\d+[DHMS]/g).reduce((total, part) => {
    const parts = part.split(/([DHMS])/g).slice(0, -1);
    return (
      total + parseInt(parts[0]) * { D: 86400, H: 360, M: 60, S: 1 }[parts[1]]
    );
  }, 0);
const timeTransforms = {
  text: time =>
    [
      { singularsuffix: " Day, ", suffix: " Days, " },
      { singularsuffix: " Hour, ", suffix: " Hours, " },
      { singularsuffix: " minute", suffix: " minutes", shown: true },
      {
        prefix: " and ",
        singularsuffix: " second",
        suffix: " seconds",
        shown: true
      }
    ].reduce(
      (str, part, index) =>
        part.shown !== false && (time[index] || part.shown)
          ? str +
            (part.prefix || "") +
            time[index] +
            (time[index] === 1 && part.singularsuffix
              ? part.singularsuffix
              : part.suffix || "")
          : str,
      ""
    ),
  int: time =>
    [
      { singularsuffix: " Day, ", suffix: " Days, " },
      { suffix: ":", leading: true },
      { suffix: ":", leading: true },
      { leading: true }
    ].reduce(
      (str, part, index) =>
        time[index]
          ? str +
            (part.leading ? ("0" + time[index]).slice(-2) : time[index]) +
            (time[index] === 1 && part.singularsuffix
              ? part.singularsuffix
              : part.suffix || "")
          : str,
      ""
    ),
  simpleint: time =>
    [
      time[0] * 24 + time[1],
      ("00" + time[2]).slice(-2),
      ("00" + time[3]).slice(-2)
    ].join(":")
};
module.exports = async (client: Client, message: Message, args: string[]) => {
  console.time("all");
  console.time("metadata");
  getPlaylist(args[0]).then(playlist => {
    console.timeEnd("metadata");
    Promise.all([
      message.channel.send(
        "Loading items of " + playlist.metadata.snippet.title
      ),
      playlist.promise
    ]).then(([msg]: any) => {
      console.timeEnd("all");
      const videos = playlist.items.filter(
        item =>
          item.kind !== "youtube#deleted" && item.kind !== "youtube#private"
      );
      const seconds = videos.reduce(
        (total, video) =>
          total +
          parseDuration(
            video.contentDetails ? video.contentDetails.duration : "3M"
          ),
        0
      );
      const timestamp = timeTransforms.text([
        Math.floor(seconds / 84600),
        Math.floor((seconds % 84600) / 3600),
        Math.floor((seconds % 3600) / 60),
        Math.floor(seconds % 60)
      ]);
      const fluff = `${
        videos.length
      } videos have been found, totaling ${timestamp} of playtime -\n`;
      let index = 0;
      msg.edit(
        new MessageEmbed({
          title: "Videos",
          description:
            fluff +
            (() => {
              let lines = [];
              let extra = "";
              while (
                videos[index] &&
                lines.reduce((total, line) => total + line.length + 2, 0) +
                  extra.length +
                  fluff.length <=
                  2048
              ) {
                if (extra !== "") lines.push(extra);
                const video = videos[index];
                const url = "http://y2u.be/" + video.id;
                extra = `${index + 1}. [${video.snippet.title}](${url})`;
                index += 1;
              }
              return lines.join("\n");
            })(),
          fields: new Array(3)
            .fill({ name: "-", value: "-" })
            .map((z, fieldNo) => {
              let lines = [];
              let extra = "";
              while (
                videos[index] &&
                lines.reduce((total, line) => total + line.length + 2, 0) +
                  extra.length <=
                  1024
              ) {
                if (extra !== "") lines.push(extra);
                const video = videos[index];
                const url = "http://y2u.be/" + video.id;
                extra = `${index + 1}. [${video.snippet.title}](${url})`;
                index += 1;
              }
              if (videos[index] && fieldNo === 2) {
                const extra = `...and ${videos.length - index} more`;
                while (
                  lines.reduce((total, line) => total + line.length + 2, 0) +
                    extra.length >
                  1024
                )
                  lines.pop();
                lines.push(extra);
              }
              return { name: "-", value: lines.join("\n") };
            })
        })
      );
      // msg.edit(
      //   playlist.metadata.snippet.title +
      //     " has duration " +
      //     timeTransforms[args[1]]([
      //       Math.floor(seconds / 84600),
      //       Math.floor((seconds % 84600) / 3600),
      //       Math.floor((seconds % 3600) / 60),
      //       Math.floor(seconds % 60)
      //     ])
      // );
    });
  });
};
