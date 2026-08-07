import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Space, UserRoleEnum } from '@prisma/client';
import { isUUID } from 'class-validator';
import { Request } from 'express';
import { AuthenticatedUser } from 'src/modules/auth/interfaces/jwt-payload.interface';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class WorkspaceSpaceAccessGuard {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext) {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser;

    const { workspaceTerm, spaceTerm } = request.params as {
      workspaceTerm: string;
      spaceTerm?: string;
    };

    const workspace = await this.prisma.workspace.findFirst({
      where: isUUID(workspaceTerm)
        ? { id: workspaceTerm }
        : { code: workspaceTerm },
    });

    if (!workspace) throw new NotFoundException('Workspace no encontrado');

    let space: Space | null = null;

    if (spaceTerm) {
      space = await this.prisma.space.findFirst({
        where: {
          workspaceId: workspace.id,
          ...(isUUID(spaceTerm) ? { id: spaceTerm } : { code: spaceTerm }),
        },
      });

      if (!space) throw new NotFoundException('Space no encontrado');
    }

    if (user.role !== UserRoleEnum.ADMIN) {
      const workspaceGrant = await this.prisma.accessGrant.findUnique({
        where: {
          userId_workspaceId: { userId: user.id, workspaceId: workspace.id },
        },
      });

      if (!workspaceGrant)
        throw new ForbiddenException('No tienes acceso al workspace');

      if (space) {
        const spaceGrant = await this.prisma.accessGrant.findUnique({
          where: {
            userId_spaceId: { userId: user.id, spaceId: space.id },
          },
        });

        if (!spaceGrant)
          throw new ForbiddenException('No tienes acceso al space');
      }
    }

    request.workspace = workspace;
    if (space) request.space = space;

    return true;
  }
}
