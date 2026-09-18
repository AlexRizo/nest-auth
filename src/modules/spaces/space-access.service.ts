import { Injectable } from '@nestjs/common';
import { UserRoleEnum } from '@prisma/client';
import { isUUID } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

// Misma lógica de resolución/acceso que WorkspaceSpaceAccessGuard, pero sin
// atarse a un ExecutionContext HTTP: la usa también el RealtimeGateway para
// validar el join a una sala de socket por workspace/space.
@Injectable()
export class SpaceAccessService {
  constructor(private readonly prisma: PrismaService) {}

  findWorkspace(term: string) {
    return this.prisma.workspace.findFirst({
      where: isUUID(term) ? { id: term } : { code: term },
    });
  }

  findSpace(workspaceId: string, term: string) {
    return this.prisma.space.findFirst({
      where: {
        workspaceId,
        ...(isUUID(term) ? { id: term } : { code: term }),
      },
    });
  }

  async hasSpaceAccess(user: AuthenticatedUser, spaceId: string) {
    if (user.role === UserRoleEnum.ADMIN) return true;

    const grant = await this.prisma.accessGrant.findUnique({
      where: { userId_spaceId: { userId: user.id, spaceId } },
    });

    return !!grant;
  }

  /** Resuelve workspace + space por code/uuid y confirma que el usuario
   * tiene acceso a ambos (ADMIN siempre pasa). Devuelve null si no existen
   * o si el usuario no tiene grant. */
  async resolveAccessibleSpace(
    user: AuthenticatedUser,
    workspaceTerm: string,
    spaceTerm: string,
  ) {
    const workspace = await this.findWorkspace(workspaceTerm);
    if (!workspace) return null;

    if (user.role !== UserRoleEnum.ADMIN) {
      const workspaceGrant = await this.prisma.accessGrant.findUnique({
        where: {
          userId_workspaceId: { userId: user.id, workspaceId: workspace.id },
        },
      });
      if (!workspaceGrant) return null;
    }

    const space = await this.findSpace(workspace.id, spaceTerm);
    if (!space) return null;

    if (!(await this.hasSpaceAccess(user, space.id))) return null;

    return space;
  }
}
