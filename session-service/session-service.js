// this is main js file for session-service microservice

const express = require("express");
const connectDB = require("./config/db.config.js");
const Session = require("./models/Sessions.models.js");
const { v4: uuidv4 } = require("uuid");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

app.use(cors()); // abhi ke liye, sab jagha se allow kar rahe hai, par baadme sirf particular jagha se hi karenge

// calling connect database function
connectDB();

// session creation api endpoint
app.post("/session", async (req, res) => {
  try {
    const { initialHeader } = req.body; // because our api call body wuld be initial header only
    const channelId = uuidv4();

    const newSession = new Session({ channelId, initialHeader });
    await newSession.save();

    res.status(201).json({ channelId });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create session", details: error.message });
  }
});

// api endpoint to get/fetch a particular session using channelID
app.get("/session/:channelId", async (req, res) => {
  try {
    const { channelId } = req.params;
    const session = await Session.findOne({ channelId }); // finding channelid in out mongodb

    // case-1 : req successful
    if (session) {
      res.status(200).json(session);
    } else {
      res.status(404).json({ error: "Session not found or deleted" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to retrive session", details: error.message });
  }
});

// api to delete any channelid
app.delete("/session/:channelId", async (req, res) => {
  try {
    const { channelId } = req.params;
    const result = await Session.deleteOne({ channelID });

    if (result.deletedCount > 0) {
      res.status(200).json({ message: "Session deleted successfully" });
    } else {
      res.status(404).json({ error: "Session not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete the session", details: error.message });
  }
});

const port = process.env.SESSIONSERVICE_PORT || 4000;
//starting the session - service 
app.listen( port, () =>{
    console.log(`Session Management Service running sucessfully on port ${port}`)
});