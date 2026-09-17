import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { type Space } from '@prisma/client';
import { TasksService } from './tasks.service';
import { CreateDesignTaskDto } from './dto/create-design-task.dto';
import { CreateEventTaskDto } from './dto/create-event-task.dto';
import { CreatePostTaskDto } from './dto/create-post-task.dto';
import { CreateVideoTaskDto } from './dto/create-video-task.dto';
import { UpdateDesignTaskDto } from './dto/update-design-task.dto';
import { UpdateEventTaskDto } from './dto/update-event-task.dto';
import { UpdatePostTaskDto } from './dto/update-post-task.dto';
import { UpdateVideoTaskDto } from './dto/update-video-task.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentSpace } from '../auth/decorators/current-space.decorator';
import { type AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { WorkspaceSpaceAccessGuard } from '../auth/guards/workspace-space-access.guard';

// CLIENT es de solo lectura (ver CLAUDE.md): puede acceder a los GET de este
// controller, pero no a crear/editar/eliminar. WorkspaceSpaceAccessGuard ya
// valida que el usuario tenga acceso al Workspace/Space de la ruta.
@UseGuards(WorkspaceSpaceAccessGuard)
@Controller('workspaces/:workspaceTerm/spaces/:spaceTerm/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(
    @CurrentSpace() space: Space,
    @CurrentUser() user: AuthenticatedUser,
    @Query('take', new DefaultValuePipe(25), ParseIntPipe) take: number,
  ) {
    return this.tasksService.findAllForSpace(space.id, user, take);
  }

  @Get(':taskId')
  findOne(
    @Param('taskId') taskId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tasksService.findOne(taskId, user);
  }

  @Roles('ADMIN', 'STAFF', 'CLIENT_ADMIN', 'CLIENT_STAFF')
  @Post('design')
  createDesign(
    @CurrentSpace() space: Space,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateDesignTaskDto,
  ) {
    return this.tasksService.createDesignTask(space.id, user, dto);
  }

  @Roles('ADMIN', 'STAFF', 'CLIENT_ADMIN', 'CLIENT_STAFF')
  @Post('event')
  createEvent(
    @CurrentSpace() space: Space,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateEventTaskDto,
  ) {
    return this.tasksService.createEventTask(space.id, user, dto);
  }

  @Roles('ADMIN', 'STAFF', 'CLIENT_ADMIN', 'CLIENT_STAFF')
  @Post('post')
  createPost(
    @CurrentSpace() space: Space,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePostTaskDto,
  ) {
    return this.tasksService.createPostTask(space.id, user, dto);
  }

  @Roles('ADMIN', 'STAFF', 'CLIENT_ADMIN', 'CLIENT_STAFF')
  @Post('video')
  createVideo(
    @CurrentSpace() space: Space,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateVideoTaskDto,
  ) {
    return this.tasksService.createVideoTask(space.id, user, dto);
  }

  // Editar/Eliminar se restringen más allá de @Roles: dentro de
  // TasksService se valida que sea ADMIN/CLIENT_ADMIN o el creador de la
  // tarea (ver esquema de roles del proyecto).
  @Roles('ADMIN', 'STAFF', 'CLIENT_ADMIN', 'CLIENT_STAFF')
  @Patch(':taskId/design')
  updateDesign(
    @Param('taskId') taskId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateDesignTaskDto,
  ) {
    return this.tasksService.updateDesignTask(taskId, user, dto);
  }

  @Roles('ADMIN', 'STAFF', 'CLIENT_ADMIN', 'CLIENT_STAFF')
  @Patch(':taskId/event')
  updateEvent(
    @Param('taskId') taskId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateEventTaskDto,
  ) {
    return this.tasksService.updateEventTask(taskId, user, dto);
  }

  @Roles('ADMIN', 'STAFF', 'CLIENT_ADMIN', 'CLIENT_STAFF')
  @Patch(':taskId/post')
  updatePost(
    @Param('taskId') taskId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePostTaskDto,
  ) {
    return this.tasksService.updatePostTask(taskId, user, dto);
  }

  @Roles('ADMIN', 'STAFF', 'CLIENT_ADMIN', 'CLIENT_STAFF')
  @Patch(':taskId/video')
  updateVideo(
    @Param('taskId') taskId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateVideoTaskDto,
  ) {
    return this.tasksService.updateVideoTask(taskId, user, dto);
  }

  @Roles('ADMIN', 'STAFF', 'CLIENT_ADMIN', 'CLIENT_STAFF')
  @Delete(':taskId')
  remove(
    @Param('taskId') taskId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tasksService.remove(taskId, user);
  }
}
