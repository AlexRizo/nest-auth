import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

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
}
