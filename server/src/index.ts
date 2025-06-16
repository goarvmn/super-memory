// server/src/index.ts

import dotenv from 'dotenv';
import { createApp } from './application';

// Load environment variables first
dotenv.config({ path: '.env.local' });

/**
 * Server Startup
 * Production-ready server initialization
 */
class Server {
  private port: number;
  private app: ReturnType<typeof createApp>;

  constructor() {
    this.port = this.getPort();
    this.app = createApp();
  }

  /**
   * Get port from environment with validation
   */
  private getPort(): number {
    const port = parseInt(process.env.PORT || '3000', 10);

    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error(`Invalid port: ${process.env.PORT}. Port must be a number between 1 and 65535.`);
    }

    return port;
  }

  /**
   * Start the server
   */
  public start(): void {
    const server = this.app.listen(this.port, () => {
      console.log('🚀 GueSense Dashboard API Server started');
      console.log(`📡 Server running on port ${this.port}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${this.port}/health`);
      console.log(`🔑 Auth endpoint: http://localhost:${this.port}/api/auth/login`);

      // Display available routes
      if (process.env.NODE_ENV !== 'production') {
        console.log('\n📋 Available endpoints:');
        console.log('  GET  /health');
        console.log('  POST /api/auth/login');
        console.log('  POST /api/auth/logout (protected)');
        console.log('  GET  /api/auth/validate (protected)');
        console.log('  GET  /api/auth/me (protected)');
      }
    });

    // Graceful shutdown handlers
    this.setupGracefulShutdown(server);
  }

  /**
   * Setup graceful shutdown for production
   */
  private setupGracefulShutdown(server: any): void {
    const shutdown = (signal: string) => {
      console.log(`\n🛑 ${signal} received, shutting down gracefully...`);

      server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions (production safety)
    process.on('uncaughtException', error => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  }
}

// Start the server
try {
  const server = new Server();
  server.start();
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}
