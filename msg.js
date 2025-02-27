const jwt = require("jsonwebtoken");
const axios = require("axios");

const APP_ID = "1154651";
const PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAoRGRjfGeuD3OpAtVNCXhGh28LLpkTm0ACgFCYD8XneJYtkPd
DP4+gs2NwYKtXN7iMV24iIbtmTsh3l568m6/xgW/iAFVMtp+0oWG5t50ewZmpuiF
zwTRjv8TTs1DsO7c0Uv/1Th7Aj6THc4AJiquFzHml+pkZ/XfKz9sbmAlDMl6f5R6
AlM7+Psi1XvrVzf0p4B/kQYI+MNIk3EaXsd+gbfPU75JdeCg8MFEwKGZQOv4UaRI
0b4PUMEF+TfOX2Eqi0TIdZcX6I0GAkqqfZgbfhDNBVgQKLMp0mi+rNUhY9tElVs+
CQNDOM//w6I4jMBEQ2Z4n+mvtVpFSSRIteekrwIDAQABAoIBAQCGFfgUMJcvTdTe
38hYl0gj06k5mxmx6C/mJFI7iYqBl1K+uRQmoukrPy/Jbp4f+DRZYGokzh6yN3Xk
hsbXV7cyhMqD0Ig6w4Zcf2hkfcB+Qj/mpx/tzVcfMd3C9kJp4w/U9O3PdSuCHNGg
OEQLgfBXwuTyhuB7Y0Yb3LrJ0CRH1YibmiEBXB+pQF8LmjlLtUSze8nncnu5SLSe
bQfeg2E7TH0y0GMMNvY0lwTCtXES7PJDLtqpbbdtdGtfV3+ZfQAP2iykytDgTEUg
zfI5BP99AaAbeHCi/soh3IPLWjTAV4ss3o0hRBlCStZs5cZ4r5kEdX1lImZjFp9D
00Wsa7cBAoGBAMscvRvFWNRlqhiynY/t3xDQy1V77kBPjePZU3mz8DJZE8S20/yP
vC1vwbaO/zLqxm7R1YLGvvXSMSwMigyoXWbquIVz5rrVLvfN0C3/An92/mDYBpcd
i6wwPhoSaW7xBtv+CLlj8nwNr1WYWkzYz1GeNhDattmOCxSzAjhMojxvAoGBAMsC
PjqWvrusR3mzCW2BUm549qln1ZR79FcrpEs+B/nkFpiHXGhC6udF9sZLtoVqkTWZ
5DL8g7B1HMivsbGbQKTB6wiXxyQueU+QJCwS925kB5jVL46EmhRm5BeEYsgC9won
Ib8yEkbtZVZR2a8RQqtl112mn/PUa63ztn3pPbvBAoGAZhzIphGNGxsRbOE/fYCl
SJrv3sYzfXmBaC92XBUuiOFnotoXsT3B6UXqKZGykzKdGFG9+cVZc9R8jByxurNa
YcdXhSBDu2I5/rMmGjm+U77LHHz+szJTafnG/uyKvQ/H1wnb8PhijCOFJo81trS5
ZdsYa1jJ3I4g3AMy9oLwfVkCgYAYgVnPqri1YNNz7le5/z1bFoD37A/ND7Vr/Fml
t4Qw9wZ/PP+7mjBO4JQsVaFfs4B5zuzL9s1StKBX3VV+0fXYrYvYirHAPVfpccXc
CCIUEkEUgs9tzbXnto/cAuAFss3tTNH3CW1JYIi2BcVYK6Y3mGCJ7n4qab7hzaR+
yHPqQQKBgQCx1dTADPj2OwBhkDf8j0vek8tkzLt5ZFHUIFJS1C+Ta1XoQa+uhlY4
0vkF3/DOwKnTQWC8W1Emgv+8IvrFYoBU1bbrwt5lAq0Our5WNsvLbsuECQd9zELE
tUu5kpYi45HSZH1pdPZHfi6LQcI6N4r321zcW9VRw5S9Go39B9Jwsg==
-----END RSA PRIVATE KEY-----`;

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

async function main(username, repoName, issueId, INSTALLATION_ID) {
  try {
    if (
      !APP_ID ||
      !PRIVATE_KEY ||
      !username ||
      !repoName ||
      !issueId ||
      !INSTALLATION_ID
    ) {
      throw new Error("Missing required environment variables.");
    }

    const accessToken = await getInstallationAccessToken(
      APP_ID,
      PRIVATE_KEY,
      INSTALLATION_ID,
    );

    const comment = `Testing ,Claim rewards through reclaimProtocol! https://claim-demo/${repoId}/${issueId}`;

    await addCommentToPullRequest(
      username,
      repoName,
      issueId,
      comment,
      accessToken,
    );
    //
  } catch (error) {
    console.error("Error:", error.message);
    if (error.errors) {
      console.error("Detailed errors:", error.errors);
    }
  }
}

module.exports = { main };
