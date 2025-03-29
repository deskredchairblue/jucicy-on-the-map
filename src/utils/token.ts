import jwt from 'jsonwebtoken';
import { config } from '../config';

interface TokenPayload {
  id: string;
  email: string;
  role: string;
  tenantId?: string;
  permissions?: string[];
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Generate access and refresh tokens for a user
 */
export const generateTokens = (payload: TokenPayload): TokenResponse => {
  // Calculate expiration time in seconds
  const accessTokenExpiresIn = getExpiryTime(config.JWT_EXPIRES_IN);
  
  // Generate access token
  const accessToken = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
  
  // Generate refresh token
  const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
  });
  
  return {
    accessToken,
    refreshToken,
    expiresIn: accessTokenExpiresIn,
  };
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.JWT_SECRET) as TokenPayload;
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as TokenPayload;
};

/**
 * Helper function to convert JWT expiry time string to seconds
 */
const getExpiryTime = (expiresIn: string): number => {
  const unit = expiresIn.charAt(expiresIn.length - 1);
  const value = parseInt(expiresIn.slice(0, -1), 10);
  
  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 24 * 60 * 60;
    default:
      return 3600; // Default to 1 hour
  }
};