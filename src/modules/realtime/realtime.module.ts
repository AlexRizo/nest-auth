import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config/env';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { SpacesModule } from '../spaces/spaces.module';
import { RealtimeAuthService } from './realtime-auth.service';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';

// Global: cualquier módulo (Assignments, Tasks, ...) puede inyectar
// RealtimeService sin importar este módulo explícitamente.
@Global()
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    SpacesModule,
    JwtModule.registerAsync({
      useFactory: () => ({ secret: envs.JWT_SECRET }),
    }),
  ],
  providers: [RealtimeAuthService, RealtimeGateway, RealtimeService],
  exports: [RealtimeService],
})
export class RealtimeModule {}
