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
        find_or_create_by(currentUser);

        switch (slashAction){
          case 'create':
            createPaidHoliday(currentUser.user.id, kintaiDay, next)
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

find_or_create_by = (user) => {
  if (User.find({ user_id: user.id })) {
    console.log("skip")
  } else {
    console.log("create user")
    const newUser = new User();
    newUser.user_id =  user.id;
    newUser.save();
  }
}

createPaidHoliday = (userId, date, callback) => {
  const newPaidHoliday = new PaidHoliday();
  newPaidHoliday.user_id = userId
  newPaidHoliday.date = date
  newPaidHoliday.hour = 8
  newPaidHoliday.save((err, newPaidHoliday) => {
    if (err) console.log(err);
    const web = new WebClient(process.env.SLACK_BOT_TOKEN)
    web.chat.postMessage("test-bot", 'aaaa', callback);
  });
}


http.createServer(app).listen(port, () => {
  console.log(`server listening on port ${port}`);
});
