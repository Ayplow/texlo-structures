yarnconst webhookURL = "https://discordapp.com/api/webhooks";
const config = {
  channelID: "501558446177648641",
  token: "TshTorqJHMNAl-zIjKcrPJdEqeucmkaQbgzek7oRDUaKJyVEHfLfn-6Jidsq1UVSWIvS",
  imgurID: "c6aa3a7730b7670"
};
import fetch, { Response } from "node-fetch";
import { get } from "https";
import * as FormData from "form-data";
class ImgurAPI {
  private id: string;
  constructor(options: { id: string }) {
    this.id = options.id;
  }
  private _fetch(path) {
    return fetch(`https://api.imgur.com/3/${path}`, {
      headers: { Authorization: "Client-ID " + this.id }
    });
  }
  private _randomGallery(): Promise<{ type: string; link: string }> {
    return new Promise(res => {
      new Promise(res => get("https://imgur.com/random", res))
        .then(response =>
          this._fetch(
            `gallery/${response["headers"].location.split("/").slice(-1)[0]}`
          )
        )
        .then(res => res.json())
        .then(response => res(response.data));
    });
  }
  public randomGallery(
    filter?: "image"
  ): Promise<{ type: string; link: string }> {
    return new Promise(res =>
      this._randomGallery().then(gallery =>
        res(
          filter && (!gallery.type || !gallery.type.startsWith(filter))
            ? this.randomGallery()
            : gallery
        )
      )
    );
  }
  public randomImage(): Promise<Response> {
    return new Promise(res =>
      this.randomGallery("image").then(gallery => res(fetch(gallery.link)))
    );
  }
}
const form = new FormData();
new ImgurAPI({id: config.imgurID}).randomImage().then(image => {
  const filename = image.url.split("/").slice(-1)[0];
  image.buffer().then(buffer => {
    form.append("file", buffer, { filename });
    form.append(
      "payload_json",
      JSON.stringify({
        username: "Imgur Random",
        avatar_url: "https://s.imgur.com/images/favicon-32x32.png",
        embeds: [
          { color: 0x1bb76e, image: { url: "attachment://" + filename } }
        ]
      })
    );
    fetch(`${webhookURL}/${config.channelID}/${config.token}`, {
      method: "POST",
      body: form
    });
  });
});