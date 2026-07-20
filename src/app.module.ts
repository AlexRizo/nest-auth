import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import KeyvRedis from '@keyv/redis';
import Redis from 'ioredis';
import { envs } from './config/env';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './modules/redis/redis.module';
import { REDIS } from './modules/auth/helpers/redis';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => {
        return {
          ttl: 5000,
          stores: [new KeyvRedis(envs.REDIS)],
        };
      },
    }),
    // Rate limiting. El contador se guarda en Redis (mismo cliente que ya
    // gestiona RedisModule) para que el límite sea compartido entre instancias
    // si escalamos horizontalmente. Límite global laxo por IP; los endpoints
    // sensibles lo endurecen con @Throttle en el controller.
    ThrottlerModule.forRootAsync({
      inject: [REDIS.REDIS_CLIENT],
      useFactory: (redis: Redis) => ({
        throttlers: [{ ttl: 60_000, limit: 100 }],
        storage: new ThrottlerStorageRedisService(redis),
      }),
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    RedisModule,
    WorkspacesModule,
  ],
  providers: [
    // Aplica el rate limiting a toda la app. Se ejecuta también en rutas
    // @Public (no depende de autenticación), por lo que protege el login.
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
