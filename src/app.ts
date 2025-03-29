import express, { Application, Request, Response, NextFunction, Router } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { createStream } from 'rotating-file-stream';
import path from 'path';
import crypto from 'crypto';
import { config } from './config';
import { errorHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import billingRoutes from './routes/billing.routes';
import projectRoutes from './routes/project.routes';
import securityRoutes from './routes/security.routes';
import notificationRoutes from './routes/notification.routes';
import gatewayRoutes from './routes/gateway.routes';
import adminRoutes from './routes/admin.routes';

// Initialize express app
const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.CORS_ORIGINS,
  credentials: true,
  exposedHeaders: ['X-Request-ID']
}));

// Configure logging based on environment
const setupLogging = (): void => {
  if (config.NODE_ENV === 'production') {
    // Create logs directory if it doesn't exist
    const logsDir = path.join(__dirname, '../logs');
    require('fs').mkdirSync(logsDir, { recursive: true });
    
    // Create a rotating write stream for access logs
    const accessLogStream = createStream('access.log', {
      interval: '1d',
      path: logsDir
    });
    
    app.use(morgan('combined', { stream: accessLogStream }));
    logger.info('Production logging configured with rotating file streams');
  } else {
    app.use(morgan('dev'));
    logger.info('Development logging configured');
  }
};

setupLogging();

// Request parsing middleware
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use(compression());

// API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 250, // limit each IP to 250 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later',
  skip: (req: Request) => {
    // Skip rate limiting for local development and health checks
    return req.ip === '127.0.0.1' || 
           req.path.startsWith('/api/gateway/health') ||
           req.path === '/health';
  }
});

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Request tracking middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = crypto.randomUUID();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
});

// API routes
const setupRoutes = (): void => {
  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      version: config.APP_VERSION
    });
  });

  // Mount API routes
  app.use('/api/auth', authRoutes as Router);
  app.use('/api/user', userRoutes as Router);
  app.use('/api/billing', billingRoutes as Router);
  app.use('/api/project', projectRoutes as Router);
  app.use('/api/security', securityRoutes as Router);
  app.use('/api/notification', notificationRoutes as Router); // Fixed: was using authRoutes
  app.use('/api/gateway', gatewayRoutes as Router);
  app.use('/api/admin', adminRoutes as Router);

  // Root route - API information
  app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ 
      name: 'StreetHitz API Server',
      version: config.APP_VERSION,
      environment: config.NODE_ENV,
      apiDocs: '/api-docs'
    });
  });

  logger.info('API routes configured');
};

setupRoutes();

// Error handling
const setupErrorHandling = (): void => {
  // Global error handler
  app.use(errorHandler);

  // 404 handler for undefined routes
  app.use((req: Request, res: Response) => {
    logger.warn(`Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ 
      success: false,
      message: 'Route not found',
      path: req.url
    });
  });

  logger.info('Error handling configured');
};

setupErrorHandling();

// Export app for use in server.ts
export default app;