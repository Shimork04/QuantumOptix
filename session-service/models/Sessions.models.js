const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  channelId: {
    type: String,
    required: true,
    unique: true
  },
  initialHeader: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
