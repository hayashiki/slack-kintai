const { WebClient } = require('@slack/client');
const axios = require('axios');

// Bot
const bot = {
  web: new WebClient(process.env.SLACK_BOT_TOKEN),

  getUserInfo(userId, callback){
    this.web.users.info(userId, callback);
  },

  postMessage(channel, message) {
    this.web.chat.postMessage(channel, message, {
    })
  },
};

module.exports = bot;
