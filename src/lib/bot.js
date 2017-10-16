const { WebClient } = require('@slack/client');
const axios = require('axios');

// Bot
const bot = {
  web: new WebClient(process.env.SLACK_BOT_TOKEN),
  orders: {},

  getUserInfo(userId, callback){
    this.web.users.info(userId, callback);
  },
};

module.exports = bot;
