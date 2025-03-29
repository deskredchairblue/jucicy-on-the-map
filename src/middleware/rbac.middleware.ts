import { Request, Response, NextFunction } from 'express';

/**
 * Role-based Access Control middleware.
 * @param allowedRoles - Array of roles that are permitted access.
 */
export const rbacMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Assuming req.user is set by authMiddleware and contains a 'role' property.
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Forbidden: You do not have the required permissions.',
      });
    }
    next();
  };
};
