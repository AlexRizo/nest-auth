import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseBoolPipe,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TaskTypeEnum, type Workspace } from '@prisma/client';
import { TasksService } from './tasks.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentWorkspace } from '../auth/decorators/current-workspace.decorator';
import { type AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { WorkspaceSpaceAccessGuard } from '../auth/guards/workspace-space-access.guard';

// Vista general del dashboard del Workspace (fuera de un Space): tareas de
// todos los Spaces disponibles para el usuario. Ver CLAUDE.md > Permisos
// sobre Tareas.
@UseGuards(WorkspaceSpaceAccessGuard)
@Controller('workspaces/:workspaceTerm/tasks')
export class WorkspaceTasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(
    @CurrentWorkspace() workspace: Workspace,
    @CurrentUser() user: AuthenticatedUser,
    @Query('take', new DefaultValuePipe(25), ParseIntPipe) take: number,
    @Query('mine', new DefaultValuePipe(false), ParseBoolPipe) mine: boolean,
    @Query('type', new ParseEnumPipe(TaskTypeEnum, { optional: true }))
    type?: TaskTypeEnum,
  ) {
    return this.tasksService.findAllForWorkspace(
      workspace.id,
      user,
      take,
      mine,
      type,
    );
  }
}
