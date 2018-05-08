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

app.use(bodyParser.urlencoded({ extended: true }));
// init with auth
line.init({
  accessToken: process.env.LINE_BOT_CHANNEL_TOKEN,
  // (Optional) for webhook signature validation
  channelSecret: process.env.LINE_BOT_CHANNEL_SECRET
});

app.post('/webhook/', line.validator.validateSignature(), async (req, res, next) => {
	await req.body.events.map(async (event) => {
    if (event.message){
      let replyMsg = await eventHandler.main(event.source.userId,event.message.text);
      // reply message
      await line.client
      .replyMessage({
        replyToken: event.replyToken,
        messages: replyMsg
      });
    }else if (event.postback){
      let replyMsg = await eventHandler.postback(event.source.userId,event.postback.data);
      // reply message
      await line.client
      .replyMessage({
        replyToken: event.replyToken,
        messages: replyMsg
      });
    }
    
  });
    
  res.json({success: true});
})
app.get('/checklist/', async (req, res, next) => {
	let userlist =  await eventHandler.getUserlistByZone(-1);
  res.set('Content-Type', 'text/html');  
  let selectStr = '<select name="cause">' +
                  '<option value="">Select the cause </option>' + 
                  '<option value="volvo">Volvo</option>' + 
                  '<option value="saab">Saab</option>' + 
                  '<option value="mercedes">Mercedes</option>' + 
                  '<option value="audi">Audi</option>'+
                  '</select>';
  let userlistStr = '';
  for (let i in userlist){
    userlistStr += '<div><input type="checkbox" name="culprit" value="' + userlist[i].id + '">' + userlist[i].name + selectStr + '</div>';
  }
  let htmlStr = '<h2>Report Form</h2>' + 
                '<form action="/submit_report" method="post"> ' + 
                userlistStr +
                '<input type="submit" value="Submit"></form> ';

  res.send(new Buffer(htmlStr));
})
app.post('/submit_report/', async (req, res, next) => {
  let causes = req.body.cause;
  let culprits = req.body.culprit;
  res.set('Content-Type', 'text/html');  
  
  if (causes.length > 0){
    let iCulprit = 0;
    for (let i in causes){
      if (causes[i] != ''){
        console.log({cause : causes[i], culprit : culprits[iCulprit]}) 
        iCulprit++;
      }
    }
  }
  let htmlStr = '<h2>Done !</h2>';
  
  res.send(new Buffer(htmlStr));
})

app.listen(process.env.PORT || 80, () => {
  console.log('Example app listening on port 80!')
})