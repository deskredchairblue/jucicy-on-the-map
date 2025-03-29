import mongoose from 'mongoose';
import { config } from '../config';
import { logger } from '../utils/logger';

const options: mongoose.ConnectOptions = {
  // No need to set useNewUrlParser, useUnifiedTopology, useFindAndModify, or useCreateIndex
  // as they are now default in Mongoose 6+
};

/**
 * Connect to MongoDB database
 */
export const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.MONGODB_URI, options);
    logger.info('MongoDB connected successfully');
    
    // Add event listeners
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error}`);
    throw error;
  }
};

/**
 * Disconnect from MongoDB database
 */
export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB disconnected successfully');
  } catch (error) {
    logger.error(`Error disconnecting from MongoDB: ${error}`);
    throw error;
  }
};