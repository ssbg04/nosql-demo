const express = require('express');
const cors = require('cors');
const path = require('path');
const serverless = require('serverless-http');

// Load env variables locally
require('dotenv').config();

// --- Firebase Admin SDK Setup ---
const admin = require('firebase-admin');

let db;

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // databaseURL optional unless using Realtime DB
    });

    db = admin.firestore();
    console.log('✅ Firebase initialized');

  } catch (error) {
    console.error('❌ Firebase init error:', error);
    throw new Error('Failed to initialize Firebase Admin SDK');
  }
} else {
  db = admin.firestore();
}

// --- Express App ---
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes

// CREATE
app.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email required' });

    const docRef = await db.collection('users').add({ name, email });
    res.status(201).json({ id: docRef.id, name, email });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ all
app.get('/users', async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ one
app.get('/users/:id', async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'User not found' });

    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
app.put('/users/:id', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email required' });

    await db.collection('users').doc(req.params.id).update({ name, email });
    res.json({ id: req.params.id, name, email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
app.delete('/users/:id', async (req, res) => {
  try {
    await db.collection('users').doc(req.params.id).delete();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static HTML (optional)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Export for Vercel serverless
module.exports = app;
module.exports.handler = serverless(app);
