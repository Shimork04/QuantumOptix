// this is main js file for session-service microservice

const express = require("express");
const redis = require("redis");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const CircuitBreaker = require("circuit-breaker-js");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid"); // Import uuidv4 for unique session ID generation

const connectDB = require("./config/db.config.js");
const Session = require("./models/Sessions.models.js");

// Redis setup ,for faster chaching
const redisClient = redis.createClient();
redisClient.on("error", (error) => console.error("Redis error: ", error));

// mongodb connection for persistance, calling connect database function
connectDB();

const app = express();
app.use(bodyParser.json());
app.use(cors()); // abhi ke liye, sab jagha se allow kar rahe hai, par baadme sirf particular jagha se hi karenge




// middleware to validate jwt token
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) return res.status(403).json({ error: "No token provided" });

  jwt.verify(token, "secretKey", (err, decoded) => {
    if (err)
      return res.status(500).json({ error: "Failed to authenticate token" });

    req.userId = decoded.id;

    next();
  });
};




// circuit breaker configuration
const breakerOptions = {
  timeout: 5000, // timeout after 5 seconds
  errorThresholdPercentage: 20, // circuit opens if 20% of request fails
  resetTimeout: 30000, // circuit closes after 30 seconds
};
const breaker = new CircuitBreaker(breakerOptions);




// session creation api endpoint, storing in both redis and mongodb
app.post("/session", verifyToken, async (req, res) => {
  const { initialHeader } = req.body; // because our api call body would be initial header only
  const channelId = uuidv4();

  const sessionData = { channelId, initialHeader, createdAt: Date.now() };

  breaker.runCommand(async (success, failure) => {
    try {
      // step1 - store sessioon path in redis for fast temporary access
      redisClient.setEx(channelId, 3600, JSON.stringify(sessionData), (err) => {
        if (err) {
          failure();
          return res
            .status(500)
            .json({ error: "Failed to cache session (path) in Redis" });
        }

        // step2 - stpre session metadata in mongodb for backup
        const newSession = new Session(sessionData);
        newSession
          .save()
          .then(() => {
            success(); // circuit breaker success
            console.log("Channel Created successfully in MongoDB");
            res.status(201).json({ channelId, message: "Channel created" });
          })
          .catch((error) => {
            failure(); // circuit breaker failure on mongodb
            console.log("Circuit Breaker Failed. Ref: MongoDB");
            res
              .status(500)
              .json({
                error: "Failed to save session metadata to MongoDB",
                details: err.message,
              });
          });
      });
    } catch (error) {
      failure(); // Circuit breaker failure on general error
      res
        .status(500)
        .json({ error: "Unexpected error occurred", details: error.message });
    }
  }, (err) => {
      // Fallback if circuit breaker is open
    res.status(503).json({ error: 'Service temporarily unavailable due to high error rate' });
  });
});




// api endpoint to get/fetch a particular session using channelID,
// first check redis, fallback to mondodb for metadata
app.get("/session/:channelId", verifyToken, async (req, res) => {
    const { channelId } = req.params;

    // Check Redis cache first
  redisClient.get(channelId, (err, reply) => {
    if (err) return res.status(500).json({ error: 'Redis error', details: err.message });

    if (reply) {
      return res.status(200).json(JSON.parse(reply));  // Return session from Redis (path/channel)
    } else {

      // Fallback to MongoDB for metadata if not found in Redis
      Session.findOne({ channelId }).then((session) => {

        if (!session) return res.status(404).json({ error: 'Channel not found' });
        res.status(200).json(session);  // Only returning metadata here

      }).catch((err) => {

        res.status(500).json({ error: 'Failed to retrieve session metadata from MongoDB', details: err.message });
      });
    }
  });
});





// Delete Session (Path) Route (Remove from Redis and MongoDB)
app.delete('/session/:channelId', verifyToken, async (req, res) => {
  const { channelId } = req.params;

  // Delete session (path) from Redis
  redisClient.del(channelId, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to delete channel from Redis' });

    // Also delete session metadata from MongoDB
    Session.deleteOne({ channelId }).then((result) => {
      if (!result.deletedCount) return res.status(404).json({ error: 'Channel not found' });
      res.status(200).json({ message: 'Channel deleted successfully' });
    }).catch((err) => {
      res.status(500).json({ error: 'Failed to delete session metadata from MongoDB', details: err.message });
    });
  });
});





const port = process.env.SESSIONSERVICE_PORT || 4000;
//starting the session - service
app.listen(port, () => {
  console.log(`Session Management Service running sucessfully on port ${port}`);
});
