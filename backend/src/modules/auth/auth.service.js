import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../admin/admin.model.js';
import { env } from '../../config/env.js';

export async function loginAdmin({ email, password }) {
  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    throw error;
  }

  const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
  if (!admin) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, admin.passwordHash);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    admin: { id: admin._id, email: admin.email, role: admin.role },
    token
  };
}
