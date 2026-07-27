// firebaseInit.js
// Using Firebase Compat libraries to maintain file:// protocol compatibility

const firebaseConfig = {
  apiKey: "AIzaSyDOgLVVicOuY7V_ZC4cB6mUIaeL_Jiw5sM",
  authDomain: "notes-on-42da0.firebaseapp.com",
  projectId: "notes-on-42da0",
  storageBucket: "notes-on-42da0.firebasestorage.app",
  messagingSenderId: "632751313368",
  appId: "1:632751313368:web:3ad13c132d1400396b62ad",
  measurementId: "G-7WTMFXZ1NR"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  // Global references for easy access
  window.db = firebase.firestore();
  
  // Force long polling (Bypass WebSocket issues that cause timeouts)
  window.db.settings({ experimentalForceLongPolling: true });
  
  window.storage = firebase.storage();
} else {
  alert("Firebase SDK failed to load. Please check your internet connection or adblocker.");
}
