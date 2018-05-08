const eventHandler = require('./EventHandler.js');

const a = async ()=>{
  //console.log(await eventHandler.main('U28bae1ada29dcce79109253c7083afd3','Aboutt'));
  console.log(await eventHandler.getChecklist(-1));
};
a();