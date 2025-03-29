import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'APIError';
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error: ${err.message}`, { 
    error: err, 
    stack: err.stack,
    path: req.path,
    method: req.method,
    requestId: req.headers['x-request-id'],
    userId: req.user?.id
  });

  // Handle specific API errors
  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code,
        details: err.details
      }
    });
  }

  // Handle validation errors (express-validator)
  if (err.name === 'ValidationError' || (err as any).errors) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: (err as any).errors || err.message
      }
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      }
    });
  }

  // Handle Stripe errors
  if ((err as any).type && (err as any).type.startsWith('Stripe')) {
    const stripeErr = err as any;
    return res.status(400).json({
      success: false,
      error: {
        message: stripeErr.message,
        code: `STRIPE_${stripeErr.code || 'ERROR'}`,
        details: {
          type: stripeErr.type,
          param: stripeErr.param
        }
      }
    });
  }

  // Handle MongoDB errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    let statusCode = 500;
    let code = 'DATABASE_ERROR';
    let message = 'Database error occurred';

    const mongoErr = err as any;
    if (mongoErr.code === 11000) {
      // Duplicate key error
      statusCode = 409;
      code = 'DUPLICATE_KEY';
      message = 'A record with this information already exists';
    }

    return res.status(statusCode).json({
      success: false,
      error: {
        message,
        code
      }
    });
  }

  // Default error response
  const statusCode = (err as any).statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message || 'Internal server error',
      code: 'INTERNAL_ERROR'
    }
  });
};