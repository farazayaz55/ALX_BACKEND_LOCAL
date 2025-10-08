// firebase_db.js
const Firebase = require("firebase");
const environment = require("./env/firebase.json");

require("firebase/firestore");

const firebaseConfig = {
  ...environment,
};

// Initialize Firebase only if it hasn't been initialized yet
if (!Firebase.apps.length) {
  Firebase.initializeApp(firebaseConfig);
}

const db = Firebase.firestore();

module.exports = db;
