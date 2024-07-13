const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: true }));

// Create a simple Hello World endpoint
app.get("/hello", (req, res) => {
  res.send("Hello, World!");
});

// Expose Express API as a single Cloud Function:
exports.api = functions.https.onRequest(app);
