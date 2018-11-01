// Load customised discord.js library containing some handy methods
import { Client } from '..';
// The custom error module. Just copied it from Akairo
import WrapperError from '../util/WrapperError';
// Other  modules we need
import { createLogger, transports, format } from 'winston';
import { EventEmitter } from 'events';
import { resolve as resolvePath, dirname } from 'path';
import { Server } from 'http';
import { writeFileSync } from 'fs';
import { open } from 'sqlite';
import { inspect } from 'util';

type clientWebServer = {
  host: string;
  defaultHandler: (request, response) => void;
} & Server;
type TimerEx = {
  Timer: NodeJS.Timer;
  iteration: number;
  on(event: 'cycle', listener: (iteration: number) => void);
} & EventEmitter;
/**
 * A class to contain all objects relating to the discord client
 */
export default class ClientWrapper extends EventEmitter {
  private logger = createLogger({
    transports: [
      new (transports.Console)({
        format: format.printf(info => {
          // This is used to generate the padding
          const longestlevelLength = 7;
          const paddedlevel = ' '.repeat(Math.floor((longestlevelLength - info.level.length) / 2)) + info.level.toLocaleUpperCase() + ' '.repeat(Math.ceil((longestlevelLength - info.level.length) / 2));
          return `[${new Date(Date.now()).toLocaleTimeString()}] [${paddedlevel}]: ${info.message}`;
        }),
        // TODO: Find a way to change this at runtime
        level: 'verbose'
      }),
    ]
  })
  public options: object
  public config: object
  public settings: any
  public client: Client
  public Error: WrapperError
  public webServer?: clientWebServer
  /**
   * Creates new ClientWrapper
   * @param {Object} options The settings for this wrapper
   * @param {Boolean} options.webServer Whether the internal webserver should be enabled
   * @param {Object} options.discord Options relating to the discord client
   * @param {Boolean} options.discord.autoStart Whether the discord client should log in during initialisation
   * @param {String} options.discord.comamndsDir Directory to load command files from. Files should be structured as commands
   * @param {String} options.discord.eventsDir Directory to load event files from. Files should export a function to be used as callback
   * @param  {...any} args Argument to pass to the EventEmitter constructor
   */
  public constructor(options: object, ...args: any[]) {
    super();
    this.construct(options);
    return this;
  }
  // --------------------------------------------------------------- //
  // Methods unrelated to the actual wrapper, but useful nonetheless //
  // --------------------------------------------------------------- //
  /**
   * Exit the program and describe what went wrong to an end user. Describes a failure in bot
   * CONFIGURATION, not code
   * @param {String} error The reason the program exited, should describe how to fix the problem
   */
  public userError(error: string) {
    this.logger.info('\n==== EXIT ====\nError: ' + error + '\n==== EXIT ====');
    process.exit(1);
  }
  /**
   * Schedules repeated execution of callback every delay milliseconds.
   * @param {Function} callback The function to call when the timer elapses.
   * @param {Function|number|number[]} delay The number of milliseconds to wait before calling the `callback`.
   * @return {TimerEx} Object containing both the Timer and `iteration` property, which is equal to how many times the callback has been called
   */
  public flexibleInterval(callback: Function, delay: ((iteration?: number) => number) | number | number[]): TimerEx {
    let ReturnTimer = new EventEmitter() as TimerEx;
    let delayFunction;
    if (typeof delay === 'number') delayFunction = () => delay;
    else if (Array.isArray(delay)) delayFunction = (iteration) => delay[iteration % delay.length];
    else delayFunction = delay;
    const iterate = (): void => {
      const iteration = ReturnTimer.iteration + 1;
      callback(iteration);
      clearTimeout(ReturnTimer.Timer);
      ReturnTimer.emit('cycle', iteration);
      ReturnTimer.Timer = setTimeout(iterate, delayFunction(iteration));
      ReturnTimer.iteration = iteration;
    };
    ReturnTimer.Timer = setTimeout(iterate, delayFunction(0));
    ReturnTimer.iteration = 0;
    return ReturnTimer;
  }
  /**
   * The asynchronous part of the constructor. Used for loading files and libraries
   * @param {Object} options The settings for this wrapper
   */
  private async construct(options: object) {
    this.options = this.getOptions(options);
    this.client = new Client(this.options['discord']);
    this.config = await this.getConfig(this.options['configDefaults']);
    await this.handleClient();
    if (this.options['webServer']) await this.startWebServer();
    if (this.options['discord'].autoStart) await this.client.login();
    this.logger.debug(`Client options: ${inspect(this.options, { depth: 3 })}`);
    this.logger.debug(`Client configuration: ${inspect(this.config, { depth: 3 })}`);
    this.emit('ready', this);
  }
  /**
   * Sets up client as property of this wrapper
   * @param {Object} client The client to modify
   * @return {Promise.<Object>} Resolves to the passed client
   */
  private handleClient(): Promise<never> {
    return new Promise((resolve) => {
      this.client['wrapper'] = this;
      this.client.logger = Object.assign((message: string, level: string = 'info') => this.logger.log(level, message), {
        error: (message: string) => this.logger.error(message),
        warn: (message: string) => this.logger.warn(message),
        cmd: (message: string) => this.logger.log('verbose', message),
        debug: (message: string) => this.logger.debug(message),
      });
      this.client.config = this.config['discordClient'];
      this.client.config.colours = this.client.config.colours || this.config['colours'];
      this.client.token = this.client.config.token;
      this.client.loadCommandFolder(this.options['discord'].commandsDir).then(([commands, total]) => {
        this.logger.verbose(`Attempted to load ${total} commands:`);
        Object.keys(commands).forEach((commandName) => commands[commandName][1] instanceof Error ? this.logger.error(`Failed to load ${commands[commandName][0]}:\n${commands[commandName][1].stack}`) : this.logger.verbose(`Success: ${commands[commandName][0]}`));
        this.client.loadEventFolder(this.options['discord'].eventsDir).then(([events, total]) => {
          this.logger.verbose(`Attempted to load ${total} events:`);
          Object.keys(events).forEach((eventName) => events[eventName][1] instanceof Error ? this.logger.error(`Failed to load ${events[eventName][0]}:\n${events[eventName][1].stack}`) : this.logger.verbose(`Success: ${events[eventName][0]}`));
          resolve();
        });
      }).catch((err) => this.logger.error(err.stack));
    });
  }
  /**
   * Starts the internal webserver and engages the default listener function
   * Uses properties in the config of this wrapper to setup
   */
  private startWebServer() {
    const protocol = this.config['webServer'].protocol || 'http';
    const port = this.config['webServer'].port || 80;
    const httpsOptions = {
      key: this.config['webServer'].key || '',
      cert: this.config['webServer'].cert || ''
    };
    if (!['http', 'https'].includes(protocol)) {
      this.userError('Only "http" and "https" protocols supported, edit your configuration file');
    }
    if (!this.config['webServer'].host.includes('.')) {
      this.userError('This client uses the built-in webserver. To use it, a hostname must be set in webServer.host');
    }
    this.webServer = protocol === 'http' ? require(protocol).createServer() : require(protocol).createServer(httpsOptions);
    this.webServer.on('error', (error) => {
      if (error['code'] === 'EACCES') {
        return this.userError(`Could not bind to port ${port}; ${port * (port - 1024) < 0 && process.platform === 'linux' && process.getuid() !== 0 ? 'You are not allowed to bind ports 0-1024 without root permissions.' : 'This is probably because the port is in use.'} Set a different port in configuration`);
      }
      throw error;
    });
    this.webServer.listen(port);
    this.webServer.host = this.config['webServer'].host;
    // A basic handler than allows the 'serv' property to be defined on discord objects (users / channels / guilds) to call that function when requested
    this.webServer.defaultHandler = (request, response) => {
      // Set default response
      let data = 'Recieved';
      // Get arguments from url
      const path = request.url.split('/');
      path.shift();
      if (path[0].length === 18) {
        const snowflake = path.shift();
        const structure = this.client.users.get(snowflake) || this.client.channels.get(snowflake) || this.client.guilds.get(snowflake) || 0;
        // If a function is registered for the snowflake, get the response
        if (structure) {
          data = structure['serv'][path[0]] ? structure['serv'][path[0]]() : data;
        }
      }
      response.end(data);
    };
    this.webServer.on('request', this.webServer.defaultHandler);
  }
  /**
   * Merges passed options with essential options
   * @param {Object} options The options used
   * @return {Object} The merged options object
   */
  private getOptions(options: object = {}): object {
    const Base = {
      discord: {
        eventsDir: './events',
        commandsDir: './commands',
      },
      configFileName: 'config'
    };
    const merge = (Base, In): object => {
      Object.keys(In).forEach((key) => typeof In[key] === 'object' ? merge(Base[key], In[key]) : Base[key] = In[key]);
      return Base;
    };
    return merge(Base, options);
  }
  /**
   * Generates, Merges, and loads a user's configuration
   * @param {Object} props The extra configuration options for this wrapper
   * @return {Promise.<Object>} Resolves to the user's configuration
   */
  private getConfig(props: object = {}): Promise<object> {
    return new Promise((res) => {
      const essentialProps = {
        discordClient: {
          prop: {
            token: '',
            prefix: '!'
          },
          check: (prop) => {
            if (typeof prop.token !== 'string' || prop.token.length !== 59) {
              return '\'token\' must be a valid discord token. You can get your discord bot token at https://discordapp.com/developers/applications/';
            }
            if (typeof prop.prefix !== 'string') {
              return '\'prefix\' must be string';
            }
            return true;
          }
        },
        colours: {
          comment: 'The colours used throughout to bot to denote conditions.\n\
To use hex colors, replace the "#" with "0x" (0xFF0000 for red)',
          prop: {
            success: 0x43B581,
            failure: 0xF04747,
            neutral: 0x7289DA
          },
          check: (prop) => Object.keys(prop).reduce((cur, i) => cur === true ? typeof prop[i] === 'number' ? true : `${i} is not integer` : cur, true)
        }
      };
      if (this.options['webServer']) {
        essentialProps['webServer'] = {
          comment: 'The setup of the built-in webserver. You should set "hostname" to your public ip (or domain)\n\
and "port" to an open port (0-1024 cannot be bound without root on linux)',
          prop: {
            protocol: 'http',
            port: 80,
            host: '',
            key: '',
            cert: ''
          },
          check: (prop) => {
            if (prop.protocol && typeof prop.protocol !== 'string') {
              return '\'protocol\' must be string';
            }
            if (typeof prop.port !== 'number' || prop.port * (prop.port - 65565) > 0) {
              return '\'port\' must be number in range 0-65565';
            }
            if (typeof prop.host !== 'string') {
              return '\'host\' must be string';
            }
            if (prop.key && typeof prop.key !== 'string') {
              return '\'key\' must be string';
            }
            if (prop.cert && typeof prop.cert !== 'string') {
              return '\'cert\' must be string';
            }
            return true;
          }
        };
      }

      Object.keys(props).forEach((key) => essentialProps[key] = props[key]);
      const configFile = resolvePath(dirname(require.main.filename), this.options['configFileName'] + '.js');
      let config;
      try {
        config = require(configFile);
        Object.keys(essentialProps).forEach((key) => {
          if (typeof config[key] === 'undefined') {
            this.logger.info(`Property ${key} does not exist in configuration file at ${configFile}, using default: ${JSON.stringify(essentialProps[key].prop)}`);
            return config[key] = essentialProps[key].prop;
          }
          if (!essentialProps[key].check) {
            return;
          }
          const result = essentialProps[key].check(config[key]);
          if (!result) {
            this.userError(`Property ${key} is malformed, no reason given`);
          }
          if (typeof result === 'string') {
            this.userError(`Property ${key} is malformed: ${result}`);
          }
        });
        res(config);
      } catch (e) {
        if (e.code === 'MODULE_NOT_FOUND') {
          let configPlate = 'module.exports = {\n';
          Object.keys(essentialProps).forEach((key) => {
            const val = essentialProps[key];
            let section = '';
            // If comment exists, comment it out and append it
            if (val.comment) {
              section += '// ' + val.comment.replace(/\n/g, '\n// ') + '\n';
            }
            // Stringify and append the property
            section += `${key}: ` + JSON.stringify(val.prop, null, 2);
            // Indent the property for readability
            section = '  ' + section.replace(/\n/g, '\n  ') + ',\n';
            configPlate += section;
          });
          configPlate += '};\n';
          writeFileSync(configFile, configPlate);
          this.logger.info('A configuration file has been generated. Edit it, and start the bot again');
          process.exit(1);
        } else {
          throw e;
        }
      }
    });
  }
}