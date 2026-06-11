import app from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';

/**
 * Graceful shutdown handler.
 * Closes database connections before process exits.
 */
async function gracefulShutdown(signal: string): Promise<void> {
  console.info(`\n🛑  Received ${signal}. Shutting down gracefully...`);

  await prisma.$disconnect();
  console.info('✅  Database connection closed.');

  process.exit(0);
}

/**
 * Bootstrap function — connect DB, then start HTTP server.
 */
async function bootstrap(): Promise<void> {
  // Validate DB connection before accepting traffic
  await prisma.$connect();
  console.info('✅  Database connected successfully.');

  const server = app.listen(env.PORT, () => {
    console.info(`\n🚀  silly-backend running`);
    console.info(`    ├─ ENV:  ${env.NODE_ENV}`);
    console.info(`    ├─ PORT: ${env.PORT}`);
    console.info(`    └─ URL:  http://localhost:${env.PORT}`);
  });

  // ─── Graceful shutdown signals ─────────────────────────────────────────────
  process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => void gracefulShutdown('SIGINT'));

  // ─── Unhandled rejections ──────────────────────────────────────────────────
  process.on('unhandledRejection', (reason: unknown) => {
    console.error('💥  UNHANDLED REJECTION:', reason);
    server.close(() => process.exit(1));
  });

  // ─── Uncaught exceptions ───────────────────────────────────────────────────
  process.on('uncaughtException', (error: Error) => {
    console.error('💥  UNCAUGHT EXCEPTION:', error);
    process.exit(1);
  });
}

bootstrap().catch((error: unknown) => {
  console.error('❌  Failed to start server:', error);
  process.exit(1);
});
