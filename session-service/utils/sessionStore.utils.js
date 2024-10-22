// // Import the Session model
// const Session = require('../models/Session');

// // Function to create a new session
// const createSession = async (initialHeader) => {
//   const { v4: uuidv4 } = require('uuid');  // To generate a unique Channel ID
//   const channelId = uuidv4();  // Generate unique Channel ID

//   // Create a new session
//   const session = new Session({
//     channelId,
//     initialHeader
//   });

//   try {
//     await session.save();  // Save session to MongoDB
//     return { channelId };
//   } catch (err) {
//     throw new Error('Error creating session: ' + err.message);
//   }
// };

// // Function to retrieve a session by its Channel ID
// const getSessionById = async (channelId) => {
//   try {
//     const session = await Session.findOne({ channelId });
//     if (!session) {
//       throw new Error('Session not found');
//     }
//     return session;
//   } catch (err) {
//     throw new Error('Error retrieving session: ' + err.message);
//   }
// };

// // Function to delete a session by its Channel ID
// const deleteSessionById = async (channelId) => {
//   try {
//     const result = await Session.deleteOne({ channelId });
//     if (result.deletedCount === 0) {
//       throw new Error('Session not found or already deleted');
//     }
//     return result;
//   } catch (err) {
//     throw new Error('Error deleting session: ' + err.message);
//   }
// };

// // Export the functions to be used in other parts of the application
// module.exports = {
//   createSession,
//   getSessionById,
//   deleteSessionById,
// };
