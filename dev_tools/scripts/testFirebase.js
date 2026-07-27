const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = `
<!DOCTYPE html>
<html>
<head>
  <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>
</head>
<body>
  <script>
    const firebaseConfig = {
      apiKey: "AIzaSyDOgLVVicOuY7V_ZC4cB6mUIaeL_Jiw5sM",
      authDomain: "notes-on-42da0.firebaseapp.com",
      projectId: "notes-on-42da0",
      storageBucket: "notes-on-42da0.firebasestorage.app",
      messagingSenderId: "632751313368",
      appId: "1:632751313368:web:3ad13c132d1400396b62ad",
      measurementId: "G-7WTMFXZ1NR"
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    
    // Enable debug logging
    firebase.firestore.setLogLevel('debug');

    async function testFirebase() {
      try {
        console.log("Attempting to get mainData...");
        const docRef = db.collection('noteson').doc('mainData');
        const docSnap = await docRef.get();
        console.log("Success! Data exists:", docSnap.exists);
      } catch (e) {
        console.error("Firebase Error:", e.message, e.code);
      }
    }
    
    // Make it available to node
    window.testFirebase = testFirebase;
  </script>
</body>
</html>
`;

const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
dom.window.console.log = console.log;
dom.window.console.error = console.error;
dom.window.console.warn = console.warn;

setTimeout(() => {
  if (dom.window.testFirebase) {
    dom.window.testFirebase().then(() => {
      console.log("Test finished.");
      process.exit(0);
    });
  } else {
    console.error("testFirebase not found");
    process.exit(1);
  }
}, 2000); // wait for scripts to load
