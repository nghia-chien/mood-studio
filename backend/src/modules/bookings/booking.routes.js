import { Router } from 'express';
import * as bookingController from './booking.controller.js';
import { authenticateAdmin } from '../../middlewares/auth.js';
import { bookingLimiter } from '../../middlewares/rateLimiter.js';

export const publicBookingRouter = Router();
publicBookingRouter.post('/', bookingLimiter, bookingController.createPublicBooking);

export const adminBookingRouter = Router();
adminBookingRouter.use(authenticateAdmin);
adminBookingRouter.get('/', bookingController.getAdminBookings);
adminBookingRouter.get('/:id', bookingController.getAdminBookingById);
adminBookingRouter.patch('/:id', bookingController.updateAdminBooking);
adminBookingRouter.patch('/:id/status', bookingController.updateAdminBookingStatus);
