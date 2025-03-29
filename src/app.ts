import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import billingRoutes from './routes/billing.routes';
import projectRoutes from './routes/project.routes';
import securityRoutes from './routes/security.routes';
import notificationRoutes from './routes/notification.routes';
import gatewayRoutes from './routes/gateway.routes';
import adminRoutes from './routes/admin.routes';

dotenv.config();

const app = express();

// 🌐 Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 🚦 Rate Limiter
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Too many requests, try again later.'
}));

// 🧩 Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/gateway', gatewayRoutes);
app.use('/api/admin', adminRoutes);

// ❤️ Health Check
app.get('/api/core/health', (_req, res) => res.status(200).json({ status: 'ok', uptime: process.uptime() }));

// ❌ Global Error Handler
app.use(errorHandler);

export default app;
