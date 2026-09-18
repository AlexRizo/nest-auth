import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { ServerOptions } from 'socket.io';
import { envs } from 'src/config/env';

// Sin esto, un evento emitido a una sala solo llega a los sockets
// conectados a ESA instancia del proceso. Con varias réplicas detrás de un
// balanceador, un cliente conectado a la instancia B nunca vería el evento
// emitido desde la instancia A. El adapter de Redis publica/suscribe los
// eventos entre instancias reusando el mismo Redis que ya tiene la app.
export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor?: ReturnType<typeof createAdapter>;

  constructor(app: INestApplicationContext) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    const pubClient = new Redis(envs.REDIS);
    const subClient = pubClient.duplicate();

    await Promise.all([
      new Promise<void>((resolve) => pubClient.once('ready', resolve)),
      new Promise<void>((resolve) => subClient.once('ready', resolve)),
    ]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(
      port,
      options,
    ) as import('socket.io').Server;
    if (this.adapterConstructor) server.adapter(this.adapterConstructor);
    return server;
  }
}
