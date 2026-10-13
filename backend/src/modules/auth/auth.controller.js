import { loginAdmin } from './auth.service.js';
import { env } from '../../config/env.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { admin, token } = await loginAdmin({ email, password });

    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      data: {
        admin,
        token // Provided for flexibility if client uses Authorization header
      }
    });
  } catch (error) {
    next(error);
  }
}

export function logout(req, res) {
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax'
  });
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
}

export function getCurrentAdmin(req, res) {
  res.status(200).json({
    success: true,
    data: req.admin
  });
}
