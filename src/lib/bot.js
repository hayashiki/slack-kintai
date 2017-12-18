import { WebClient } from '@slack/client'
import dateUtil from '../helpers/dateUtil'

export class Bot {
  constructor(){
    this.slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
  }

  async startInteractiveMessage(userId) {
    try {
      await this.slackClient.im.open(userId)
      this.slackClient.chat.postMessage(process.env.TARGET_CHANNEL_NAME,
        'I am kintaibot, and I\'m here to help bring you fresh holiday :grin: \n',
        { attachments: [
          {
            color: '#5A352D',
            title: 'when you take a holiday?',
            callback_id: 'order:start',
            actions: [
              {
                  name: 'create',
                  text: 'create',
                  type: 'button',
                  style: 'primary',
                  value: 'create'
              },
              {
                  name: 'delete',
                  text: 'delete',
                  type: 'button',
                  style: 'danger',
                  value: 'delete'
              },
              {
                  name: 'mystatus',
                  text: 'my status',
                  type: 'button',
                  style: 'default',
                  value: 'mystatus'
              },
            ],
          },
        ],
      })
    } catch (e) {
      console.error(e)
    }
  }

  postMessage(channel, message) {
    this.slackClient.chat.postMessage(channel, message, {
    })
  }
}

const bot = new Bot
export default bot
