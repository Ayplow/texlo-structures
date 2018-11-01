import { DMChannel as OldDMChannel, Message, MessageEmbed, EmojiResolvable, User } from 'discord.js';
export default class DMChannel extends OldDMChannel {
  public coloredEmbed(title: string, description: string, color: number, replace?: Message): Promise<Message> {
    return new Promise((resolve, reject) => {
      if (replace && replace.channel !== this) reject(new Error('Message to replace must be in this channel'));
      const messageEmbed = new MessageEmbed({
        type: 'rich',
        title: title,
        description: description,
        color: color
      });
      (replace ? this.send(messageEmbed) : replace.edit(messageEmbed)).then((message: Message) => resolve(message)).catch(reject);
    });
  }
  public successEmbed = (description: string, replace?: Message): Promise<Message> => this.coloredEmbed('Success', description, this.client.config.colours.success || 0x43B581, replace);
  public errorEmbed = (description: string, replace?: Message): Promise<Message> => this.coloredEmbed('Error', description, this.client.config.colours.error || 0xF04747, replace);
  public infoEmbed = (description: string, replace?: Message): Promise<Message> => this.coloredEmbed(description, '', this.client.config.colours.info || 0x7289DA, replace);
  public multiplePrompt(options: string[], filter?: Function, description?: MessageEmbed | string, timeout: number = 60000): Promise<[string, User] | Error> {
    return new Promise((resolve, reject) => {
      if (options.length == 0) return reject(new Error('No options'));
      if (options.length == 1) return resolve([options[0], new User(this.client, {})]); // This line should never apply, I left it in here for lazy coding. Try to catch only one option in higher code.
      if (options.length > 9) return reject(new Error('Too many options'));
      this.send(['MessageEmbed', 'String'].includes(description.constructor.name) ? description : new MessageEmbed({
        type: 'rich',
        title: 'Multiple Choice',
        description: 'React to this message to choose.\n\n' + options.map(i => this.client.toEmojiString(options.indexOf(i) + 1) + ' ' + i).join('\n')
      })).then(async (prompt: Message) => {
        prompt['reactives'] = [];
        const collector = prompt.createReactionCollector((reaction, user) => !user.bot && reaction.message.reactives.includes(reaction) && (filter ? filter(user, reaction) : true), { max: 1, time: timeout });
        collector.on('collect', (reaction, user) => {
          if (reaction.emoji.name == '❌') reject(new Error('User rejected'));
          resolve([options[parseInt(reaction.emoji.identifier.charAt(0)) - 1], user]);
        });
        collector.on('end', (messages, reason) => {
          if (prompt.deletable) prompt.delete();
          if (reason == 'time') reject(new Error(reason));
        });
        await prompt.react('❌').then(r => r.message['reactives'].push(r)).catch(() => NaN);
        for (let i = 0; i < options.length; i++) await prompt.react((i + 1) + '%E2%83%A3').then(r => r.message['reactives'].push(r)).catch(() => NaN);
      });
    });
  }
  public textPrompt(question: MessageEmbed | string, filter?: Function, timeout: number = 60000): Promise<[string, User] | Error> {
    return new Promise((resolve, reject) => {
      this.send(question).then((prompt: Message) => {
        const collector = this.createMessageCollector(message => !(message.author.bot) && (filter ? filter(message) : true), {
          max: 1,
          time: timeout
        });
        collector.on('collect', response => resolve([response.content, response]));
        collector.on('end', (messages, reason) => {
          if (prompt.deletable) prompt.delete();
          if (reason == 'time') reject(new Error(reason));
        });
      });
    });
  }
  public booleanPrompt(question: MessageEmbed | string, filter?: Function, reacts: [EmojiResolvable, EmojiResolvable] = ['❌', '✅'], timeout: number = 60000): Promise<[boolean, User] | Error> {
    return new Promise((resolve, reject) => {
      this.send(question).then((prompt: Message) => {
        prompt['reactives'] = [];
        const collector = prompt.createReactionCollector((reaction, user) => !(user.bot) && reaction.message.reactives.includes(reaction) && (filter ? filter(user, reaction) : true), {
          max: 1,
          time: timeout
        });
        collector.on('collect', (reaction, user) => resolve([Boolean(reacts.indexOf(reaction.emoji.name)), user]));
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
  public getNickname = (user: User = this.client.user): string => user.username;
}
declare module 'discord.js' {
  interface DMChannel {
    /**
     * Sends an embed with parameters to the this channel.
     * @constructor
     * @param {String} title The title for the Embed
     * @param {String} description The description for the Embed
     * @param {number} color The color for the Embed
     * @param {Message} [replace] If given, will replace this message instead of sending one
     * @returns {Promise<Message>} Resolves to the sent message
     */
    coloredEmbed(title: string, description: string, color: number, replace?: Message): Promise<Message>;
    /**
     * Sends an Embed to the given Channel describing a success - Has title 'Success' and uses discord's Online color
     * @constructor
     * @param {String} description The description for the Embed
     * @param {Message} [replace] If given, will replace this message instead of sending one
     * @returns {Promise<Message>} Resolves to the sent message
     */
    successEmbed(description: string, replace?: Message): Promise<Message>;
    /**
     * Sends an Embed to the given Channel describing an error - Has title 'Error' and uses discord's DND color
     * @constructor
     * @param {String} description The description for the Embed
     * @param {Message} [replace] If given, will replace this message instead of sending one
     * @returns {Promise} Resolves to the sent message
     */
    errorEmbed(description: string, replace?: Message): Promise<Message>;
    /**
     * Sends an Embed to the given Channel with informative contents
     * @constructor
     * @param {String} description The description for the Embed
     * @param {Message} [replace] If given, will replace this message instead of sending one
     * @returns {Promise} Resolves to the sent message
     */
    infoEmbed(description: string, replace?: Message): Promise<Message>;
    /**
     * Prompts user to choose string from array using reactions
     * @constructor
     * @param {String[]} options An array of strings representing the choices for the user
     * @param {Function} [filter] Filter for who is allowed to respond to prompt. Should return true if user is allowed. If not given, anyone can respond
     * @param {(MessageEmbed|String)} [description] Used as message to send to channel, will be given reactions up to the number of strings in [options]. Should explain what each option mean
     * @param {Number} [timeout=60000] How long to wait for a response in milliseconds
     * @returns {Promise<[string, User] | Error>} Array containing choice as string and user that selected it
     */
    multiplePrompt(options: string[], filter?: Function, description?: MessageEmbed | string, timeout?: number): Promise<[string, User] | Error>;
    /**
     * A simple way to grab a single reply, from the user that initiated
     * the command. Useful to get "precisions" on certain things...
     * @constructor
     * @param {MessageEmbed|String} question The question to send to the channel
     * @param {Function} [filter] Filter for who is allowed to respond to prompt. Should return true if user is allowed. If not given, anyone can respond
     * @param {Number} [timeout=60000] How long to wait for a response in milliseconds
     * @returns {Promise<[string, User] | Error>} Array containing response as a string and author
     */
    textPrompt(question: MessageEmbed | string, filter?: Function, timeout?: number): Promise<[string, User] | Error>;
    /**
     * Prompt the user to react yes/no to a question
     * @constructor
     * @param {MessageEmbed|String} question The question to send to the channel
     * @param {Function} [filter] Filter for who is allowed to respond to prompt. Should return true if user is allowed. If not given, anyone can respond
     * @param {[EmojiResolvable, EmojiResolvable]} reacts The emojis used to respond with in order [False, True]
     * @param {number} [timeout=60000] How long the question should stay alive
     * @return {Promise<[boolean, User] | Error>} Resolves to user's answer. If no subject is defined, resolves to array containing response as string and author. If the question times out, it will throw a 'time' error
     */
    booleanPrompt(question: MessageEmbed | string, filter: Function, reacts?: [EmojiResolvable, EmojiResolvable], timeout?: number): Promise<[boolean, User] | Error>;
    /**
     * Gets user's nickname
     * @constructor
     * @param {User} [user=client.user] The user who's name to check
     * @returns {String} The nickname of the user relating to this message
     */
    getNickname(user?: User): string;
  }
}