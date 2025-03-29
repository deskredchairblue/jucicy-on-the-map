import rateLimit from 'express-rate-limit';

/**
 * Rate limiting middleware to prevent abuse.
 */
export const rateLimiterMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again after 15 minutes.',
});
