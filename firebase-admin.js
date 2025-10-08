const admin = require("firebase-admin");
admin.initializeApp({
  apiKey: "AIzaSyAbHiNvnN39J4AjhfRgk0zR9PkuadJV8NE",
  authDomain: "mixcat-signage.firebaseapp.com",
  projectId: "mixcat-signage",
  storageBucket: "mixcat-signage.appspot.com",
  messagingSenderId: "1026252600850",
  appId: "1:1026252600850:web:3df75d69fb5f081f040acb",
  measurementId: "G-8WR6KVZJVM",
  ip:"3.107.158.58",
});

module.exports = admin;
