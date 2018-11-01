import { Client as OldClient, Collection } from 'discord.js';
import { resolve as resolvePath, basename } from 'path';
import { readdir } from 'fs';
import { promisify } from 'util';
const readdirPromise = promisify(readdir);
import { Command } from '../modules/commandHandler';
/**
 * The discord.js Client, extended with a few custom methods
 */
export default class Client extends OldClient {
  public wrapper?: any
  public logger?: ((message: string, level?: string) => any) & {
    error: (message: string) => any;
    warn: (message: string) => any;
    cmd: (message: string) => any;
    debug: (message: string) => any;
  };
  public config: { [key: string]: any }
  public commands: Collection<string, Command> = new Collection();
  public toEmojiString(input: string | number): string | Error {
    if (typeof input === 'number') input = input.toString();
    if (this.config['emojiConvertReference'] && this.config['emojiConvertReference'][input]) return this.config['emojiConvertReference'][input];
    if (input.length > 1) return new Error('Input too long');
    if (parseInt(input)) return [':zero:', ':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', ':eight:', ':nine:'][input];
    if (/[a-z|A-Z]/.test(input)) return input.replace(/[a-z|A-Z]/, (i) => `:regional_indicator_${i.toLowerCase()}:`);
    return input;
  }
  // TODO: Just generally improve the way this all works. You can figure it out
  public loadCommand(file: string): [string, object | Error] {
    const commandName = basename(file, '.js').includes('.') ? basename(file, '.ts') : basename(file, '.js');
    if (commandName.includes('.')) return [basename(file), new Error('File not javascript')];
    let props;
    try {
      props = require(file);
    } catch (e) {
      return [commandName, e];
    }
    if (typeof props === 'function') props = {run:props};
    if (typeof props !== 'object') return [basename(file), new Error('Invalid export')];
    props.help ? props.help.name ? NaN : props.help.name = commandName : props.help = {name:commandName};
    const command = new Command(props);
    let commandChecks = {
      run: (run) => typeof run === 'function',
      init: (init) => !init || typeof init === 'function',
      conf: (conf) => typeof conf === 'object',
      help: (help) => typeof help === 'object',
    };
    if (Object.keys(commandChecks).reduce((bool, key) => bool ? bool : !commandChecks[key](command[key]), false)) {
      return [commandName, new Error('Command is malformed.')];
    }
    if (command.init) command.init(this);
    this.commands.set(command.help.name, command);
    if (command.conf.aliases && command.conf.aliases[0]) command.conf.aliases.forEach((alias) => this.commands.set(alias, command));
    return [commandName, command];
  }
  public async unloadCommand(commandName: string): Promise<string | Error> {
    const command = this.commands.get(commandName);
    if (!command) return new Error('The command `' + commandName + '` doesn\'t seem to exist, nor is it an alias. Try again!');
    if (command['shutdown']) await command['shutdown'](this);
    this.commands.delete(commandName);
    const mod = require.cache[require.resolve(`../commands/${commandName}`)];
    delete require.cache[require.resolve(`../commands/${commandName}.js`)];
    mod.parent.children.some((child, index) => child === mod ? mod.parent.children.splice(index, 1) : false);
    return commandName;
  }
  public loadEvent(file: string): [string, Function | Error] {
    const eventName = basename(file, '.js').includes('.') ? basename(file, '.ts') : basename(file, '.js');
    if (eventName.includes('.')) return [basename(file), new Error('File not javascript')];
    let event;
    try {
      event = require(file);
    } catch (e) {
      return [eventName, e];
    }
    if (typeof event !== 'function') return [eventName, new Error('File does not export a function')];
    const boundEvent = event.bind(this, this);
    // True if function is not arrow
    this.on(eventName, boundEvent);
    return [eventName, boundEvent];
  }
  public loadCommandFolder(folder: string): Promise<[{ [filname: string]: Command }, number]> {
    return new Promise((resolve, reject) => {
      readdirPromise(folder).then((files) => {
        const responses = {};
        files.forEach((file) => responses[file] = this.loadCommand(resolvePath(folder, file)));
        resolve([responses, files.length]);
      }).catch(reject);
    });
  }
  public loadEventFolder(folder: string): Promise<[{ [filname: string]: Function }, number]> {
    return new Promise((resolve, reject) => {
      readdirPromise(folder).then((files) => {
        const responses = {};
        files.forEach((file) => responses[file] = this.loadEvent(resolvePath(folder, file)));
        resolve([responses, files.length]);
      }).catch(reject);
    });
  }
}

declare module 'discord.js' {
  interface Client {
    commands: Collection<string, Command>;
    guildData: Collection<string, { [key: string]: any }>;
    config: { [key: string]: any };
    logger?: {
      error: (message: string) => any;
      warn: (message: string) => any;
      cmd: (message: string) => any;
      debug: (message: string) => any;
    } & ((message: string, level?: string) => any);
    /**
     * Converts a string or number to blocktext. Input must only be one character
     *
     * Uses the client.config.emojiConvertReference (Set in config.js) to convert
     * any characters that exist in that file, and has a fallback for
     * alphabetical and numerical characters
     * @constructor
     * @param {String|Number} input The value to be converted
     * @return {String|Error} A blocktext version of the passed string
     */
    toEmojiString(input: string | number): string | Error;
    /**
     * Loads a command into this client's command collection
     * @param {String} file The path to the file to load as a command
     * @return {Array.<String,Object|Error>} The command object loaded and its name. If command failed to load, the error thrown
     */
    loadCommand(file: string): [string, object | Error];
    /**
     * Unloads command using alias / command name.
     * @constructor
     * @param {String} commandName The name of the command to unload
     * @return {Promise.<String|Error>} Name of unloaded command - can be used to [client.loadCommand] in the case that an alias was passed
     */
    unloadCommand(commandName: string): Promise<string | Error>;
    /**
     * Loads an event file and binds it to this client
     * @param {String} file The path to the file to load as an event
     * @return {Array.<String,Object|Error>} The loaded event and its name. If event failed to load, the error thrown
     */
    loadEvent(file: string): [string, Function | Error];
    /**
     * Loads a folder of commands.
     * @param {String} folder The folder to scan for command files
     * @return {Promise.<[{ [filename: string]: Command }, number]>} The command objects created, keyed by name.
     * The 'total' proerty is the number of commands loaded
     */
    loadCommandFolder(folder: string): Promise<[{ [filename: string]: Command }, number]>;
    /**
     * Loads a folder of events.
     * @param {String} folder The folder to scan for command files
     * @return {Promise.<[{ [filename: string]: Function }, number]>} The command objects created, keyed by name.
     * The 'total' proerty is the number of commands loaded
     */
    loadEventFolder(folder: string): Promise<[{ [filename: string]: Function }, number]>;
    /**
     * "Clean" removes @everyone pings, as well as tokens, and makes code blocks
     * escaped so they're shown more easily. As a bonus it stringifies objects!
     * @constructor
     * @param {String} text The text to clean
     * @return {String} The text, with token removed and mentions broken
     */
    clean(text: string): string;
  }
}