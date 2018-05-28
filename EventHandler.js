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

module.exports ={
  main : async (userId, message) => {
    let return_msg = [{type: 'text', text:'Please Select Command from Menu below'}];
    switch (message){
      case (MORNING_CMD):
      return_msg[0].text = 'Welcome';
      break;
      case (SELF_CHK_CMD):
        await fbAPI.updateUserStatus(userId,OK, '')
        return_msg[0].text = 'Checked';
      break;
      case (ZONE_CONFIRM_CMD):
        await fbAPI.updateUserStatus(userId,CONFIRM, '') 
        return_msg[0].text = 'Confirmed';
      break;
      case (LEAVE_CMD):
        await fbAPI.updateUserStatus(userId,LEAVE, '') 
        return_msg[0].text = 'Enjoy!';
      break; 
      case (NG_CMD):
        return_msg[0] = getCarousel(userId);
      break;
      case (ABOUT_CMD):
        return_msg[0].text = 'SDC-Safety developed by Narut T., and Surasak N.';
      breake;
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

    let return_msg = [{type: 'text', text:'Postback function was called'}];
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
