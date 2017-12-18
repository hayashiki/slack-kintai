import 'dotenv/config'
import http from 'http'
import express from 'express'
import bodyParser from 'body-parser'
import normalizePort from 'normalize-port'
import cloneDeep from 'lodash.clonedeep'
import { createMessageAdapter } from '@slack/interactive-messages';
import { createSlackEventAdapter } from '@slack/events-api';
import paidHoliday from './src/models/paidHoliday'
import User from './src/models/user'
import dateUtil from './src/helpers/dateUtil'
import bot from './src/lib/bot';


const port = normalizePort(process.env.PORT || '3000');
const app = express();
const router = express.Router();

import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URL, {
  useMongoClient: true,
});

// --- Slack Events ---
const slackEvents = createSlackEventAdapter(process.env.SLACK_VERIFICATION_TOKEN);

slackEvents.on('team_join', (event) => {
  // team_joinでteamメンバを無条件にユーザ登録したいケース
});

slackEvents.on('member_joined_channel', event => {
  if (event.channel == process.env.TARGET_CHANNEL_ID) {
    User.schema.methods.find_or_create_by(event.user);
  }
});

// --- Slack Interactive Messages ---
const slackMessages = createMessageAdapter(process.env.SLACK_VERIFICATION_TOKEN);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/slack/actions', slackMessages.expressMiddleware());
app.use('/slack/commands', (req, res) => {
  const { token, text, trigger_id, user_id: userId } = req.body;
  // token check
  if (token === process.env.SLACK_VERIFICATION_TOKEN) {
    console.log('Token valid');
    res.send('');
    bot.startInteractiveMessage(userId);
  } else {
    console.error();('Token invalid');
    res.sendStatus(500);
  }
});

app.use('/slack/events', slackEvents.expressMiddleware());

http.createServer(app).listen(port, () => {
  console.info(`server listening on port ${port}`);
});

// Helper functions

function findAttachment(message, actionCallbackId) {
  return message.attachments.find(a => a.callback_id === actionCallbackId);
}

function acknowledgeActionFromMessage(originalMessage, actionCallbackId, ackText) {
  const message = cloneDeep(originalMessage);
  const attachment = findAttachment(message, actionCallbackId);
  delete attachment.actions;
  attachment.text = `:white_check_mark: ${ackText}`;
  return message;
}

async function getSelectList(callbackAction) {
  return {
    text: 'choose the day when you get a paid holiday',
    attachments: [
      {
        color: '#5A352D',
        callback_id: callbackAction,
        text: '',
        actions: [
          {
            name: 'select_type',
            type: 'select',
            options: dateUtil.getDayList(),
          },
        ],
      },
    ],
  };
}

slackMessages.action('order:start', (payload, respond) => {
  const selectedAction = payload.actions[0].value

  switch (selectedAction){
    case 'create':
      getSelectList('order:select_type')
        .then(respond)
        .catch(console.error);
      const message = "choose the day when you get"
      return acknowledgeActionFromMessage(payload.original_message, 'order:start', message);
      break;
    case 'delete':
      // 未実装
      const updatedMessage2 = acknowledgeActionFromMessage(payload.original_message, 'order:start',
                                                          'choose the day when you delete');

      bot.handleCreateAction()
        .then(respond)
        .catch(console.error);
      return updatedMessage2;
      break;
    case 'mystatus':
      const showPaidHoliday = async () => {
        try {
          const res = await paidHoliday.schema.methods.show(payload.user.id);
          const dayList = dateUtil.decorateFormat(res);

          const totalHour = dateUtil.summaryDate(res)
          const totalDay = totalHour / 8

          const message = "```" + "\n" + dayList + "total:" + totalDay + "days\n" + "```"

          bot.postMessage(process.env.TARGET_CHANNEL_NAME, message);
      } catch(e) {
        console.log(e)
        const message = `申請一覧取得に失敗しました！`
        bot.postMessage(process.env.TARGET_CHANNEL_NAME, message)
      }
    };
    showPaidHoliday()
    break;
  }
});

slackMessages.action('order:select_type', (payload, respond) => {
  const selectedDay = payload.actions[0].selected_options[0].value
  const createPaidHoliday = async () => {
    try {
      await paidHoliday.schema.methods.create(payload.user.id, selectedDay)
      const message = `${selectedDay}で申請しました`
      bot.postMessage(process.env.TARGET_CHANNEL_NAME, message)
    } catch(e) {
      // エラー分岐がでればしっかり実装する
      const message = `申請に失敗しました！既に登録していませんか？`
      bot.postMessage(process.env.TARGET_CHANNEL_NAME, message)
    }
  }
  createPaidHoliday()
});
