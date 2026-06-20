// Nexabay Firebase Configuration
var FIREBASE_CONFIG = {
  apiKey: "AIzaSyB9ZGu4agOxoC-K3vtGGFyEniLaTOsCahM",
  authDomain: "nexabay-a67c2.firebaseapp.com",
  projectId: "nexabay-a67c2",
  storageBucket: "nexabay-a67c2.firebasestorage.app",
  messagingSenderId: "887106768501",
  appId: "1:887106768501:web:6059894742f677a314323c"
};

// Initialize Firebase
firebase.initializeApp(FIREBASE_CONFIG);

// Services
var db   = firebase.firestore();
var auth = firebase.auth();

console.log('Nexabay Firebase connected!');