const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;
    
    try {
      console.log('Connecting to MongoDB...');
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: process.env.NODE_ENV === 'production' ? 30000 : 3000
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      if (mongoUri && (mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost'))) {
        console.warn('Local MongoDB connection failed. Starting persistent in-memory MongoDB server...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const path = require('path');
        const fs = require('fs');
        const dbPath = path.join(__dirname, '../data/db');
        if (!fs.existsSync(dbPath)) {
          fs.mkdirSync(dbPath, { recursive: true });
        }
        const mongoServer = await MongoMemoryServer.create({
          instance: {
            dbPath: dbPath,
            storageEngine: 'wiredTiger'
          }
        });
        const uri = mongoServer.getUri();
        console.log(`Persistent MongoDB Server started at: ${uri}`);
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected (Persistent Fallback): ${conn.connection.host}`);
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
