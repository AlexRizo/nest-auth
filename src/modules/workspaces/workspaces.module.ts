import { Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [WorkspacesController],
  providers: [WorkspacesService],
  exports: [WorkspacesService],
  imports: [PrismaModule],
})
export class WorkspacesModule {}
