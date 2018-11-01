import { Client, MessageEmbed, MessageReaction, Message, TextChannel, User, VoiceConnection } from 'discord.js';
declare module 'discord.js' {
  interface Client {
    config: { [key: string]: any };
  }
}
const client = new Client();
client['config'] = {
  voteChannel: '495709928670101534',
  votingRole: '495693743652077569',
  adminRole: '495693780431929344',
  prefix: '.'
};
client.token = 'NDkyNDE4Mzk3MzkzNjQ5Njg0.DoWIQA.ZkjiCiJiTFUlO7TnKd5gf9eAoqM';
function isAdmin(user: User): Boolean {
  return Boolean((client.channels.get(client.config.voteChannel) as TextChannel).guild.roles.get(client.config.adminRole).members.find(member => member.user === user));
}
function isVoter(user: User): Boolean {
  return Boolean((client.channels.get(client.config.voteChannel) as TextChannel).guild.roles.get(client.config.votingRole).members.find(member => member.user === user));
}
async function collectOn(prompt: Message): Promise<void> {
  prompt['reactives'] = {};
  const collector = prompt.createReactionCollector((reaction, user) => !user.bot && isVoter(user) && ['⬇', '⬆', '❌'].includes(reaction.emoji.name));
  collector.on('collect', async (reaction, user) => {
    if (reaction.emoji.name === '❌' && isAdmin(user)) collector.stop(user.id);
    if (reaction.emoji.name === '⬆' && (prompt['reactives']['⬇'] as MessageReaction).users.has(user.id)) await (prompt['reactives']['⬇'] as MessageReaction).users.remove(user);
    if (reaction.emoji.name === '⬇' && (prompt['reactives']['⬆'] as MessageReaction).users.has(user.id)) await (prompt['reactives']['⬆'] as MessageReaction).users.remove(user);
    const totalVoters = (client.channels.get(client.config.voteChannel) as TextChannel).guild.roles.get(client.config.votingRole).members.size;
    const totalVoted = (prompt['reactives']['⬇'] as MessageReaction).users.filter(u => !u.bot).size + (prompt['reactives']['⬆'] as MessageReaction).users.filter(u => !u.bot).size;
    if (totalVoters <= totalVoted) collector.stop('ALL_VOTED');
  });
  collector.on('end', (collected, reason) => {
    const votedYes = (prompt['reactives']['⬆'] as MessageReaction).users.filter(u => !u.bot);
    const votedNo = (prompt['reactives']['⬇'] as MessageReaction).users.filter(u => !u.bot);
    const embed = new MessageEmbed({
      type: 'rich',
      title: 'Results',
      description: `${votedYes.size} members voted yes and ${votedNo.size} voted no`
    });
    if (reason !== 'ALL_VOTED') {
      if (reason.length !== 18) throw new Error('I guess it can end for some other reason. Add error handling for whatever just happened: ' + reason);
      embed.setFooter(`${client.users.get(reason).username} ended the vote prematurely`);
    }
    prompt.channel.send(embed);
    if (prompt.deletable) prompt.delete();
    return;
  });
  await prompt.react('⬇').then(reaction => prompt['reactives']['⬇'] = reaction).catch(() => prompt['reactives']['⬇'] = prompt.reactions.get('⬇'));
  await prompt.react('⬆').then(reaction => prompt['reactives']['⬆'] = reaction).catch(() => prompt['reactives']['⬆'] = prompt.reactions.get('⬆'));
  await prompt.react('❌').then(reaction => prompt['reactives']['❌'] = reaction).catch(() => prompt['reactives']['❌'] = prompt.reactions.get('❌'));
}
client.on('ready', async () => {
  const voteChannel = client.channels.get(client.config.voteChannel) as TextChannel;
  voteChannel.messages.fetch({ limit: 100 }).then(messages => messages.forEach(msg => msg.embeds[0].title === 'Vote' ? collectOn(msg) : NaN));
});
client.on('message', (message) => {
  if (message.author.bot) return;

  if (message.channel.id === client.config.voteChannel && !isAdmin(message.author)) return message.delete();

  if (message.content.indexOf(client['config'].prefix) !== 0) return;
  const args = message.content.slice(client['config'].prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  if (command === 'vote') {
    // If this isnt vote channel
    if (message.channel.id !== client.config.voteChannel) return;
    const query = args.join(' ');
    message.channel.send(new MessageEmbed({
      title: 'Vote',
      description: query,
      type: 'rich'
    })).then(async (prompt: Message) => {
      collectOn(prompt);
    });
    message.delete();
  }
});
client.login();