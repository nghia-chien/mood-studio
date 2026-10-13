import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { isDbConnected } from './config/db.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Import routers
import authRouter from './modules/auth/auth.routes.js';
import { publicConceptRouter, adminConceptRouter } from './modules/concepts/concept.routes.js';
import { publicPackageRouter, adminPackageRouter } from './modules/packages/package.routes.js';
import { publicGalleryRouter, adminGalleryRouter } from './modules/gallery/gallery.routes.js';
import { publicBookingRouter, adminBookingRouter } from './modules/bookings/booking.routes.js';

export function createApp() {
  const app = express();

  // CORS configuration
  const allowedOrigins = [
    env.CLIENT_ORIGIN,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000'
  ];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly fallback
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

  // JSON & URL-encoded parsing
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));
  app.use(cookieParser());

  // Health endpoint
  app.get('/api/health', (req, res) => {
    const dbStatus = isDbConnected() ? 'connected' : 'disconnected';
    res.status(200).json({
      status: 'ok',
      database: dbStatus,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    });
  });

  // Public routes
  app.use('/api/public/concepts', publicConceptRouter);
  app.use('/api/public/concepts', publicPackageRouter); // provides GET /api/public/concepts/:id/packages
  app.use('/api/public/gallery', publicGalleryRouter);
  app.use('/api/public/bookings', publicBookingRouter);

  // Admin routes
  app.use('/api/admin/auth', authRouter);
  app.use('/api/admin/concepts', adminConceptRouter);
  app.use('/api/admin/packages', adminPackageRouter);
  app.use('/api/admin/gallery', adminGalleryRouter);
  app.use('/api/admin/bookings', adminBookingRouter);

  // 404 handler for undefined routes
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: {
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        code: 'NOT_FOUND'
      }
    });
  });

  // Centralized error handler
  app.use(errorHandler);

  return app;
}
