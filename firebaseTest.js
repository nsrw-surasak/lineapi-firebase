const fbAPI = require('./firebaseAPI.js');


const testAddUserFnc = async ()=>{
  console.log(await fbAPI.addUser('abcde',1, 'trollKuy'));
};
const testAddCheckList = async ()=>{
  let timestamp = new Date();
  console.log(await fbAPI.addCheckList('abcde','Checked', timestamp.getTime()));
};
const testCheckUserExist = async ()=>{
  let timestamp = new Date();
  let userData = await fbAPI.getUserById('abcde');
  if (userData._size > 0){
    console.log('Exist')
  }
  else{
    console.log('Not Exist')
  }
};

const testQueryCheckList = async ()=>{
  let start = new Date();
  let end = new Date();
  // Today 
  start.setDate(start.getDate() - 1); // Yesterday!
  start.setHours(0,0,0,0);
  end.setHours(23,59,59,999);
  let data = await fbAPI.getCheckListByTime(start.getTime(),end.getTime());
  data.forEach(element => {
    console.log(element.id);
    console.log(element.data());
  })
};
const testUpdateStatus = async ()=>{
  console.log(await fbAPI.updateUserStatus('abcde','Self-Checked'));
};
const testUpdateStatusWithCause = async ()=>{
  let cause = {abc: [1,2]};
  console.log(await fbAPI.updateUserStatus('abcde','NG',cause));
};
//testAddUserFnc();
//testAddCheckList();
//testQueryCheckList();
//testUpdateStatus();
// testUpdateStatusWithCause();
testCheckUserExist();