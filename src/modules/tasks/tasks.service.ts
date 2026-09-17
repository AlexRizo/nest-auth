import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TaskTypeEnum, UserRoleEnum } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { CreateTaskBaseDto } from './dto/create-task-base.dto';
import { CreateDesignTaskDto } from './dto/create-design-task.dto';
import { CreateEventTaskDto } from './dto/create-event-task.dto';
import { CreatePostTaskDto } from './dto/create-post-task.dto';
import { CreateVideoTaskDto } from './dto/create-video-task.dto';
import { UpdateDesignTaskDto } from './dto/update-design-task.dto';
import { UpdateEventTaskDto } from './dto/update-event-task.dto';
import { UpdatePostTaskDto } from './dto/update-post-task.dto';
import { UpdateVideoTaskDto } from './dto/update-video-task.dto';
import { DesignTaskService } from './services/design-task.service';
import { EventTaskService } from './services/event-task.service';
import { PostTaskService } from './services/post-task.service';
import { VideoTaskService } from './services/video-task.service';

// Datos mínimos de autor/asignados/space que necesita cualquier listado de
// tareas (kanban de Space y de Workspace) para pintar avatares y el badge
// de Space sin traer los objetos User/Space completos.
const TASK_LIST_INCLUDE = {
  author: { select: { id: true, name: true, username: true, avatar: true } },
  assignees: {
    select: { id: true, name: true, username: true, avatar: true },
  },
  space: { select: { id: true, name: true, code: true, color: true } },
} satisfies Prisma.TaskInclude;

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly designTaskService: DesignTaskService,
    private readonly eventTaskService: EventTaskService,
    private readonly postTaskService: PostTaskService,
    private readonly videoTaskService: VideoTaskService,
  ) {}

  private readonly logger = new Logger(TasksService.name);

  createDesignTask(
    spaceId: string,
    author: AuthenticatedUser,
    dto: CreateDesignTaskDto,
  ) {
    return this.createTask(
      spaceId,
      author,
      TaskTypeEnum.DESIGN,
      dto,
      (tx, taskId) => this.designTaskService.create(tx, taskId, dto),
    );
  }

  createEventTask(
    spaceId: string,
    author: AuthenticatedUser,
    dto: CreateEventTaskDto,
  ) {
    return this.createTask(
      spaceId,
      author,
      TaskTypeEnum.EVENT,
      dto,
      (tx, taskId) => this.eventTaskService.create(tx, taskId, dto),
    );
  }

  createPostTask(
    spaceId: string,
    author: AuthenticatedUser,
    dto: CreatePostTaskDto,
  ) {
    return this.createTask(
      spaceId,
      author,
      TaskTypeEnum.POST,
      dto,
      (tx, taskId) => this.postTaskService.create(tx, taskId, dto),
    );
  }

  createVideoTask(
    spaceId: string,
    author: AuthenticatedUser,
    dto: CreateVideoTaskDto,
  ) {
    return this.createTask(
      spaceId,
      author,
      TaskTypeEnum.VIDEO,
      dto,
      (tx, taskId) => this.videoTaskService.create(tx, taskId, dto),
    );
  }

  findAllForSpace(spaceId: string, user: AuthenticatedUser, take = 25) {
    return this.prisma.task.findMany({
      where: { spaceId, ...this.visibilityFilter(user) },
      orderBy: { createdAt: 'desc' },
      take,
      include: TASK_LIST_INCLUDE,
    });
  }

  // Vista general de Workspace (fuera de un Space): tareas de todos los
  // Spaces disponibles para el usuario. Ver CLAUDE.md > Permisos sobre
  // Tareas.
  findAllForWorkspace(workspaceId: string, user: AuthenticatedUser, take = 25) {
    return this.prisma.task.findMany({
      where: { space: { workspaceId }, ...this.visibilityFilter(user) },
      orderBy: { createdAt: 'desc' },
      take,
      include: TASK_LIST_INCLUDE,
    });
  }

  async findOne(taskId: string, user: AuthenticatedUser) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, ...this.visibilityFilter(user) },
      include: {
        author: true,
        assignees: true,
        eventDetails: true,
        designDetails: true,
        postDetails: true,
        videoDetails: {
          include: {
            g1: true,
            m1: { include: { scenes: true } },
            g2: { include: { scenes: true } },
            n3: { include: { scenes: true } },
            n4: true,
          },
        },
      },
    });

    if (!task) throw new NotFoundException('Tarea no encontrada');

    return task;
  }

  async remove(taskId: string, user: AuthenticatedUser) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });
    if (!task) throw new NotFoundException('Tarea no encontrada');

    this.assertCanMutate(task, user);

    await this.prisma.task.delete({ where: { id: taskId } });
  }

  updateDesignTask(
    taskId: string,
    user: AuthenticatedUser,
    dto: UpdateDesignTaskDto,
  ) {
    return this.updateTask(taskId, user, dto, (tx, id) =>
      this.designTaskService.update(tx, id, dto),
    );
  }

  updateEventTask(
    taskId: string,
    user: AuthenticatedUser,
    dto: UpdateEventTaskDto,
  ) {
    return this.updateTask(taskId, user, dto, (tx, id) =>
      this.eventTaskService.update(tx, id, dto),
    );
  }

  updatePostTask(
    taskId: string,
    user: AuthenticatedUser,
    dto: UpdatePostTaskDto,
  ) {
    return this.updateTask(taskId, user, dto, (tx, id) =>
      this.postTaskService.update(tx, id, dto),
    );
  }

  updateVideoTask(
    taskId: string,
    user: AuthenticatedUser,
    dto: UpdateVideoTaskDto,
  ) {
    return this.updateTask(taskId, user, dto, (tx, id) =>
      this.videoTaskService.update(tx, id, dto),
    );
  }

  // Ver: ADMIN/CLIENT_ADMIN/CLIENT ven todo lo que cae dentro del scope de
  // Workspace/Space ya validado por WorkspaceSpaceAccessGuard. STAFF y
  // CLIENT_STAFF solo ven las tareas que crearon o en las que están
  // asignados. Ver esquema de roles del proyecto.
  private visibilityFilter(user: AuthenticatedUser): Prisma.TaskWhereInput {
    if (
      user.role === UserRoleEnum.STAFF ||
      user.role === UserRoleEnum.CLIENT_STAFF
    ) {
      return {
        OR: [{ authorId: user.id }, { assignees: { some: { id: user.id } } }],
      };
    }

    return {};
  }

  // Editar/Eliminar: solo ADMIN, CLIENT_ADMIN o el creador de la tarea.
  // Estar asignado no da derecho a editar ni eliminar.
  private assertCanMutate(task: { authorId: string }, user: AuthenticatedUser) {
    const isPrivileged =
      user.role === UserRoleEnum.ADMIN ||
      user.role === UserRoleEnum.CLIENT_ADMIN;

    if (!isPrivileged && task.authorId !== user.id) {
      throw new ForbiddenException(
        'Solo el creador de la tarea puede editarla o eliminarla',
      );
    }
  }

  private async updateTask<T extends Partial<CreateTaskBaseDto>>(
    taskId: string,
    user: AuthenticatedUser,
    dto: T,
    updateDetails: (
      tx: Prisma.TransactionClient,
      taskId: string,
    ) => Promise<unknown>,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const task = await tx.task.findUnique({ where: { id: taskId } });
        if (!task) throw new NotFoundException('Tarea no encontrada');

        this.assertCanMutate(task, user);

        const updated = await tx.task.update({
          where: { id: taskId },
          data: {
            title: dto.title,
            description: dto.description,
            priority: dto.priority,
            dueDate: dto.dueDate,
            ...(dto.assigneeIds && {
              assignees: { set: dto.assigneeIds.map((id) => ({ id })) },
            }),
          },
        });

        await updateDetails(tx, taskId);

        return updated;
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(error);
      throw new InternalServerErrorException(
        'Ha ocurrido un error al actualizar la tarea',
      );
    }
  }

  private async createTask<T extends CreateTaskBaseDto>(
    spaceId: string,
    author: AuthenticatedUser,
    type: TaskTypeEnum,
    dto: T,
    createDetails: (
      tx: Prisma.TransactionClient,
      taskId: string,
    ) => Promise<unknown>,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const task = await tx.task.create({
          data: {
            title: dto.title,
            description: dto.description,
            type,
            priority: dto.priority,
            dueDate: dto.dueDate,
            authorId: author.id,
            spaceId,
            ...(dto.assigneeIds?.length && {
              assignees: { connect: dto.assigneeIds.map((id) => ({ id })) },
            }),
          },
        });

        await createDetails(tx, task.id);

        return task;
      });
    } catch (error) {
      // Los errores de validación de negocio (ej. referenceTaskId inválido)
      // se lanzan como HttpException dentro de la transacción y deben
      // propagarse tal cual, no envolverse en un 500 genérico.
      if (error instanceof HttpException) throw error;

      this.logger.error(error);
      throw new InternalServerErrorException(
        'Ha ocurrido un error al crear la tarea',
      );
    }
  }
}
