import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();

// Create simple logger (replace with your actual logger implementation)
const logger = {
  error: (message: string, meta?: any) => console.error(message, meta),
  warn: (message: string, meta?: any) => console.warn(message, meta),
  info: (message: string, meta?: any) => console.info(message, meta),
  debug: (message: string, meta?: any) => console.debug(message, meta),
};

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

// JWT payload interface with both id and userId for flexibility
interface JwtPayload {
  userId?: string;
  id?: string;
  email?: string;
  role: string;
  tenantId?: string;
  permissions?: string[];
}

/**
 * Middleware to authenticate users via JWT token
 * Looks for token in Authorization header or cookie
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header or cookie
    const authHeader = req.headers.authorization;
    const tokenFromCookie = req.cookies?.token;
    
    let token: string | undefined;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (tokenFromCookie) {
      token = tokenFromCookie;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
    }
    
    // Verify token
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      
      // Attach user data to request with proper structure
      req.user = {
        userId: decoded.userId || decoded.id || '', // Use either userId or id
        role: decoded.role,
        email: decoded.email,
        permissions: decoded.permissions,
        tenantId: decoded.tenantId
      };
      
      next();
    } catch (error) {
      // Check if token is expired
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          success: false,
          message: 'Token expired. Please login again.',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      // Invalid token
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
        code: 'INVALID_TOKEN'
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error occurred.'
    });
  }
};

/**
 * Middleware to check if user has required roles
 * @param roles - Array of allowed roles
 */
export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource.'
      });
    }
    
    next();
  };
};

/**
 * Middleware to check if user has specific permissions
 * @param requiredPermissions - Array of required permissions
 */
export const permissionMiddleware = (requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
    }
    
    const userPermissions = req.user.permissions || [];
    
    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );
    
    if (!hasAllPermissions) {
      return res.status(403).json({
        success: false,
        message: 'You do not have sufficient permissions to perform this action.'
      });
    }
    
    next();
  };
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't require it
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromCookie = req.cookies?.token;
    
    let token: string | undefined;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (tokenFromCookie) {
      token = tokenFromCookie;
    }
    
    if (!token) {
      return next(); // Continue without authentication
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      
      // Attach user data to request with proper structure
      req.user = {
        userId: decoded.userId || decoded.id || '', // Use either userId or id
        role: decoded.role,
        email: decoded.email,
        permissions: decoded.permissions,
        tenantId: decoded.tenantId
      };
    } catch (error) {
      // Ignore token errors for optional auth
      logger.debug('Invalid token in optional auth, continuing without user context');
    }
    
    next();
  } catch (error) {
    logger.error('Optional auth middleware error:', error);
    next(); // Continue without authentication
  }
};