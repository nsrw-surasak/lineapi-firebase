var admin = require('firebase-admin');

var serviceAccount = require('./SDCSafety-8103753a3129.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://sdcsafety-21428.firebaseio.com'
});
var db = admin.firestore();
var userProfile = db.collection('user-profile');
var userCheckList = db.collection('user-checklist');
// [START add expense]
module.exports ={
  addUser: async (userId, zone, name, timestamp)=> {
    let postData = {
      userId : userId,
      zone: zone,
      name: name,
    };
    return await userProfile.add(postData);
  },
  getUserById: async (userId)=> {
    const snapshot = await userProfile
      .where('userId', '==', userId)
      .limit(1)
      .get();
    return snapshot;
  },
  getUserByName: async (name)=> {
    const snapshot = await userProfile
      .where('name', '==', name)
      .get();
    return snapshot;
  },
  getUserByZone: async (zone)=> {
    const snapshot = await userProfile
      .where('zone', '==', zone)
      .get();
    return snapshot;
  },
  addCheckList : async (userId, status, timestamp, cause)  => {
    let postData = {
        userId : userId,
        status: status,
        timestamp: timestamp,
      };
    if (cause){
      postData.cause = cause;
    }
    return await userCheckList.add(postData);
  },
  getCheckListByTime : async ( timestart, timeend)  => {
    const snapshot = await userCheckList
      .where('timestamp', '>=', timestart)
      .where('timestamp', '<', timeend)
      .orderBy("timestamp", "asc")
      .get();
    return snapshot;
  },
  getCheckListById : async ( userId)  => {
    const snapshot = await userCheckList
      .where('userId', '==', userId)
      .get();
    return snapshot;
  },
  updateUserStatus : async ( userId, status, cause)  => {
    const snapshot = await userCheckList
      .where('userId', '==', userId)
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    if (!snapshot.empty){
      snapshot.forEach(async element => {
        let update_data = { status: status};
        if (cause){
          update_data.cause = cause;
        }
        return  await userCheckList.doc(element.id).update(update_data);
      })
    }
    else{
      let d = new Date();
      let postData = {
        userId : userId,
        status: status,
        timestamp: d.getTime(),
      };
      if (cause){
        postData.cause = cause;
      }
      return await userCheckList.add(postData);
    }
  }
};
