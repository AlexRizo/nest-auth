import { Global, Module, OnApplicationShutdown } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import Redis from 'ioredis';
import { envs } from 'src/config/env';

@Global()
@Module({
  providers: [
    {
      provide: envs.REDIS_CLIENT,
      useFactory: () => {
        return new Redis(envs.REDIS, {
          maxRetriesPerRequest: 3,
        });
      },
    },
  ],
  exports: [envs.REDIS_CLIENT],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(private readonly moduleRef: ModuleRef) {}

  async onApplicationShutdown() {
    const client = this.moduleRef.get<Redis>(envs.REDIS_CLIENT);
    await client.quit();
  }
}
