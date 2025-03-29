import { Router, Request, Response, NextFunction } from 'express';
import { validateLoginInput } from '../utils/validator';
import { generateLoginToken } from '../utils/token';

// Mock function for user authentication – replace with real database lookup & password validation.
async function authenticateUser(email: string, password: string): Promise<{ userId: string; role: string } | null> {
  // Example: Only accepts a fixed test user.
  if (email === 'user@example.com' && password === 'Password1') {
    return { userId: '123456', role: 'user' };
  }
  return null;
}

const router = Router();

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Validate input fields
    const errors = validateLoginInput(email, password);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Authenticate user (replace with actual logic)
    const user = await authenticateUser(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate a JWT login token
    const token = generateLoginToken({ userId: user.userId, role: user.role });
    
    res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
});

export default router;
