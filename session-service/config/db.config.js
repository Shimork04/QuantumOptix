const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// function to connect mongodb
const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI , {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connecting to MongoDB....')
      console.log('MongoDB Connected.');
    } catch (err) {
      console.error('MongoDB connection error:', err);
      process.exit(1);  // Exit process with failure
    }
  };


// code for handling connection events
const dbmgt = mongoose.connection;
// dbmgt = db management

dbmgt.on('error', (error) => {
    console.log('MongoDB connection error: ', error);
});

dbmgt.once('open', () => {
    console.log('Connected to MongoDB');
});

dbmgt.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
});




module.exports = connectDB;