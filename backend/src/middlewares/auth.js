import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function authenticateAdmin(req, res, next) {
  let token = null;

  // Check HttpOnly cookie first
  if (req.cookies && req.cookies.admin_token) {
    token = req.cookies.admin_token;
  }
  // Fallback to Bearer token header if present
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Authentication required. Please log in as admin.',
        code: 'UNAUTHORIZED'
      }
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid or expired authentication session.',
        code: 'INVALID_TOKEN'
      }
    });
  }
}
