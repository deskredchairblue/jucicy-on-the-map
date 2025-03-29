import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/env'; // Expects config.JWT_SECRET to be defined

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization header provided.' });
  }
  const token = authHeader.split(' ')[1]; // Expecting "Bearer <token>"
  if (!token) {
    return res.status(401).json({ message: 'Token not found.' });
  }
  try {
    // Verify token using JWT_SECRET from config
    const decoded = jwt.verify(token, config.JWT_SECRET);
    // Attach the decoded payload to req.user (ensure to extend Express.Request type accordingly)
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};
