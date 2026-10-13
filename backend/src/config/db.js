import mongoose from 'mongoose';
import dns from 'node:dns';
import { env } from './env.js';

// On Windows / certain ISPs, Node.js querySrv fails on the local DNS server.
// Set reliable DNS resolvers for SRV record lookups if on node runtime.
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (dnsErr) {
  // Ignore if running in constrained environment
}

let isConnected = false;

export async function connectDB() {
  if (!env.MONGODB_URI) {
    console.error('[DB] MONGODB_URI is not set. Database connection skipped.');
    return false;
  }

  if (isConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      dbName: 'mood_studio',
      serverSelectionTimeoutMS: 10000
    });
    isConnected = conn.connection.readyState === 1;
    console.log('[DB] MongoDB connected successfully to database: mood_studio');
    return true;
  } catch (error) {
    console.error('[DB] MongoDB connection failed:', error.message);
    isConnected = false;
    return false;
  }
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
  }
}
