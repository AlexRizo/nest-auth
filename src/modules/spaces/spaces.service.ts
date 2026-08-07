import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { PrismaService } from '../prisma/prisma.service';
import { UserRoleEnum } from '@prisma/client';
import { CreateSpaceDto } from './dto/create-space.dto';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { nanoid } from 'nanoid';

@Injectable()
export class SpacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  private readonly logger = new Logger(SpacesService.name);

  async findAllForUser(workspaceId: string, user: AuthenticatedUser) {
    const spaces = await this.prisma.space.findMany({
      where: {
        workspaceId,
        ...(user.role !== UserRoleEnum.ADMIN && {
          spaceGrants: { some: { userId: user.id } },
        }),
      },
    });

    return spaces;
  }

  async create({ workspaceCode, ...rest }: CreateSpaceDto) {
    const workspace = await this.workspacesService.findOne(workspaceCode);

    try {
      const space = await this.prisma.space.create({
        data: {
          ...rest,
          code: nanoid(12),
          workspaceId: workspace.id,
        },
      });

      return space;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Ha ocurrido un error al crear un space',
      );
    }
  }
}
