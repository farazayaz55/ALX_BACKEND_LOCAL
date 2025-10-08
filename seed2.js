const Firebase = require('firebase');
var environment = require('./env/firebase.json');


require('firebase/firestore');
require('firebase/auth');

const firebaseConfig = {
    ...environment
}
//local env comment this line on prod
// process.env['FIRESTORE_EMULATOR_HOST'] = 'localhost:8081';

//prod
Firebase.initializeApp(firebaseConfig);


const auth=Firebase.auth()
//comment this line in prod
// auth.useEmulator('http://127.0.0.1:9099')



const db = Firebase.firestore();
// to push in local environment comment for prod
// db.settings({
//     host: "localhost:8081",
//     ssl: false
// })


const seed = async () => {
    try {
        const devices = await db.collection("screenshots").get();
        const promises = devices.docs.map(async (doc) => {
            try {
                await db
                    .collection("screenshots")
                    .doc(doc.id)
                    .set({ reload: true });

                console.log("Device updated:", doc.id);
            } catch (error) {
                console.error(`Failed to update device ${doc.id}:`, error);
            }
        });

        await Promise.all(promises);
        console.log("All devices processed");
    } catch (error) {
        console.error("Error while processing devices:", error);
    }
};

seed();
