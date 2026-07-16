import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { PrismaService } from '../prisma/prisma.service';
import { nanoid } from 'nanoid';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly logger = new Logger(WorkspacesService.name);

  async findOne(term: string) {
    const where = isUUID(term) ? { id: term } : { code: term };

    const workspace = await this.prisma.workspace.findUnique({
      where,
    });

    if (!workspace) {
      throw new NotFoundException('Workspace no encontrado');
    }

    return workspace;
  }

  async findAll() {
    return this.prisma.workspace.findMany();
  }

  async create(workspaceDto: CreateWorkspaceDto) {
    try {
      const workspace = await this.prisma.workspace.create({
        data: {
          ...workspaceDto,
          code: nanoid(12),
        },
      });

      return workspace;
    } catch (error) {
      this.logger.error(JSON.stringify(error));
      throw new InternalServerErrorException('Error al crear el workspace');
    }
  }

  async update(workspaceId: string, workspaceDto: UpdateWorkspaceDto) {
    await this.findOne(workspaceId);

    try {
      const workspace = await this.prisma.workspace.update({
        where: {
          id: workspaceId,
        },
        data: {
          ...workspaceDto,
        },
      });

      return workspace;
    } catch (error) {
      this.logger.error(JSON.stringify(error));
      throw new InternalServerErrorException(
        'Error al actualizar el workspace',
      );
    }
  }
}
