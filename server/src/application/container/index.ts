// server/src/application/container/index.ts

import { Container } from 'inversify';
import 'reflect-metadata';
import { ServiceBindings } from './ServiceBindings';

/**
 * DI Container
 */
class DIContainer {
  private static instance: Container;

  /**
   * Get container instance
   */
  static getInstance(): Container {
    if (!this.instance) {
      this.instance = new Container();
      ServiceBindings.bindServices(this.instance);
      ServiceBindings.bindExternalServices(this.instance);
    }
    return this.instance;
  }
}

/**
 * Export container instance
 */
export const container = DIContainer.getInstance();
