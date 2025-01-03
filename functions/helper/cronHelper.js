const tokenHelper = require("./tokenHelper");

/**
 * Checks if the token is near expiration and refreshes it if necessary.
 * Logs the status of the token and handles any errors during the process.
 * @async
 * @returns {Promise<void>} A promise that resolves when the check is complete.
 */
async function checkTokenAndRefresh() {
  console.log("Running initial token expiration check");

  try {
    // Check if the token is near expiration within 12 hours.
    const isNearExpiration = await tokenHelper.isTokenNearExpiration(12);

    if (isNearExpiration) {
      console.log("Token is expiring soon. Fetching a new token...");
      await tokenHelper.fetchAndSaveToken();
      console.log("Token refreshed successfully");
    } else {
      console.log("Token is still valid");
    }
  } catch (error) {
    console.error("Error in token expiration check:", error);
  }
}

module.exports = { checkTokenAndRefresh };
