// server/src/index.ts

import dotenv from 'dotenv';
import { ApplicationBootstrap } from './application/bootstrap/server';

// Load environment variables first
dotenv.config({ path: '.env.local' });

/**
 * Server Startup
 */
class Server {
  private port: number;
  private bootstrap: ApplicationBootstrap | null = null;

  constructor() {
    this.port = this.getPort();
  }

  private getPort(): number {
    const port = parseInt(process.env.PORT || '3000', 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error(`Invalid port: ${process.env.PORT}`);
    }
    return port;
  }

  public async start(): Promise<void> {
    this.bootstrap = await ApplicationBootstrap.create();

    // Start HTTP server
    const app = this.bootstrap.getApp();
    const server = app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
      console.log(`Database connected: ${this.bootstrap?.isDatabaseConnected()}`);
    });

    // Setup graceful shutdown
    this.setupGracefulShutdown(server);
  }

  private setupGracefulShutdown(server: any): void {
    const shutdown = async (signal: string) => {
      console.log(`${signal} received, shutting down...`);
      server.close(async () => {
        if (this.bootstrap) {
          await this.bootstrap.shutdown();
        }
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }
}

// Start server
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
