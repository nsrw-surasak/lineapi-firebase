const fbAPI = require('./firebaseAPI.js');


const MORNING_CMD = 'Morning confirm';
const SELF_CHK_CMD = 'Self-Check';
const ZONE_CONFIRM_CMD = 'Zone Confirm';
const LEAVE_CMD = 'Leave';
const NG_CMD = 'NG';

// Status
const OK = 'OK';
const NG = 'NG';
const CONFIRM = 'CONFIRM'
const LEAVE = 'LEAVE';
const NG_GUILTY = 'NG_GUITY';
const NG_GUILTY_CAUSE = 'NG_GUILTY_CAUSE';

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
        return_msg[0].text = 'Please select guilty';
        return_msg.push(getCarousel());
      break;
      default:
        let userData = await fbAPI.getUserById(userId);
        if (userData._size > 0){
          return_msg[0].text  = 'Please Select Command from Menu below';
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
  }
}
function getCarousel(){
  return {
    "type": "template",
    "altText": "this is a carousel template",
    "template": {
        "type": "carousel",
        "columns": [
            {
              "title": "this is menu",
              "text": "description",
              "actions": [
                  {
                      "type": "postback",
                      "label": "Buy",
                      "data": "action=buy&itemid=111"
                  },
                  {
                      "type": "postback",
                      "label": "Add to cart",
                      "data": "action=add&itemid=111"
                  },
                  {
                      "type": "uri",
                      "label": "View detail",
                      "uri": "http://example.com/page/111"
                  }
              ]
            },
            {
              "thumbnailImageUrl": "https://example.com/bot/images/item2.jpg",
              "imageBackgroundColor": "#000000",
              "title": "this is menu",
              "text": "description",
              "defaultAction": {
                  "type": "uri",
                  "label": "View detail",
                  "uri": "http://example.com/page/222"
              },
              "actions": [
                  {
                      "type": "postback",
                      "label": "Buy",
                      "data": "action=buy&itemid=222"
                  },
                  {
                      "type": "postback",
                      "label": "Add to cart",
                      "data": "action=add&itemid=222"
                  },
                  {
                      "type": "uri",
                      "label": "View detail",
                      "uri": "http://example.com/page/222"
                  }
              ]
            }
        ],
    }
  }
}