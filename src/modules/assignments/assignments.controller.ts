import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { type Space } from '@prisma/client';
import { AssignmentsService } from './assignments.service';
import { BulkAssignTasksDto } from './dto/bulk-assign-tasks.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentSpace } from '../auth/decorators/current-space.decorator';
import { WorkspaceSpaceAccessGuard } from '../auth/guards/workspace-space-access.guard';

// Centro de asignaciones: solo ADMIN tiene acceso a esta vista y sus
// funciones (ver premisa del proyecto).
@Roles('ADMIN')
@UseGuards(WorkspaceSpaceAccessGuard)
@Controller('workspaces/:workspaceTerm/spaces/:spaceTerm/assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get('staff')
  findStaff(@CurrentSpace() space: Space) {
    return this.assignmentsService.findStaffForSpace(space.id);
  }

  @Patch()
  bulkAssign(@CurrentSpace() space: Space, @Body() dto: BulkAssignTasksDto) {
    return this.assignmentsService.bulkAssign(space.id, dto);
  }
}
