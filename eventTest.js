const eventHandler = require('./EventHandler.js');

const a = async ()=>{
  //console.log(await eventHandler.main('U8a4c7cce34ab8630e4e6f480e77a1358','Aboutt'));
  //console.log(await eventHandler.getChecklist(-1));
  console.log(await eventHandler.comfirmReport());
};
a();