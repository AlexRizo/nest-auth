import { forwardRef, Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { SpacesModule } from '../spaces/spaces.module';

@Module({
  controllers: [WorkspacesController],
  providers: [WorkspacesService],
  exports: [WorkspacesService],
  imports: [PrismaModule, UsersModule, forwardRef(() => SpacesModule)],
})
export class WorkspacesModule {}
