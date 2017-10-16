require('dotenv').config();

const http = require('http');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const normalizePort = require('normalize-port');
const port = normalizePort(process.env.PORT || '3000');
const app = express();
const users = require('./src/users');
const async = require('async');

const mongoose   = require('mongoose');
const promise = mongoose.connect('mongodb://localhost/slack-kintai', {
  useMongoClient: true,
});

const POST_CHANNEL = "test-bot"

// User model
const User = require('./src/models/user');
const PaidHoliday = require('./src/models/paid_holiday');
const bot = require('./src/lib/bot');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Slash Commands
app.post('/slack/commands', (req, res) => {
  const { token, text, trigger_id, user_id } = req.body;
  console.log(req.body);
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
            createPaidHoliday(currentUser.user.id, kintaiDay)
            break;
          case 'show':
            PaidHoliday.find({ user_id: currentUser.user.id },{'_id':0, 'date': 1},
              (err, res) => {
                let kintai_list = "";
                res.map( day => {
                  kintai_list = test + day['date'] + "\n"
                })
                bot.postMessage(POST_CHANNEL, kintai_list);
              }
            )
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
    console.log("find user")
  } else {
    console.log("create user")
    const newUser = new User();
    newUser.user_id =  user.id;
    newUser.save();
  }
}

createPaidHoliday = (userId, date) => {
  const newPaidHoliday = new PaidHoliday();
  newPaidHoliday.user_id = userId
  newPaidHoliday.date = date
  newPaidHoliday.hour = 8
  newPaidHoliday.save();
// todo callback post slack
}


http.createServer(app).listen(port, () => {
  console.log(`server listening on port ${port}`);
});
