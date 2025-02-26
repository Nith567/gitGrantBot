const mongoose = require('mongoose');
const {Schema} = mongoose;


const IssueSchema = new Schema({
  reponame: {
    type: String,
    required: true,
  },
  issueId: {
    type: String,
    required: true,
    unique: true,
  },
  winnerUsername: {
    type: String,
    required: true,
  }
});
const IssueModel = mongoose.model('Issue', IssueSchema);

module.exports = {KeyModel, IssueModel};