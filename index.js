const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Counter=require("./models/Counter.js");
const cookieParser = require('cookie-parser');

const multer = require('multer');
const fs = require('fs');
const mime = require('mime-types');
const axios=require('axios');
require('dotenv').config();
const app = express();
require('dotenv').config();

const apiKey = '1a119983-8a8a-48ad-96b0-74ba585b313f';


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});


app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname+'/uploads'));
app.use(cors({
  credentials: true,
  origin: "http://localhost:3000"
}));

const mongoUrl = process.env.MONGO_URL;

const connect = async () => {
  try {
  mongoose.connect(mongoUrl,options)
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
  family: 4 // Use IPv4, skip trying IPv6
}

app.post('/api/winner', async (req, res) => {
  try {
    const { reponame, issueId, winnerUsername } = req.body;

    const newIssue = new IssueModel({ reponame, issueId, winnerUsername });
    await newIssue.save();

    res.status(201).json({ message: 'Winner added successfully', newIssue });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.listen(4000,()=>{
  console.log('hai ',process.env.MONGO_URL)
  connect();
})