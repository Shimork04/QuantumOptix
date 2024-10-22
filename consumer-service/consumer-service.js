const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const sessionServiceURL = process.env.SESSIONSERVICE_URL;


// Middleware to verify JWT tokens
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ error: "Token required" });

  jwt.verify(token, "secretKey", (err, decoded) => {
    if (err)
      return res.status(500).json({ error: "Failed to authenticate token" });
    req.userId = decoded.id;
    next();
  });
};


// Route to Consume Data from a Channel
app.get("/api/consume/:channelId", verifyToken, async (req, res) => {
  const { channelId } = req.params;

  try {
    // Step 1: Retrieve session (path/channel) from session management service
    const sessionResponse = await axios.get(
      `${sessionServiceUrl}/session/${channelId}`,
      {
        headers: { Authorization: req.headers["authorization"] },
      }
    );

    const sessionData = sessionResponse.data;

    // Step 2: Simulate data consumption from the path/channel
    const consumedData = `Data consumed from channelId: ${channelId} - ${sessionData.initialHeader}`;

    // Step 3: Optionally route or process the data
    // This is where you would forward the data to another service or process it based on business logic
    // For now, we're just sending it back in the response
    res.status(200).json({
      message: "Data consumed successfully",
      data: consumedData,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to consume data from the channel",
        details: error.message,
      });
  }
});


const port = process.env.CONSUMERSERVICE_PORT;

// Start the Consumer Service
app.listen(port, () => {
  console.log(`Consumer Service running on port: ${port}`);
});
