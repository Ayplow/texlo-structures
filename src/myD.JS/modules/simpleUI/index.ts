import TextChannel from './structures/TextChannel';
import GroupDMChannel from './structures/GroupDMChannel';
import DMChannel from './structures/DMChannel';
import Message from './structures/Message';
import Guild from './structures/Guild';
import { Structures } from 'discord.js';
Structures.extend('TextChannel', () => TextChannel);
Structures.extend('GroupDMChannel', () => GroupDMChannel);
Structures.extend('DMChannel', () => DMChannel);
Structures.extend('Message', () => Message);
Structures.extend('Guild', () => Guild);
export default {
  TextChannel: TextChannel,
  GroupDMChannel: GroupDMChannel,
  DMChannel: DMChannel,
  Message: Message,
  Guild: Guild
};
export {TextChannel, GroupDMChannel, DMChannel, Message, Guild};