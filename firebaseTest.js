const fbAPI = require('./firebaseAPI.js');


const testAddUserFnc = async ()=>{
  console.log(await fbAPI.addUser('abcde',1, 'trollKuy'));
};
const testAddCheckList = async ()=>{
  let timestamp = new Date();
  console.log(await fbAPI.addCheckList('abcde','Checked', timestamp.getTime()));
};

const testQueryCheckList = async ()=>{
  let start = new Date();
  let end = new Date();
  // Today 
  start.setHours(0,0,0,0);
  end.setHours(23,59,59,999);
  let data = await fbAPI.getCheckListByTime(start.getTime(),end.getTime());
  data.forEach(element => {
    console.log(element.data());
  })
};

//testAddUserFnc();
//testAddCheckList();
testQueryCheckList();