const fbAPI = require('./firebaseAPI.js');


const MORNING_CMD = 'Morning confirm';
const SELF_CHK_CMD = 'Self-check';
const ZONE_CONFIRM_CMD = 'Zone Confirm';
const LEAVE_CMD = 'Leave';
const NG_CMD = 'Incomplete';
const ABOUT_CMD = 'About';

// Status
const OK = 'OK';
const NG = NG_CMD;
const CONFIRM = 'CONFIRM'
const LEAVE = 'LEAVE';
const MORNING_CHK = 'MORNING_CHECK';

// Confirm 
const CONFIRM_TXT  = 'confirm=';
const YES = 'yes';
const NO = 'no';

const TIMEZONE_OFFSET = 25200;
module.exports ={
  main : async (userId, message) => {
    let return_msg = [{type: 'text', text:'Please Select Command from Menu below'}];
    let d = new Date();
    let timestamp = d.getTime();
    switch (message){
      case (MORNING_CMD):
        await fbAPI.addCheckList(userId,MORNING_CHK, timestamp) 
        return_msg[0].text = 'Welcome';
      break;
      case (SELF_CHK_CMD):
        return_msg[0] = getConfirmCarousel();
      break;
      case (ZONE_CONFIRM_CMD):
        await fbAPI.addCheckList(userId,CONFIRM, timestamp) 
        return_msg[0].text = 'Confirmed';
      break;
      case (LEAVE_CMD):
        await fbAPI.addCheckList(userId,LEAVE, timestamp) 
        return_msg[0].text = 'Enjoy!';
      break; 
      case (NG_CMD):
        return_msg[0] = getCarousel(userId);
      break;
      case (ABOUT_CMD):
        return_msg[0].text = 'SDC-Safety developed by Narut T., and Surasak N.';
      break;
      default:
        let userData = await fbAPI.getUserById(userId);
        if (userData._size > 0){
          return_msg[0].text  = 'No response from your command';
        }
        else{
          let reg = /^[a-z ,.'-]+$/i;
          if (reg.test(message) ){
            await fbAPI.addUser(userId , -1, message)
            return_msg[0].text = 'User ' + message + ' has been registered';
          }else{
            return_msg[0].text = 'Invalid Name';
          }
          
        }
      break;
    }
    return return_msg;
  },
  postback : async (userId, data ) =>{
    let d = new Date();
    let timestamp = d.getTime();
    let return_msg = [{type: 'text', text:''}];
    if (data.indexOf(CONFIRM_TXT) > -1){
      let answer = data.split(CONFIRM_TXT)[1];
      if (answer == YES){
        await fbAPI.addCheckList(userId,OK, timestamp )
        return_msg[0].text = 'Checked';
      }else{
        return_msg[0].text = 'Unchecked';
      }
      
    }

    return return_msg;
  },
  getUserlistByZone : async (zone) => {
    let userlist = [];
    let userData = await fbAPI.getUserByZone(zone);
    userData.forEach(element => {
      userlist.push({name: element.data().name, id: element.data().userId})
    })
    return userlist;
  },
  submitCause : async (userId, cause) => {

    let userData = await fbAPI.updateUserStatus(userId,NG, cause);
    return userData;
  },
  summary : async (month) => {

    let userList_raw = await fbAPI.getUserByZone(-1);

    let start = new Date();
    let end = new Date();

    if (month && month > 0 && month < 12){
      start.setMonth(month - 1);
      end.setMonth(month - 1);
    }

    start.setDate(1);
    start.setHours(0);
    start.setMinutes(0)
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
    end.setHours(0);
    end.setMinutes(0);

    start = new Date(start.getTime() + TIMEZONE_OFFSET);
    end = new Date(end.getTime() + TIMEZONE_OFFSET);
    let checklist_raw = await fbAPI.getCheckListByTime(start.getTime(), end.getTime());

    let userlist = {};
    userList_raw.forEach(element => {
      userlist[element.data().userId] = {name : element.data().name};
      for (let i= 0 ; i < 31; i++){
        userlist[element.data().userId][i] = {status:'',cause : '', time: ''};
      }
    });

    checklist_raw.forEach(element => {
      let d = new Date(element.data().timestamp + TIMEZONE_OFFSET);
      let date = d.getDate() - 1;
      if (userlist[element.data().userId] ){
        userlist[element.data().userId][date]['status'] = element.data().status;
        userlist[element.data().userId][date]['time'] = d.getHours() + ':' + d.getMinutes();
        if (element.data().status == NG){
          let cause = element.data().cause;
          userlist[element.data().userId][date]['status'] = OK;
          for (let culprit in cause){
            userlist[culprit][date]['status'] = NG;
            let causeStr = cause[culprit].toString();
            userlist[culprit][date]['cause'] = causeStr.replace('checklist','');
          }
        }
      }
      
    });
    return userlist;
  },
  comfirmReport : async (month) => {

    let userList_raw = await fbAPI.getUserByZone(-1);

    let start = new Date();
    let end = new Date();

    if (month && month > 0 && month < 12){
      start.setMonth(month - 1);
      end.setMonth(month - 1);
    }

    start.setDate(1);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0)

    start = new Date(start.getTime() + TIMEZONE_OFFSET);
    end = new Date(end.getTime() + TIMEZONE_OFFSET);
    let checklist_raw = await fbAPI.getCheckListByTime(start.getTime(), end.getTime());

    let userlist = {};
    userList_raw.forEach(element => {
      userlist[element.data().userId] = {name : element.data().name};
      
    });

    let checkList = {};

    checklist_raw.forEach(element => {
      let d = new Date(element.data().timestamp + TIMEZONE_OFFSET);
      let date = d.getDate();
      let summittedDate = Object.keys(checkList);
      if (checkList[date] == undefined){
        checkList[date] = {};
      }
      
      checkList[date]['time'] = d.getFullYear() + '-' +  d.getMonth() + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes();
      if ((element.data().status != LEAVE) && (element.data().status != MORNING_CHK) && userlist[element.data().userId]){
        checkList[date]['confirm'] = userlist[element.data().userId].name; 
      }
      if (element.data().status == MORNING_CHK && userlist[element.data().userId] && 
        summittedDate.length > 1){
        let prev_date = summittedDate[summittedDate.length - 2];
        checkList[prev_date]['morning'] = userlist[element.data().userId].name; 
      }
    });
    return checkList;
  }
}
function getCarousel(userId){
  return {
    "type": "template",
    "altText": "Please provide more info",
    "template": {
        "type": "carousel",
        "columns": [
            {
              "text": "Please report culprit",
              "actions": [
                  {
                      "type": "uri",
                      "label": "View detail",
                      "uri": "https://lineapi-firebase.herokuapp.com/checklist?userId=" + userId
                  }
              ]
            }
        ],
    }
  }
}
function getConfirmCarousel(){
  return {
    "type": "template",
    "altText": "Please review checklist",
    "template": {
        "type": "carousel",
        "columns": [
            {
              "text": "1) Turn off switch\n" + 
              "2) Clear food and drink\n"+
              "3) Labtop is locked\n"+
              "4) Put your chair under table\n"+
              "5) Cabinet is locked\n",
              "actions": [
                  {
                      "type": "postback",
                      "label": "Confirm",
                      "data": CONFIRM_TXT + YES
                  },
                  {
                    "type": "postback",
                    "label": "No",
                    "data": CONFIRM_TXT + NO
                  }
              ]
            }
        ],
    }
  }
}
