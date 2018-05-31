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
  let reqId = req.query.userId;
  let userlistStr = '';
  for (let i in userlist){
    let selectStr = '<select name="' + userlist[i].id + '" class="selectpicker" multiple>' +
                  '<option value="">Select the cause </option>' + 
                  '<option value="checklist1">(1) Turn off switch of each power strip</option>' + 
                  '<option value="checklist2">(2) Clear the food and drink on own desk</option>' + 
                  '<option value="checklist3">(3) Labtop/Notebook is locked</option>' + 
                  '<option value="checklist4">(4) Push your chair under table</option>'+
		  '<option value="checklist5">(5) Cabinet is locked</option>'+
                  '</select>';
    userlistStr += '<tr><td>' + userlist[i].name + '</td><td>' + selectStr + '</td></tr>';
  }
  let htmlStr = '<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" ' + 
                'integrity="sha256-3edrmyuQ0w65f8gfBsqowzjJe2iM6n0nKciPUp8y+7E=" crossorigin="anonymous"></script>' + 
                '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" ' + 
                'integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">' +
                '<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" ' +
                'integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>' +
                '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.12.4/css/bootstrap-select.min.css">' +
                '<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.12.4/js/bootstrap-select.min.js"></script>' +
                '<h2>Report Form</h2>' + 
                '<form action="/submit_report" method="post"> ' + 
                '<input type="hidden" name="userId" value="' + reqId + '">' +
                '<table class="table">' + 
                '<tbody>' + 
                userlistStr +
                '</tbody>' + 
                '</table>' + 
                '<input type="submit" value="Submit"></form>';

  res.send(new Buffer(htmlStr));
})
app.post('/submit_report/', async (req, res, next) => {
  let postData = req.body;
  res.set('Content-Type', 'text/html');  
  let reqId = postData.userId;
  delete postData.userId;
  
  await eventHandler.submitCause(reqId,postData)

  let htmlStr = '<h2>Done !</h2>';
  
  res.send(new Buffer(htmlStr));
})

app.listen(process.env.PORT || 80, () => {
  console.log('Example app listening on port 80!')
})
