const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./firebase-config');
require("dotenv").config();
require("serverless-http");
const admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
	credential;
admin.credential.cert(serviceAccount)
});

const app = express();



app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// CREATE - Add a new user
app.post('/users', async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }
        
        const docRef = await db.collection('users').add({ name, email });
        res.status(201).json({ id: docRef.id, name, email });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// READ - Get all users
app.get('/users', async (req, res) => {
    try {
        console.log('Attempting to fetch users from Firestore...');
        const snapshot = await db.collection('users').get();
        
        if (snapshot.empty) {
            console.log('No users found in collection');
            return res.json([]);
        }

        const users = [];
        snapshot.forEach(doc => {
            console.log(`Processing user ${doc.id}`);
            users.push({ id: doc.id, ...doc.data() });
        });
        
        console.log(`Successfully retrieved ${users.length} users`);
        res.json(users);
    } catch(err) {
        console.error('Detailed Firestore error:', {
            message: err.message,
            code: err.code,
            stack: err.stack
        });
        res.status(500).json({ 
            error: 'Failed to get users',
            details: err.message 
        });
    }
});

// READ - Get a single user
app.get('/users/:id', async (req, res) => {
    try {
        const userRef = db.collection('users').doc(req.params.id);
        const doc = await userRef.get();
        
        if (!doc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ id: doc.id, ...doc.data() });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE - Update a user
app.put('/users/:id', async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }
        
        const userRef = db.collection('users').doc(req.params.id);
        await userRef.update({ name, email });
        
        res.json({ id: req.params.id, name, email });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE - Delete a user
app.delete('/users/:id', async (req, res) => {
    try {
        const userRef = db.collection('users').doc(req.params.id);
        await userRef.delete();
        
        res.json({ message: 'User deleted successfully' });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});

module.exports = app;
moudle.exports.handler = serverless(app);
