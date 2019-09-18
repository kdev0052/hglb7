const {
    Stitch,
    RemoteMongoClient,
    AnonymousCredential
  } = require("mongodb-stitch-server-sdk");
  
  
  const save = async function(savedUser, service, category, appData, apiKey, workspace) {
      console.log("SAVING 102");
      const stitchApp = Stitch.initializeDefaultAppClient('hi-im-stitch-app-lzhou');
      const client = stitchApp.getServiceClient(RemoteMongoClient.factory, 'hi-im-stitch-svc');
      const db = client.db('hi-im-database')
      await  stitchApp.auth.loginWithCredential(new AnonymousCredential()).then(async (user) => {
              const collection = db.collection("hi-im-collection");
       console.log("SAVING 103");
      const newItem = {
        "owner_id": user.id, //for auth
        "username": savedUser.userName,
        "email" : savedUser.email,
        "password": savedUser.password,
        "service": service,
        "category":category,
        "app-data": appData ? appData : {},
        "api-key": apiKey ? apiKey : {},
        "created-at": new Date().toJSON(),
        "usage-count": 0,
        "last-check": null,
        "used" : false   ,
        "workspace" : workspace ? workspace : null
      };
      
      await collection.insertOne(newItem)
        .then(result => console.log(`Successfully inserted item with u: ${result.insertedId}`))
        .catch(err => console.error(`Failed to insert item: ${err}`))
         console.log("SAVING END");
      })
  
  }
  
  exports.save = save;
  