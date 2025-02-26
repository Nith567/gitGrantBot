const jwt = require("jsonwebtoken");
const axios = require("axios");

// Function to generate a JWT (JSON Web Token)
function generateJWT(appId, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now - 60,
    exp: now + 10 * 60,
    iss: appId,
  };

  // Use jsonwebtoken to sign the JWT
  const jwtToken = jwt.sign(payload, privateKey, { algorithm: "RS256" });
  return jwtToken;
}

// Function to get an installation access token
async function getInstallationAccessToken(appId, privateKey, installationId) {
  const jwtToken = generateJWT(appId, privateKey);

  try {
    const response = await axios.post(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {},
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "MyGitHubApp", // Replace with your app name
        },
      },
    );

    return response.data.token;
  } catch (error) {
    console.error(
      "Failed to get access token:",
      error.response?.status,
      error.response?.data,
    );
    throw new Error(
      `Failed to get access token: ${error.response?.status} - ${
        error.response?.data
      }`,
    );
  }
}

// Function to add a comment to a pull request using the GitHub API
async function addCommentToPullRequest(
  owner,
  repo,
  pull_number,
  commentBody,
  accessToken,
) {
  try {
    const response = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/issues/${pull_number}/comments`,
      { body: commentBody },
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "MyGitHubApp", // Replace with your app name
          "Content-Type": "application/json",
        },
      },
    );

    console.log(
      `Comment added to pull request ${pull_number}: ${response.data.html_url}`,
    );
  } catch (error) {
    console.error(
      "Failed to add comment:",
      error.response?.status,
      error.response?.data,
    );
    throw new Error(
      `Failed to add comment: ${error.response?.status} - ${error.response?.data}`,
    );
  }
}

async function main() {
  try {
    if (
      !APP_ID ||
      !PRIVATE_KEY ||
      !INSTALLATION_ID ||
      !REPOSITORY_OWNER ||
      !REPOSITORY_NAME ||
      !PULL_REQUEST_NUMBER
    ) {
      throw new Error("Missing required environment variables.");
    }

    const accessToken = await getInstallationAccessToken(
      APP_ID,
      PRIVATE_KEY,
      INSTALLATION_ID,
    );

    const comment =
      "Testing , This is an automated comment added by the GitHub App using the REST API!";

    await addCommentToPullRequest(
      REPOSITORY_OWNER,
      REPOSITORY_NAME,
      PULL_REQUEST_NUMBER,
      comment,
      accessToken,
    );
  } catch (error) {
    console.error("Error:", error.message);
    if (error.errors) {
      console.error("Detailed errors:", error.errors);
    }
  }
}
