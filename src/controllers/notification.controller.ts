import { Request, Response } from 'express';
import NotificationService from '../services/notification.service';

class NotificationController {
  static async getNotifications(req: Request, res: Response) {
    try {
      const notifications = await NotificationService.getAll(req.user?.id);
      res.json({ success: true, data: notifications });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
  }

  static async sendNotification(req: Request, res: Response) {
    try {
      const { message, userId } = req.body;
      const result = await NotificationService.send(userId, message);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to send notification' });
    }
  }

  static async markAsRead(req: Request, res: Response) {
    try {
      const { notificationIds } = req.body;
      const result = await NotificationService.markAsRead(req.user?.id, notificationIds);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to mark notifications as read' });
    }
  }

  static async deleteNotification(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await NotificationService.delete(id);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to delete notification' });
    }
  }

  static async broadcastNotification(req: Request, res: Response) {
    try {
      const { message } = req.body;
      const result = await NotificationService.broadcast(message);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to broadcast notification' });
    }
  }

  static async getPreferences(req: Request, res: Response) {
    try {
      const prefs = await NotificationService.getPreferences(req.user?.id);
      res.json({ success: true, data: prefs });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch preferences' });
    }
  }

  static async updatePreferences(req: Request, res: Response) {
    try {
      const { preferences } = req.body;
      const result = await NotificationService.updatePreferences(req.user?.id, preferences);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to update preferences' });
    }
  }

  static async getLogs(req: Request, res: Response) {
    try {
      const logs = await NotificationService.getLogs();
      res.json({ success: true, data: logs });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to retrieve logs' });
    }
  }

  static async getInAppNotifications(req: Request, res: Response) {
    try {
      const notifications = await NotificationService.getInApp(req.user?.id);
      res.json({ success: true, data: notifications });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to get in-app notifications' });
    }
  }

  static async sendEmailNotification(req: Request, res: Response) {
    try {
      const { email, subject, message } = req.body;
      const result = await NotificationService.sendEmail(email, subject, message);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to send email notification' });
    }
  }

  static async handleWebhook(req: Request, res: Response) {
    try {
      const result = await NotificationService.handleWebhook(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to process webhook' });
    }
  }
}

export default NotificationController;
