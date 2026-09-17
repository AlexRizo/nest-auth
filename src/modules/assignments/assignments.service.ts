import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRoleEnum } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BulkAssignTasksDto } from './dto/bulk-assign-tasks.dto';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  // Usuarios a los que se les puede asignar una tarea de este Space: STAFF
  // con AccessGrant explícito a él, más todos los ADMIN (que no necesitan
  // grant — tienen acceso implícito a todo — y pueden autoasignarse tareas
  // desde el centro de asignaciones).
  findStaffForSpace(spaceId: string) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { role: UserRoleEnum.STAFF, accessGrants: { some: { spaceId } } },
          { role: UserRoleEnum.ADMIN },
        ],
      },
      select: { id: true, name: true, username: true, avatar: true },
      orderBy: { name: 'asc' },
    });
  }

  async bulkAssign(spaceId: string, dto: BulkAssignTasksDto) {
    const taskIds = [...new Set(dto.assignments.map((a) => a.taskId))];
    const userIds = [...new Set(dto.assignments.map((a) => a.userId))];

    const [tasksInSpace, assignableUsers] = await Promise.all([
      this.prisma.task.count({ where: { id: { in: taskIds }, spaceId } }),
      this.prisma.user.count({
        where: {
          id: { in: userIds },
          OR: [
            { role: UserRoleEnum.STAFF, accessGrants: { some: { spaceId } } },
            { role: UserRoleEnum.ADMIN },
          ],
        },
      }),
    ]);

    if (tasksInSpace !== taskIds.length) {
      throw new BadRequestException(
        'Alguna de las tareas no pertenece a este Space',
      );
    }

    if (assignableUsers !== userIds.length) {
      throw new BadRequestException(
        'Alguno de los usuarios no es STAFF con acceso a este Space ni ADMIN',
      );
    }

    await this.prisma.$transaction(
      dto.assignments.map(({ taskId, userId }) =>
        this.prisma.task.update({
          where: { id: taskId },
          data: { assignees: { set: [{ id: userId }] } },
        }),
      ),
    );

    return { ok: true };
  }
}
