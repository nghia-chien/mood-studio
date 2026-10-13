import { createApp } from '../backend/src/app.js';
import { connectDB } from '../backend/src/config/db.js';

let appInstance = null;

export default async function handler(req, res) {
  // Normalize req.url to ensure it begins with /api for Express route handlers
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }

  try {
    await connectDB();
  } catch (err) {
    console.error('[SERVERLESS DB ERROR]', err.message);
  }

  if (!appInstance) {
    appInstance = createApp();
  }

  return appInstance(req, res);
}
