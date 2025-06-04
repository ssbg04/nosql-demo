const express = require("express");
const serverless = require("serverless-http");
require("dotenv").config();

const admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is working!");
});

module.exports = app;
module.exports.handler = serverless(app);
