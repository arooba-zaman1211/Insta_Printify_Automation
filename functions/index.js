const express = require("express");
const dotenv = require("dotenv");
const functions = require("firebase-functions");
const admin = require("firebase-admin");

dotenv.config();

// Initialize Firebase Admin SDK (you'll need this if you're using Firestore or Firebase Authentication)
admin.initializeApp();

const app = express();
const connectDB = require("./config/dbConnection.js");
const cronHelper = require("./helper/cronHelper.js");
const pending = require("./routes/pending_route.js");
const scheduled = require("./routes/scheduling_route.js");
const instaPost = require("./routes/posttoInsta.js");

app.use(express.json());

const RETRY_INTERVAL = 50000;

async function connectWithRetry() {
  while (true) {
    try {
      await connectDB();
      console.log("Connected to MongoDB");
      break;
    } catch (error) {
      console.error(
        "Failed to connect to MongoDB. Retrying in 50 seconds...",
        error
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
    }
  }
}

async function tokenCheckWithRetry() {
  while (true) {
    try {
      await cronHelper.checkTokenAndRefresh();
      console.log("Token check and refresh completed successfully");
      break;
    } catch (error) {
      console.error("Token check failed. Retrying in 10 seconds...", error);
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
    }
  }
}

async function initializeApp() {
  await connectWithRetry();
  await tokenCheckWithRetry();
}

// Routes
app.use("/api", pending);
app.use("/api", scheduled);
app.use("/api", instaPost);

app.get("/", (req, res) => {
  console.log("enter1");
  res.send("API is running!");
});

// Firebase Function that serves your Express app
exports.api = functions.https.onRequest(async (req, res) => {
  await initializeApp();
  app(req, res); // Handles the request
});

// initializeApp().then(() => {
//   app.listen(3000, () => {
//     console.log("Server running on port 5000");
//   });
// });
