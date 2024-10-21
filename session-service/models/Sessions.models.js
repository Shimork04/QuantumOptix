const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    channelId: { type: String, unique: true, required: true },
    initialHeader: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
