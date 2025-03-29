import { createConnection } from 'typeorm';
import { config } from '../config/env'; // Adjust this import to your config setup

export const connectDatabase = async () => {
  try {
    const connection = await createConnection({
      type: 'postgres',
      url: process.env.DB_CONNECTION_STRING || config.DB_CONNECTION_STRING,
      entities: [__dirname + '/../models/*.ts'],
      // In production, disable automatic schema sync for safety
      synchronize: process.env.NODE_ENV !== 'production',
      logging: false,
    });
    console.log('Database connected');
    return connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};
