const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); // for parsing json requests

const sessionServiceURL = process.env.SESSIONSERVICEURL;



// to post session
app.post("/api/session", async (req, res) => {
  try {
    const { intialHeader } = req.body;
    console.log("Intial Header recieved from Body of Reqeuest");

    // Forwarding request to session service
    const sessionResponse = await axios.post(`${process.env.SESSIONSERVICEURL}`,{ intialHeader });
    console.log("response recieved from session-service");

    // returning the response from session service
    res.status(201).json(sessionResponse.data);
  } catch (error) {
    console.log(
      "There is some error in api-gateway/api-gateway.js, while connecting to session-service"
    );
    res
      .status(500)
      .json({ error: "Failed to create session", details: error.message });
  }
});



// to get already created session, with help of channelId
app.get("/api/session/:channelId", async (req, res) => {
  try {
    const { channelId } = req.params;
    console.log("ChannelId recieved");

    // forwarding request to session service
    const sessionResponse = await axios.get(`${process.env.SESSIONSERVICEURL}/session/${channelId}`);

    res.status(200).json(response.data); 
    // Return the response from session service


    } catch (error) {
        res.status(404).json({ error: "Session not found", details: error.message });
  }
});




// delete session api
app.delete('/api/session/:channelId', async (req, res) => {
    try {
        const { channelId } = req.params;

        const response = await axios.delete(`${process.env.SESSIONSERVICEURL}/session/${channelId}`);  
        // Forward request to session service
        
        res.status(200).json(response.data);  
        // Return the response from session service


      } catch (error) {
        res.status(404).json({ error: 'Failed to delete session', details: error.message });
      }
});


// app listens on port - 4001
const port = process.env.APIGATEWAY_PORT || 4001;
//starting the session - service 
app.listen( port, () =>{
    console.log(`API Gateway Service running sucessfully on port ${port}`);
});