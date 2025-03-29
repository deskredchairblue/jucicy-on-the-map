import { Request, Response } from 'express';
import AuthService from '../services/auth.service';

class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      await AuthService.logout(userId);
      return res.status(200).json({ message: 'Logged out successfully.' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refreshToken(refreshToken);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async validateSession(req: Request, res: Response) {
    try {
      return res.status(200).json({ message: 'Session is valid', user: req.user });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async registerDevice(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { deviceInfo } = req.body;
      await AuthService.registerDevice(userId, deviceInfo);
      return res.status(200).json({ message: 'Device registered successfully' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default AuthController;
