import { Router } from 'express';
import UserController from '../controllers/user.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

router.get('/profile', authMiddleware, UserController.getProfile);
router.put('/profile', authMiddleware, UserController.updateProfile);
router.get('/settings', authMiddleware, UserController.getSettings);
router.put('/settings', authMiddleware, UserController.updateSettings);

export default router;
