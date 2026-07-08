import { Global, Module, OnApplicationShutdown } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import Redis from 'ioredis';
import { REDIS } from '../auth/helpers/redis';
import { envs } from 'src/config/env';

@Global()
@Module({
  providers: [
    {
      provide: REDIS.REDIS_CLIENT,
      useFactory: () => {
        return new Redis(envs.REDIS, {
          maxRetriesPerRequest: 3,
        });
      },
    },
  ],
  exports: [REDIS.REDIS_CLIENT],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(private readonly moduleRef: ModuleRef) {}

  async onApplicationShutdown() {
    const client = this.moduleRef.get<Redis>(REDIS.REDIS_CLIENT);
    await client.quit();
  }
}
