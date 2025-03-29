import { Request, Response } from 'express';
import UserService from '../services/user.service';

class UserController {
  static async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const profile = await UserService.getProfile(userId);
      return res.status(200).json(profile);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const data = req.body;
      const updatedProfile = await UserService.updateProfile(userId, data);
      return res.status(200).json(updatedProfile);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async getSettings(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const settings = await UserService.getSettings(userId);
      return res.status(200).json(settings);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async updateSettings(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const data = req.body;
      const updatedSettings = await UserService.updateSettings(userId, data);
      return res.status(200).json(updatedSettings);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default UserController;
