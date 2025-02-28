const { ethers } = require("ethers");
require("dotenv").config();

// Load environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
    console.error("Missing PRIVATE_KEY in .env file");
    process.exit(1);
}
// Base Sepolia provider (Alchemy)
const provider = new ethers.providers.JsonRpcProvider("https://manta-pacific.drpc.org");

// Contract details
const contractAddress = "0xa80fd684430159D35ce22dC137315353Bb9d9326";
const abi = [
    "function submitMergedUser(string repoId, string issueId, string winnerUsername, uint8 difficulty) external"
];


// Create wallet and contract instance
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(contractAddress, abi, wallet);

async function submitMergedUser(repoId, issueId, winnerUsername,difficulty) {
    try {
        const tx = await contract.submitMergedUser(repoId, issueId, winnerUsername,difficulty);
        console.log("Transaction sent! Hash:", tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);
    } catch (error) {
        console.error("Error calling submitMergedUser:", error);
    }
}
module.exports = {submitMergedUser}

