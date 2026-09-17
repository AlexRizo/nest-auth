import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { WorkspaceTasksController } from './workspace-tasks.controller';
import { TasksService } from './tasks.service';
import { DesignTaskService } from './services/design-task.service';
import { EventTaskService } from './services/event-task.service';
import { PostTaskService } from './services/post-task.service';
import { VideoTaskService } from './services/video-task.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TasksController, WorkspaceTasksController],
  providers: [
    TasksService,
    DesignTaskService,
    EventTaskService,
    PostTaskService,
    VideoTaskService,
  ],
  exports: [TasksService],
})
export class TasksModule {}
