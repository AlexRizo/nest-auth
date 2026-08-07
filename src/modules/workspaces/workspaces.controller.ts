import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { type AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { type Workspace } from '@prisma/client';
import { SpacesService } from '../spaces/spaces.service';
import { CurrentWorkspace } from '../auth/decorators/current-workspace.decorator';
import { WorkspaceSpaceAccessGuard } from '../auth/guards/workspace-space-access.guard';

@UseGuards(WorkspaceSpaceAccessGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(
    private readonly workspacesService: WorkspacesService,
    private readonly spacesService: SpacesService,
  ) {}

  // ? get/me va primero que get/:term. Si los inviertes, todo cae a get/:term;
  @Get('/me')
  findMyWorkspaces(@CurrentUser() user: AuthenticatedUser) {
    return this.workspacesService.findMyWorkspaces(user.id);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.workspacesService.findOne(term);
  }

  @Get()
  findAll() {
    return this.workspacesService.findAll();
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() createWorkspaceDto: CreateWorkspaceDto) {
    return this.workspacesService.create(createWorkspaceDto);
  }

  @Patch(':workspaceId')
  update(
    @Param('workspaceId') workspaceId: string,
    @Body() workspaceDto: UpdateWorkspaceDto,
  ) {
    return this.workspacesService.update(workspaceId, workspaceDto);
  }

  @Get(':workspaceTerm/spaces')
  findAllUserSpaces(
    @CurrentWorkspace() workspace: Workspace,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.spacesService.findAllForUser(workspace.id, user);
  }
}
