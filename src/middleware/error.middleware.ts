import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger'; // Assumes a logger utility is set up

/**
 * Global error handling middleware.
 */
export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error details
  logger.error(err.message, { stack: err.stack });
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
  });
};
