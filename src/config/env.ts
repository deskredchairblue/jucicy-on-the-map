import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 4000,
  DATABASE_URL: process.env.DATABASE_URL || '',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  JWT_SECRET: process.env.JWT_SECRET || 'your_default_jwt_secret',
  // Add additional variables as needed
};
