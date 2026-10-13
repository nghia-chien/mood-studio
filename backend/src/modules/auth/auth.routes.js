import { Router } from 'express';
import { login, logout, getCurrentAdmin } from './auth.controller.js';
import { authenticateAdmin } from '../../middlewares/auth.js';
import { loginLimiter } from '../../middlewares/rateLimiter.js';

const router = Router();

router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.get('/me', authenticateAdmin, getCurrentAdmin);

export default router;
