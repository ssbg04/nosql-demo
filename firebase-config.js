const admin = require('firebase-admin');
require("dotenv").config();
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com" // Add this line
  });
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  process.exit(1); // Exit if Firebase fails to initialize
}

const db = admin.firestore();

// Test connection
db.collection('users').get()
  .then(() => console.log('Firestore connection successful'))
  .catch(err => console.error('Firestore connection error:', err));

module.exports = db;
