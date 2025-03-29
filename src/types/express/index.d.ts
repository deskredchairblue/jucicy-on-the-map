import * as express from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    // Attach authenticated user info after token verification
    user?: {
      userId: string;
      role: string;
      // Add any additional properties as needed
    };
  }
}
