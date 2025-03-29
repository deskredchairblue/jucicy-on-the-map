import { Request, Response } from 'express';
import AdminService from '../services/admin.service';

class AdminController {
  static async getRequestLogs(req: Request, res: Response) {
    try {
      const logs = await AdminService.getRequestLogs();
      res.json({ success: true, data: logs });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch request logs' });
    }
  }

  static async getErrorLogs(req: Request, res: Response) {
    try {
      const logs = await AdminService.getErrorLogs();
      res.json({ success: true, data: logs });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch error logs' });
    }
  }

  static async getUsageLogs(req: Request, res: Response) {
    try {
      const logs = await AdminService.getUsageLogs();
      res.json({ success: true, data: logs });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch usage logs' });
    }
  }

  static async getDashboard(req: Request, res: Response) {
    try {
      const dashboard = await AdminService.getDashboard();
      res.json({ success: true, data: dashboard });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
    }
  }

  static async getPostHogAnalytics(req: Request, res: Response) {
    try {
      const analytics = await AdminService.getPostHogAnalytics();
      res.json({ success: true, data: analytics });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch PostHog analytics' });
    }
  }

  static async getPlausibleAnalytics(req: Request, res: Response) {
    try {
      const analytics = await AdminService.getPlausibleAnalytics();
      res.json({ success: true, data: analytics });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch Plausible analytics' });
    }
  }

  static async getUsers(req: Request, res: Response) {
    try {
      const users = await AdminService.getUsers();
      res.json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
  }

  static async assignUserRole(req: Request, res: Response) {
    try {
      const { userId, role } = req.body;
      const result = await AdminService.assignUserRole(userId, role);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to assign user role' });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await AdminService.deleteUser(id);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to delete user' });
    }
  }

  static async broadcastAnnouncement(req: Request, res: Response) {
    try {
      const { message } = req.body;
      const result = await AdminService.broadcastAnnouncement(message);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to broadcast announcement' });
    }
  }

  static async reportMetrics(req: Request, res: Response) {
    try {
      const report = await AdminService.reportMetrics();
      res.json({ success: true, data: report });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to report metrics' });
    }
  }
}

export default AdminController;
