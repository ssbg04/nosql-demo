const express = require('express');
const cors = require('cors');
const path = require('path');
const serverless = require('serverless-http');
const db = require('./../firebase-config'); // make sure this works in Vercel

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// CREATE - Add a new user
app.post('/users', async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        const docRef = await db.collection('users').add({ name, email });
        res.status(201).json({ id: docRef.id, name, email });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ - Get all users
app.get('/users', async (req, res) => {
    try {
        const snapshot = await db.collection('users').get();
        const users = [];
        snapshot.forEach(doc => {
            users.push({ id: doc.id, ...doc.data() });
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
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
    } catch (err) {
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
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE - Delete a user
app.delete('/users/:id', async (req, res) => {
    try {
        const userRef = db.collection('users').doc(req.params.id);
        await userRef.delete();

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve index.html (optional — usually not needed in API routes)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Export for Vercel
module.exports = app;
module.exports.handler = serverless(app);
