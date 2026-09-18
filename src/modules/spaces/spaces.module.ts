import { forwardRef, Module } from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { SpaceAccessService } from './space-access.service';
import { SpacesController } from './spaces.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [PrismaModule, forwardRef(() => WorkspacesModule)],
  controllers: [SpacesController],
  providers: [SpacesService, SpaceAccessService],
  exports: [SpacesService, SpaceAccessService],
})
export class SpacesModule {}
