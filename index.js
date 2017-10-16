require('dotenv').config();

const http = require('http');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const normalizePort = require('normalize-port');
const port = normalizePort(process.env.PORT || '3000');
const app = express();
const users = require('./src/users');

const mongoose   = require('mongoose');
const promise = mongoose.connect('mongodb://localhost/slack-kintai', {
  useMongoClient: true,
});

// User model
const User = require('./src/models/user');
const PaidHoliday = require('./src/models/paid_holiday');
const bot = require('./src/lib/bot');

app.use(bodyParser.json());

// Slash Commands
app.post('/slack/commands', (req, res) => {
  const { token, text, trigger_id, user_id } = req.body;
  const resArray = text.split(" ");

// todo params check
  const slashAction = resArray[0]
  const kintaiDay = resArray[1]

  // token check
  if (token === process.env.SLACK_VERIFICATION_TOKEN) {
    console.log('Token valid');
    res.send('');

    async.waterfall([
      next => {
        bot.getUserInfo(user_id, next);
      },
      (currentUser, next) => {
        console.log(currentUser)
        find_or_create_by(currentUser);

        switch (slashAction){
          case 'create':
            // createPaidHoliday()
            break;
          default:
            break;
        }
      },

    ], (err) => {
      return console.error(err)
    });
    return;
  } else {
    console.error();('Token invalid');
    res.sendStatus(500);
  }
});

http.createServer(app).listen(port, () => {
  console.log(`server listening on port ${port}`);
});
