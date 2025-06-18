// server/src/index.ts

import dotenv from 'dotenv';
import { ApplicationBootstrap, DatabaseBootstrap } from './application';

// Load environment variables first
dotenv.config({ path: '.env.local' });

/**
 * Server Startup
 */
class Server {
  private port: number;
  private app: ReturnType<typeof ApplicationBootstrap.create>;
  private databaseBootstrap: DatabaseBootstrap;

  constructor() {
    this.port = this.getPort();
    this.databaseBootstrap = new DatabaseBootstrap();
    this.app = ApplicationBootstrap.create();
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
   * Initialize database connection
   */
  private async initializeDatabase(): Promise<void> {
    try {
      await this.databaseBootstrap.initialize();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    try {
      // Initialize database first
      await this.initializeDatabase();

      // Start HTTP server
      const server = this.app.listen(this.port, () => {
        console.log('GueSense Dashboard API Server started');
        console.log(`Server running on port ${this.port}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'local'}`);
        console.log(`Database connected: ${this.databaseBootstrap.isConnected()}`);
      });

      // Setup graceful shutdown handlers
      this.setupGracefulShutdown(server);
    } catch (error) {
      console.error('Failed to start server:', error);
      throw error;
    }
  }

  /**
   * Setup graceful shutdown for production
   */
  private setupGracefulShutdown(server: any): void {
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received, shutting down gracefully...`);

      server.close(async () => {
        try {
          // Close database connection
          await this.databaseBootstrap.shutdown();
          console.log('Server closed successfully');
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions (production safety)
    process.on('uncaughtException', error => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  }
}

// Start the server
async function startServer() {
  try {
    const server = new Server();
    await server.start();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
