'use strict'
const line = require('node-line-bot-api')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const eventHandler = require('./EventHandler.js');

// need raw buffer for signature validation
app.use(bodyParser.json({
  verify (req, res, buf) {
    req.rawBody = buf
  }
}))

// init with auth
line.init({
  accessToken: process.env.LINE_BOT_CHANNEL_TOKEN,
  // (Optional) for webhook signature validation
  channelSecret: process.env.LINE_BOT_CHANNEL_SECRET
});

app.post('/webhook/', line.validator.validateSignature(), (req, res, next) => {
  await req.body.events.map(async (event) => {
    let replyMsg = await eventHandler.main(event.source.userId,event.message.text);
    // reply message
    await line.client
      .replyMessage({
        replyToken: event.replyToken,
        messages: replyMsg
      });
  });
    
  res.json({success: true});
})

app.listen(process.env.PORT || 80, () => {
  console.log('Example app listening on port 80!')
})