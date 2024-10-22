const express = require('express');
const axios = require('axios');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const CircuitBreaker = require('circuit-breaker-js');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(express.json()); // for parsing json requests

const sessionServiceURL = process.env.SESSIONSERVICEURL;

// Middleware to verify JWT tokens
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'Token required' });

  jwt.verify(token, 'secretKey', (err, decoded) => {
    if (err) return res.status(500).json({ error: 'Failed to authenticate token' });
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




// Route to Create Session (Path)
app.post('/api/session', verifyToken, async (req, res) => {
  const { initialHeader } = req.body;

  // Circuit breaker logic to call session service
  breaker.runCommand(async (success, failure) => {
    try {
      // Forward request to session management service
      const response = await axios.post(`${sessionServiceURL}/session`, { initialHeader }, {
        headers: { Authorization: req.headers['authorization'] }
      });
      success();  // Mark circuit breaker as successful
      res.status(201).json(response.data);  // Return the response from session service
    } catch (error) {
      failure();  // Mark circuit breaker as failed
      res.status(500).json({ error: 'Failed to create session', details: error.message });
    }
  }, (err) => {
    // If the circuit is open, return service unavailable
    res.status(503).json({ error: 'Session service unavailable due to high error rate' });
  });
});




// Route to Retrieve Session (Path)
app.get('/api/session/:channelId', verifyToken, async (req, res) => {
  const { channelId } = req.params;

  // Circuit breaker logic to call session service
  breaker.runCommand(async (success, failure) => {
    try {
      // Forward request to session management service
      const response = await axios.get(`${sessionServiceURL}/session/${channelId}`, {
        headers: { Authorization: req.headers['authorization'] }
      });
      success();  // Mark circuit breaker as successful
      res.status(200).json(response.data);  // Return the response from session service
    } catch (error) {
      failure();  // Mark circuit breaker as failed
      res.status(500).json({ error: 'Failed to retrieve session', details: error.message });
    }
  }, (err) => {
    // If the circuit is open, return service unavailable
    res.status(503).json({ error: 'Session service unavailable due to high error rate' });
  });
});




// Route to Delete Session (Path)
app.delete('/api/session/:channelId', verifyToken, async (req, res) => {
  const { channelId } = req.params;

  // Circuit breaker logic to call session service
  breaker.runCommand(async (success, failure) => {
    try {
      // Forward request to session management service
      const response = await axios.delete(`${sessionServiceURL}/session/${channelId}`, {
        headers: { Authorization: req.headers['authorization'] }
      });
      success();  // Mark circuit breaker as successful
      res.status(200).json(response.data);  // Return the response from session service
    } catch (error) {
      failure();  // Mark circuit breaker as failed
      res.status(500).json({ error: 'Failed to delete session', details: error.message });
    }
  }, (err) => {
    // If the circuit is open, return service unavailable
    res.status(503).json({ error: 'Session service unavailable due to high error rate' });
  });
});


// app listens on port - 4001
const port = process.env.APIGATEWAY_PORT || 4001;
//starting the session - service 
app.listen( port, () =>{
    console.log(`API Gateway Service running sucessfully on port ${port}`);
});
