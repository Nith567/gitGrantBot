const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Counter = require("./models/Counter.js");
const cookieParser = require("cookie-parser");
const { main } = require("./msg.js");
const { submitMergedUser } = require("./contract.js");
const multer = require("multer");
const fs = require("fs");
const mime = require("mime-types");
const axios = require("axios");
require("dotenv").config();
const app = express();
require("dotenv").config();

const apiKey = "1a119983-8a8a-48ad-96b0-74ba585b313f";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  next();
});

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  }),
);

const mongoUrl = process.env.MONGO_URL;

const connect = async () => {
  try {
    mongoose.connect(mongoUrl, options);
    console.log("Connected to mongoDB!");
  } catch (error) {
    console.log(error);
  }
};

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  autoIndex: false, // Don't build indexes
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
};

app.post("/api/winner", async (req, res) => {
  try {
    const { reponame, issueId, winnerUsername } = req.body;

    const newIssue = new IssueModel({ reponame, issueId, winnerUsername });
    await newIssue.save();

    res.status(201).json({ message: "Winner added successfully", newIssue });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post("/webhook", async (req, res) => {
  const body = req.body;
  if (body.action === "closed" && body.pull_request?.merged === true) {
    const prNumber = body.pull_request.number;
    const issueNumber = body.pull_request.number; // Often the same as PR number
    const mergedByUsername = body.pull_request.merged_by?.login;
    const repoName = body.repository.name;
    const repoFullName = body.repository.full_name;
    const mergedAt = body.pull_request.merged_at;
    const commitSha = body.pull_request.merge_commit_sha;
    const prTitle = body.pull_request.title;
    const prBody = body.pull_request.body;
    const closedAt = body.pull_request.closed_at;
    const headBranch = body.pull_request.head.ref;
    const baseBranch = body.pull_request.base.ref;
    const installationId = body.installation.id;
    let labels = [];
    if (body.pull_request.labels && Array.isArray(body.pull_request.labels)) {
      labels = body.pull_request.labels[0].name;
    }

    console.log("Labels:", labels);

    console.log("------------------- Pull Request Merged -------------------");

    let difficulty;
    if (labels === "easy") {
      difficulty = 0;
    } else if (labels === "medium") {
      difficulty = 1;
    } else if (labels === "hard") {
      difficulty = 2;
    } else {
      throw new Error("Invalid label");
    }

    submitMergedUser(
 `${mergedByUsername}/${repoName}`,
      prNumber.toString(),
      mergedByUsername,
      difficulty,
    );

    main(mergedByUsername, repoName, issueNumber, installationId);
  }

  res.status(200).send("Webhook received");
});

app.listen(3000, () => {
  console.log("hai ", process.env.MONGO_URL);
  connect();
});
