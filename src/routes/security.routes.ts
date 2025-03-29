import { Router } from 'express';
import securityController from '../controllers/security.controller';
import authMiddleware from '../middleware/auth.middleware';
import rbacMiddleware from '../middleware/rbac.middleware';

const router = Router();

// Get security status
router.get('/status', authMiddleware, securityController.getStatus);

// Alert suspicious activity
router.post('/alert', authMiddleware, securityController.alertActivity);

// Ban user or IP (admin only)
router.post('/ban', authMiddleware, rbacMiddleware(['admin']), securityController.banUser);

// Unban user or IP (admin only)
router.post('/unban', authMiddleware, rbacMiddleware(['admin']), securityController.unbanUser);

// Analyze IP risk
router.post('/analyze-ip', authMiddleware, securityController.analyzeIP);

// Force logout of all sessions
router.post('/force-logout', authMiddleware, securityController.forceLogout);

// Delete account and related data (GDPR/CCPA)
router.delete('/delete-account', authMiddleware, securityController.deleteAccount);

// Get audit log for the user
router.get('/audit-log', authMiddleware, securityController.getAuditLog);

// Validate privacy compliance
router.post('/validate-privacy', authMiddleware, securityController.validatePrivacy);

// Trigger platform-wide lockdown (admin only)
router.post('/lockdown', authMiddleware, rbacMiddleware(['admin']), securityController.lockdown);

export default router;
