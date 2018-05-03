const fbAPI = require('./firebaseAPI.js');


const MORNING_CMD = 'Morning Confirm';
const SELF_CHK_CMD = 'Self-Check';
const ZONE_CONFIRM_CMD = 'Zone Confirm';
const LEAVE_CMD = 'Leave';

// Status
const OK = 'OK';
const NG = 'NG';
const CONFIRM = 'CONFIRM'
const LEAVE = 'LEAVE';
const NG_GUILTY = 'NG_GUITY';
const NG_GUILTY_CAUSE = 'NG_GUILTY_CAUSE';

module.exports ={
  main : async (userId, message) => {
    let timestamp = new Date();
    let return_msg = [{type: 'text', text:'Please Select Command from Menu below'}];
    switch (message){
      case (MORNING_CMD):

      break;
      case (SELF_CHK_CMD):
        await fbAPI.addCheckList(userId,OK, timestamp.getTime())
        return_msg[0].text = 'Checked';
      break;
      case (ZONE_CONFIRM_CMD):
        await fbAPI.addCheckList(userId,CONFIRM, timestamp.getTime()) 
        return_msg[0].text = 'Confirmed';
      break;
      case (LEAVE_CMD):
        await fbAPI.addCheckList(userId,LEAVE, timestamp.getTime()) 
        return_msg[0].text = 'Enjoy!';
      break; 
      default:
        let userData = await fbAPI.getUserById(userId);
        if (userData._size > 0){
          return_msg[0].text  = 'Please Select Command from Menu below';
        }
        else{
          var reg = /^[a-z]+$/i;
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