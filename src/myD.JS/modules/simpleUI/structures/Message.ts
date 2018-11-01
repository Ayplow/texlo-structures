import {Message as OldMessage, MessageEmbed, EmojiResolvable, User} from 'discord.js';
import '../../..';
export default class Message extends OldMessage {
  /**
   * Prompts user to choose string from array using reactions
   * @constructor
   * @param {string[]} options An array of strings representing the choices for the user
   * @param {MessageEmbed | string} [description] Used as message to send to channel, will be given reactions up to the number of strings in [options]. Should explain what each option mean
   * @param {number} [timeout=60000] How long to wait for a response in milliseconds
   * @returns {Promise.<String|Error>} Resolves to the string the user chose
   */
  // public multiplePrompt(options: string[], description: MessageEmbed | string, timeout: number = 60000): Promise<string | Error> {
  //   return new Promise((resolve, reject) => {
  //     if (options.length == 0) return reject(new Error('No options'));
  //     if (options.length == 1) return resolve(options[0]); // This line should never apply, I left it in here for lazy coding. Try to catch only one option in higher code.
  //     if (options.length > 9) return reject(new Error('Too many options'));
  //     this.channel.send(['MessageEmbed', 'String'].includes(description.constructor.name) ? description : new MessageEmbed({
  //       type: 'rich',
  //       title: 'Multiple Choice',
  //       description: 'React to this message to choose.\n\n' + options.map(i => this.client.toEmojiString(options.indexOf(i) + 1) + ' ' + i).join('\n')
  //     })).then(async (prompt: Message) => {
  //       prompt['reactives'] = [];
  //       const collector = prompt.createReactionCollector((reaction, user) => !(user.bot) && reaction.message.reactives.includes(reaction) && this.author == user, {
  //         maxEmojis: 1,
  //         time: timeout
  //       });
  //       collector.on('collect', reaction => {
  //         if (reaction.emoji.name == '❌') reject(new Error('User rejected'));
  //         resolve(options[parseInt(reaction.emoji.identifier.charAt(0)) - 1]);
  //       });
  //       collector.on('end', (messages, reason) => {
  //         if (prompt.deletable) prompt.delete();
  //         if (reason == 'time') reject(new Error(reason));
  //       });
  //       await prompt.react('❌').then(r => r.message['reactives'].push(r)).catch(() => NaN);
  //       for (let i = 0; i < options.length; i++) await prompt.react((i + 1) + '%E2%83%A3').then(r => r.message['reactives'].push(r)).catch(() => NaN);
  //     });
  //   });
  // }
  /**
   * A simple way to grab a single reply, from the user that initiated
   * the command. Useful to get "precisions" on certain things...
   * @constructor
   * @param {MessageEmbed|String} question The question to ask the author
   * @param {Number} [timeout=60000] How long to wait for a response in milliseconds
   * @returns {Promise.<String|Error>} Resolves to user's answer.
   */
  public textPrompt(question: MessageEmbed | string, timeout: number = 60000): Promise<string | Error> {
    return new Promise((resolve, reject) => {
      this.channel.send(question).then((prompt: Message) => {
        const collector = this.channel.createMessageCollector(m => m.author == this.author, {
          max: 1,
          time: timeout
        });
        collector.on('collect', response => resolve(response.content));
        collector.on('end', (messages, reason) => {
          if (prompt.deletable) prompt.delete();
          if (reason == 'time') reject(new Error(reason));
        });
      });
    });
  }
  /**
   * Prompt the user to react yes/no to a question
   * @constructor
   * @param {Embed|String} question The question to send to the channel
   * @param {[EmojiResolvable, EmojiResolvable]} reacts The emojis used to respond with in order [False, True]
   * @param {Number} [timeout=60000] How long the question should stay alive
   * @return {Promise.<Boolean|Error>} Resolves to user's answer.
   */
  public booleanPrompt(question: MessageEmbed | string, reacts: Array<EmojiResolvable> = ['❌', '✅'], timeout: number = 60000): Promise<boolean | Error> {
    return new Promise((resolve, reject) => {
      this.channel.send(question).then((prompt: Message) => {
        prompt['reactives'] = [];
        const collector = prompt.createReactionCollector((reaction, user) => this.author == user && reaction.message.reactives.includes(reaction), {
          max: 1,
          time: timeout
        });
        collector.on('collect', reaction => resolve(Boolean(reacts.findIndex((el: string) => [reaction.emoji.name, reaction.emoji.id].includes(el)))));
        collector.on('end', (messages, reason) => {
          if (prompt.deletable) prompt.delete();
          if (reason == 'time') reject(new Error(reason));
        });
        prompt.react(reacts[1]).then(r => {
          prompt['reactives'].unshift(r);
          prompt.react(reacts[0]).then(r => prompt['reactives'].unshift(r)).catch(() => NaN);
        }).catch(() => NaN);
      });
    });
  }
  /**
   * Gets user's nickname
   * @constructor
   * @param {User} [user=client.user] The user who's name to check
   * @returns {String} The nickname of the user relating to this message
   */
  public getNickname(user: User = this.client.user): string {
    if (!this.guild) return user.username;
    const nickname = this.guild.members.get(user.id).nickname;
    if (nickname) return nickname;
    return user.username;
  }
}
declare module 'discord.js' {
  interface Message {
  /**
   * Prompt the user to react yes/no to a question
   * @constructor
   * @param {Embed|String} question The question to send to the channel
   * @param {[EmojiResolvable, EmojiResolvable]} reacts The emojis used to respond with in order [False, True]
   * @param {Number} [timeout=60000] How long the question should stay alive
   * @return {Promise.<Boolean|Error>} Resolves to user's answer.
   */
  booleanPrompt(question: MessageEmbed | string, reacts: Array<EmojiResolvable>, timeout: number): Promise<boolean | Error>;
  }
}