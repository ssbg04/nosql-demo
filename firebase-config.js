const admin = require('firebase-admin');

let db;

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // databaseURL is optional unless you use Realtime Database
    });

    db = admin.firestore();
    console.log('✅ Firebase Admin initialized');

  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    throw new Error('Failed to initialize Firebase Admin SDK');
  }
} else {
  db = admin.firestore();
}

module.exports = db;
