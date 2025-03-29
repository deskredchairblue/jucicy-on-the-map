import { Router } from 'express';
import AdminController from '../controllers/admin.controller';

const router = Router();

// Admin endpoints
router.get('/admin/logs/requests', AdminController.getRequestLogs);
router.get('/admin/logs/errors', AdminController.getErrorLogs);
router.get('/admin/logs/usage', AdminController.getUsageLogs);
router.get('/admin/dashboard', AdminController.getDashboard);
router.get('/admin/analytics/posthog', AdminController.getPostHogAnalytics);
router.get('/admin/analytics/plausible', AdminController.getPlausibleAnalytics);
router.get('/admin/users', AdminController.getUsers);
router.post('/admin/user/assign-role', AdminController.assignUserRole);
router.delete('/admin/user/:id', AdminController.deleteUser);
router.post('/admin/broadcast', AdminController.broadcastAnnouncement);
router.post('/admin/metrics/report', AdminController.reportMetrics);

export default router;
