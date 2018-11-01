import { Client, Guild, RoleResolvable, GuildMemberStore } from 'discord.js'
const client = new Client();
class MemberList {
  private get dummySections(): GuildMemberStore[] {
    return ['Offline', 'Online'].map(name => Object.defineProperty(new GuildMemberStore(this._guild), 'Section', { value: { name } }))
  }
  constructor(private _guild: Guild) {}
  get(Role: RoleResolvable) {
    if (typeof Role === 'string') Role = this._guild.roles.get(Role)
    if (!Role.hoist) return []
    return Role.members.filter(member => member.user.presence.status !== 'offline').sort((a, b) => a.displayName.toUpperCase() > b.displayName.toUpperCase() ? 1 : -1)
  }
  get wrapped() {
    const filtered = this._guild.roles.filter(role => role.hoist)
    const sorted = filtered.sort((a, b) => a.position - b.position)
    const added = sorted.map(role => {
      const store = new GuildMemberStore(this._guild)
      role.members.forEach(member => { if (member.roles.hoist === role && member.user.presence.status !== 'offline') store.add(member) })
      return Object.defineProperty(store, 'Section', { value: role })
    })
    return this.dummySections.concat(added)
  }
  get full() {
    return this.wrapped.reduce((arr, role) => arr.concat(role), [])
  }
}
client.on('message', message => {
  console.log(new MemberList(message.guild).full)
})
client.login('NDkyNDE4Mzk3MzkzNjQ5Njg0.DrnxAQ.fu9cX2jAcsHXtEA_x3tZYxE0OJA')
