import { Request, Response } from 'express';
import securityService from '../services/security.service';

const securityController = {
  getStatus: async (req: Request, res: Response) => {
    try {
      const status = await securityService.getStatus(req.user);
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  alertActivity: async (req: Request, res: Response) => {
    try {
      const result = await securityService.alertActivity(req.body, req.user);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  banUser: async (req: Request, res: Response) => {
    try {
      const result = await securityService.banUser(req.body, req.user);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  unbanUser: async (req: Request, res: Response) => {
    try {
      const result = await securityService.unbanUser(req.body, req.user);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  analyzeIP: async (req: Request, res: Response) => {
    try {
      const analysis = await securityService.analyzeIP(req.body.ip, req.user);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  forceLogout: async (req: Request, res: Response) => {
    try {
      const result = await securityService.forceLogout(req.user);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteAccount: async (req: Request, res: Response) => {
    try {
      await securityService.deleteAccount(req.user);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getAuditLog: async (req: Request, res: Response) => {
    try {
      const log = await securityService.getAuditLog(req.user);
      res.json(log);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  validatePrivacy: async (req: Request, res: Response) => {
    try {
      const result = await securityService.validatePrivacy(req.body, req.user);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  lockdown: async (req: Request, res: Response) => {
    try {
      const result = await securityService.lockdown(req.body, req.user);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default securityController;
