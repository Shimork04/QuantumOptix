const mongoose = require('mongoose');

// function to connect mongodb
const connectDB = mongoose.connect(process.env.MONGO_URI, {
    newUrlParser: true,
    useUnifiedTopoly: true,
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.log("Error connecting to MongoDB: ", error);
});


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