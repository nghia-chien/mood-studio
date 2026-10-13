import { createApp } from './app.js';
import { env, validateEnv } from './config/env.js';
import { connectDB } from './config/db.js';

validateEnv();

const app = createApp();

async function startServer() {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`[SERVER] MOOD Studio Backend running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    console.log(`[SERVER] Health check available at: http://localhost:${env.PORT}/api/health`);
  });
}

startServer().catch(err => {
  console.error('[SERVER CRITICAL] Failed to start server:', err);
  process.exit(1);
});
