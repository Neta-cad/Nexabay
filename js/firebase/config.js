// Nexabay Firebase Configuration
var FIREBASE_CONFIG = {
  apiKey: "AIzaSyBCXdYutSWESKrotL15tXSbAeILDYPWmmc",
  authDomain: "nexabay-f4526.firebaseapp.com",
  databaseURL: "https://nexabay-f4526-default-rtdb.firebaseio.com",
  projectId: "nexabay-f4526",
  storageBucket: "nexabay-f4526.firebasestorage.app",
  messagingSenderId: "145498765955",
  appId: "1:145498765955:web:fa7bf2fdb33f4c75ff39b6"
};

// Initialize Firebase
firebase.initializeApp(FIREBASE_CONFIG);

// Services
var db   = firebase.firestore();
var auth = firebase.auth();
var rtdb = firebase.database();

console.log('Nexabay Firebase connected!');