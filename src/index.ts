import {ClientWrapper} from './myD.JS/';
const Wrapper = new ClientWrapper({
  webServer: false,
  discord: {
    autoStart: true,
  }
});

Wrapper.client.on('message', message => message.booleanPrompt)