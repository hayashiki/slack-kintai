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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Slash Commands
app.post('/slack/commands', (req, res) => {
  const { token, text, trigger_id, user_id } = req.body;
  const resArray = text.split(" ");
  const slashAction = resArray[0]
  const kintaiDay = resArray[1]

  // token check
  if (token === process.env.SLACK_VERIFICATION_TOKEN) {
    console.log('Token valid');
    res.send('');

    const fetchUser = new Promise((resolve, reject) => {
      users.find(user_id).then((result) => {
        console.log(`Find user: ${user_id} from slack`);
        resolve(result.data.user);
      }).catch((err) => { reject(err); });
    });

    fetchUser.then((user) => {
      if (User.find({ user_id: user.id })) {
        console.log("skip")
      } else {
        console.log("create user")
        const newUser = new User();
        newUser.user_id =  user.id;
        newUser.save();
      }
    });
  } else {
    console.error();('Token invalid');
    res.sendStatus(500);
  }
});

http.createServer(app).listen(port, () => {
  console.log(`server listening on port ${port}`);
});
