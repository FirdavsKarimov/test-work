const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb://localhost:27017/test-projects', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log(`Connected to MongoDB: ${conn.connection.host}`);
        
        mongoose.connection.on('connected', () => {
            console.log('MongoDB connection status: Connected');
        });
        
        mongoose.connection.on('error', (err) => {
            console.log(`MongoDB connection status: Error - ${err}`);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB connection status: Disconnected');
        });
        
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;