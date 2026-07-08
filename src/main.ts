import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config/env';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { RedisStore } from 'connect-redis';
import Redis from 'ioredis';
import session from 'express-session';

async function bootstrap() {
  const logger = new Logger('App');

  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.enableCors({
    origin: envs.ALLOWED_ORIGINS,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const sessionRedis = new Redis(envs.REDIS);

  app.use(
    session({
      store: new RedisStore({ client: sessionRedis, prefix: 'oauth-sess:' }),
      secret: envs.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: envs.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000,
      },
    }),
  );

  await app.listen(envs.PORT);
  logger.log(`Server running on port ${envs.PORT}`);
}
void bootstrap();
