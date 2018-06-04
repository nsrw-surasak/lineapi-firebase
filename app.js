'use strict'
const line = require('node-line-bot-api')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const eventHandler = require('./EventHandler.js');

const HEADER_HTML = '<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" ' + 
'integrity="sha256-3edrmyuQ0w65f8gfBsqowzjJe2iM6n0nKciPUp8y+7E=" crossorigin="anonymous"></script>' + 
'<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" ' + 
'integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">' +
'<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" ' +
'integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>' +
'<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.12.4/css/bootstrap-select.min.css">' +
'<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.12.4/js/bootstrap-select.min.js"></script>';
const MAX_DATE = 31;
const GREEN_GLYPHICON = '<span class="glyphicon glyphicon-ok-sign" aria-hidden="true" style="color:green"></span>';
const RED_GLYPHICON = '<span class="glyphicon glyphicon-remove-sign" aria-hidden="true" style="color:red">"</span>';
const BLUE_GLYPHICON =  '<span class="glyphicon glyphicon-tent" aria-hidden="true" style="color:blue"></span>';
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
                  '<option value="checklist4">(4) Put your chair under table</option>'+
		              '<option value="checklist5">(5) Cabinet is locked</option>'+
                  '</select>';
    userlistStr += '<tr><td>' + userlist[i].name + '</td><td>' + selectStr + '</td></tr>';
  }
  let htmlStr = HEADER_HTML +
                '<h2>Report Form</h2>' + 
                '<form action="/submit_report" method="post"> ' + 
                '<input type="hidden" name="userId" value="' + reqId + '">' +
                '<table class="table table-hover">' + 
                '<tbody>' + 
                userlistStr +
                '</tbody>' + 
                '</table>' + 
                '<div style="text-align:center"><input style="text-align:center" type="submit" value="Submit"></div></form>';

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
app.get('/summary/', async (req, res, next) => {
  res.set('Content-Type', 'text/html'); 
  let d = new Date();
  let month = d.getMonth();
  if (req.query.month){
    month = req.query.month;
  } 
	let userlist =  await eventHandler.summary(req.query.month);
  let tableHeader_html = '';
  
  for (let date = 1; date <= MAX_DATE; date++){
    tableHeader_html += '<td>' + date + '</td>';
  }
  let tableContent_html = '';
  for (let id in userlist){
    let name = userlist[id].name;
    tableContent_html += '<tr>';
    tableContent_html += '<td>' + name +'</td>';
    for (let date = 0; date < MAX_DATE; date++){
      let status = userlist[id][date].status;
      let glyphicon = '';
      if (status == 'OK' || status == 'CONFIRM'){
        glyphicon = GREEN_GLYPHICON;
      }else if (status == 'Incomplete'){
        glyphicon = RED_GLYPHICON;
      }
      else if (status == 'LEAVE'){
        glyphicon = BLUE_GLYPHICON;
      }
    
      tableContent_html += '<td>' + glyphicon + '</td>';
    }
    tableContent_html += '</tr>\n';
  }
  let abbr_html = '<h5>' + GREEN_GLYPHICON + ': OK or CONFIRM' + '</h5>' + 
                  '<h5>' + RED_GLYPHICON + ': Defective' + '</h5>' + 
                  '<h5>' + BLUE_GLYPHICON + ': Leave' + '</h5>';
  let htmlStr = HEADER_HTML +
                '<h3> Summary Security Report for Month ' + month + '</h3>' +
                '<table class="table table-hover">\n' + 
                '<thead><tr><td> Name/Date </td>'+ 
                tableHeader_html + 
                '</tr></thead>\n'+
                '<tbody>\n' +
                tableContent_html + 
                '</tbody>\n' +
                '</table>\n' + 
                abbr_html;
              
  res.send(new Buffer(htmlStr));
})
app.get('/confirm_report/', async (req, res, next) => {
  res.set('Content-Type', 'text/html');  
  let d = new Date();
  let month = d.getMonth();
  let year = d.getFullYear();
  if (req.query.month){
    month = req.query.month;
  }
	let checkList =  await eventHandler.comfirmReport(req.query.month);
  
  let tableContent_html = '';
  for (let date in checkList){
    let confirm = checkList[date].confirm || '';
    let morning = checkList[date].morning || '';

    tableContent_html += '<tr>';
    tableContent_html += '<td>' + checkList[date].time +'</td>';
    tableContent_html += '<td>' + confirm +'</td>';
    tableContent_html += '<td>' + morning +'</td>';
    tableContent_html += '</tr>\n';
  }

  let htmlStr = HEADER_HTML +
                '<h3> Summary Security Confirmation Report for Month ' + month + '</h3>' + 
                '<table class="table table-hover">\n' + 
                '<thead><tr><td> Date </td><td> Confirm </td><td> Morning Confirm </td>'+ 
                '</tr></thead>\n'+
                '<tbody>\n' +
                tableContent_html + 
                '</tbody>\n' +
                '</table>\n';
              
  res.send(new Buffer(htmlStr));
})
app.listen(process.env.PORT || 80, () => {
  console.log('Example app listening on port 80!')
})
