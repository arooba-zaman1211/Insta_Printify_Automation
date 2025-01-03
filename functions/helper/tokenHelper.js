const axios = require("axios");
const Token = require("../models/tokens");
const FB_APP_ID = process.env.FB_APP_ID;
const FB_APP_SECRET = process.env.FB_APP_SECRET;

require("dotenv").config();

/**
 * Fetches a new access token from Facebook and saves it to the database.
 * Updates the token and its expiration date in the database.
 * @async
 * @return {Promise<Object>} The new token and its expiration date.
 * @throws {Error} If fetching or saving the token fails.
 */
async function fetchAndSaveToken() {
  try {
    const tokenRecord = await Token.findOne();
    if (!tokenRecord) throw new Error("Previous token not found in database");

    const previousToken = tokenRecord.token;

    const response = await axios.get(
      `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${FB_APP_ID}&client_secret=${FB_APP_SECRET}&fb_exchange_token=${previousToken}`
    );

    const { access_token: accessToken, expires_in: expiresIn } = response.data;

    const expirationDate = new Date(Date.now() + expiresIn * 1000);

    await Token.findOneAndUpdate(
      { _id: tokenRecord._id },
      { token: accessToken, expirationDate },
      { new: true }
    );

    return { token: accessToken, expirationDate };
  } catch (error) {
    console.error("Error fetching token:", error);
    throw error;
  }
}

/**
 * Checks whether the token is near expiration based on a threshold in hours.
 * @async
 * @param {number} [thresholdHours=12] - The number of hours before expiration to consider as "near expiration".
 * @return {Promise<boolean>} True if the token is near expiration or expired, otherwise false.
 */
async function isTokenNearExpiration(thresholdHours = 12) {
  try {
    const tokenRecord = await Token.findOne();

    if (!tokenRecord) return true;

    const expirationDate = new Date(tokenRecord.expirationDate);
    const now = new Date();
    const hoursRemaining = (expirationDate - now) / (1000 * 60 * 60);

    return hoursRemaining < thresholdHours || now >= expirationDate;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    throw error;
  }
}

module.exports = { fetchAndSaveToken, isTokenNearExpiration };
