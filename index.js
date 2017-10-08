require('dotenv').config();

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const normalizePort = require('normalize-port');
const port = normalizePort(process.env.PORT || '3000');
const app = express();
const users = require('./src/users');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Slash Commands
app.post('/slack/commands', (req, res) => {
  const { token, text, trigger_id, user_id } = req.body;
  // token check
  if (token === process.env.SLACK_VERIFICATION_TOKEN) {
    console.log('Token valid');
    res.send('');


    const fetchUserProfile = new Promise((resolve, reject) => {
      users.find(user_id).then((result) => {
        console.log(`Find user: ${user_id}`);
        console.log(result);
        resolve(result.data.user.profile);
      }).catch((err) => { reject(err); });
    });

  } else {
    console.error();('Token invalid');
    res.sendStatus(500);
  }
});

http.createServer(app).listen(port, () => {
  console.log(`server listening on port ${port}`);
});
