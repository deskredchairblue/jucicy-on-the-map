import jwt from 'jsonwebtoken';
import { config } from '../config/env'; // Your env/config setup

// Define a custom payload interface for our login token
export interface JwtPayload {
  userId: string;
  role: string;
  // Add additional claims as needed
}

// Default token expiration time (e.g., 1 hour)
const TOKEN_EXPIRATION = '1h';

/**
 * Generate a JWT login token for the given payload.
 * @param payload - Data to include in the token.
 * @param expiresIn - Optional custom expiration time.
 * @returns A signed JWT token.
 */
export function generateLoginToken(payload: JwtPayload, expiresIn: string = TOKEN_EXPIRATION): string {
  const secret = process.env.JWT_SECRET || config.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT secret is not defined');
  }
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Verify a given JWT token.
 * @param token - The JWT token to verify.
 * @returns The decoded payload if token is valid.
 * @throws Error if the token is invalid or expired.
 */
export function verifyLoginToken(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET || config.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT secret is not defined');
  }
  return jwt.verify(token, secret) as JwtPayload;
}
