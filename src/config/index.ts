import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(process.cwd(), '.env') });

export const config = {
  // Server configuration
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  WORKERS: parseInt(process.env.WORKERS || '1', 10),
  CLUSTER_MODE: process.env.CLUSTER_MODE || 'false',
  APP_VERSION: process.env.npm_package_version || '1.0.0',
  
  // Database configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/streethitz',
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'another-secret-key-change-in-production',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // CORS configuration
  CORS_ORIGINS: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',') 
    : ['http://localhost:3000', 'https://app.streethitz.com'],
  
  // Stripe configuration
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  
  // Frontend URL
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Email configuration
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@streethitz.com',
  EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'ses',
  
  // AWS configuration (if needed)
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || 'streethitz-assets',
};

// Validate essential configuration
const validateConfig = () => {
  const requiredEnvVars = [
    { key: 'JWT_SECRET', value: config.JWT_SECRET, default: true },
    { key: 'JWT_REFRESH_SECRET', value: config.JWT_REFRESH_SECRET, default: true },
  ];

  if (process.env.NODE_ENV === 'production') {
    requiredEnvVars.push(
      { key: 'MONGODB_URI', value: config.MONGODB_URI, default: false },
      { key: 'STRIPE_SECRET_KEY', value: config.STRIPE_SECRET_KEY, default: false },
      { key: 'STRIPE_WEBHOOK_SECRET', value: config.STRIPE_WEBHOOK_SECRET, default: false }
    );
  }

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !envVar.value || (envVar.default && process.env.NODE_ENV === 'production')
  );

  if (missingEnvVars.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', 'Missing required environment variables:');
    missingEnvVars.forEach((envVar) => {
      console.error(`- ${envVar.key}`);
    });
    
    if (process.env.NODE_ENV === 'production') {
      console.error('Application cannot start without these environment variables in production.');
      process.exit(1);
    } else {
      console.warn('\x1b[33m%s\x1b[0m', 'Using default values for development. DO NOT USE IN PRODUCTION!');
    }
  }
};

// Run validation if not in test environment
if (process.env.NODE_ENV !== 'test') {
  validateConfig();
}