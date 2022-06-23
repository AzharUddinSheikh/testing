import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '../../../src/core/server';

import { MyPluginPluginSetup, MyPluginPluginStart } from './types';
import { defineRoutes } from './routes';

export class MyPluginPlugin implements Plugin<MyPluginPluginSetup, MyPluginPluginStart> {
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup) {
    this.logger.debug('myPlugin: Setup');
    const router = core.http.createRouter();

    // Register server side APIs
    defineRoutes(router);

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('myPlugin: Started');
    return {};
  }

  public stop() {}
}
