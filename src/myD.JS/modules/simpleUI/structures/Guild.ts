import {Guild as OldGuild} from 'discord.js';
import '../../..';
export default class Guild extends OldGuild {
  public getSettings(): object {
    const defaults = this.client.config.defaultSettings || {};
    if (!this.client.guildData.has(this.id)) return defaults;
    const guildData = this.client.guildData.get(this.id).settings;
    const returnObject = {};
    Object.keys(defaults).forEach((key) => returnObject[key] = guildData[key] ? guildData[key] : defaults[key]);
    return returnObject;
  }
}
declare module 'discord.js' {
  interface Guild {
    getSettings(): object;
  }
}