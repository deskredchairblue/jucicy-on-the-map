import { Router } from 'express';
import NotificationController from '../controllers/notification.controller';

const router = Router();

// Notification endpoints
router.get('/notifications', NotificationController.getNotifications);
router.post('/notification/send', NotificationController.sendNotification);
router.post('/notification/read', NotificationController.markAsRead);
router.delete('/notification/:id', NotificationController.deleteNotification);
router.post('/notification/broadcast', NotificationController.broadcastNotification);
router.get('/notification/preferences', NotificationController.getPreferences);
router.put('/notification/preferences', NotificationController.updatePreferences);
router.get('/notification/logs', NotificationController.getLogs);
router.get('/notification/in-app', NotificationController.getInAppNotifications);
router.post('/notification/email', NotificationController.sendEmailNotification);
router.post('/notification/webhook', NotificationController.handleWebhook);

export default router;
