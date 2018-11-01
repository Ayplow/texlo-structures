/**
 * Currently what amounts to a boilerplate. Should be improved
 */
export default class Command {
  public init: Function
  public run: Function
  public help: {
    name: string;
    description: string;
    usage: string;
  }
  public conf: {
    enabled: boolean;
    guildOnly: boolean;
    aliases: string[];
    permLevel: number;
  }

  /**
   * Create a command object with parameters
   * @param {Object} command The command descriptor object. Typically imported from another file
   */
  public constructor(command: { [key: string]: any }) {
    this.run = () => "No 'run' attribute on command";
    this.init = () => "No 'init' attribute on command";
    this.help = {
      name: 'Unnamed',
      description: 'No description given',
      usage: 'No usage defined'
    };
    this.conf = {
      enabled: true,
      guildOnly: false,
      aliases: [],
      permLevel: 0
    };
    const merge = (Base, In): object => {
      Object.keys(In).forEach((key) => typeof In[key] === 'object' ? merge(Base[key], In[key]) : Base[key] = In[key]);
      return Base;
    };
    merge(this, command);
  }
}