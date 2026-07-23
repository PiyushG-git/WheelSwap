import { createServer } from 'http';
import app from './app';
import { env } from './config/env.config';
import { logger } from './config/logger.config';
import { prisma } from './config/database.config';
import { redis } from './config/redis.config';

const httpServer = createServer(app);

async function bootstrap() {
  try {
    // ── Database connection check ─────────────────
    await prisma.$connect();
    logger.info('✅ PostgreSQL connected via Prisma');

    // ── Redis connection (Optional in local dev) ─
    try {
      await redis.connect();
    } catch {
      logger.warn('⚠️  Redis server is offline. API running without caching.');
    }

    // ── Start HTTP server ─────────────────────────
    httpServer.listen(env.PORT, () => {
      logger.info(`🚀 WheelSwap API running on port ${env.PORT}`);
      logger.info(`👉 Allowed CORS origins: ${env.FRONTEND_URL}, ${env.ADMIN_URL}`);
      logger.info(`📖 Swagger docs: http://localhost:${env.PORT}/api/docs`);
      logger.info(`🌍 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// ─────────────────────────────────────────────
// Graceful Shutdown
// ─────────────────────────────────────────────

async function gracefulShutdown(signal: string) {
  logger.info(`\n${signal} received. Shutting down gracefully...`);

  httpServer.close(async () => {
    logger.info('HTTP server closed');

    await prisma.$disconnect();
    logger.info('Database disconnected');

    if (redis.status === 'ready') {
      redis.disconnect();
      logger.info('Redis disconnected');
    }

    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forcefully shutting down after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

bootstrap();

export { httpServer };
