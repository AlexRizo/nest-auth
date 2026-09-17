import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, TaskTypeEnum } from '@prisma/client';
import { CreatePostTaskDto } from '../dto/create-post-task.dto';
import { UpdatePostTaskDto } from '../dto/update-post-task.dto';

@Injectable()
export class PostTaskService {
  async create(
    tx: Prisma.TransactionClient,
    taskId: string,
    dto: CreatePostTaskDto,
  ) {
    await this.assertValidReference(tx, dto.referenceTaskId);

    return tx.postTask.create({
      data: {
        taskId,
        postTitle: dto.postTitle,
        content: dto.content,
        socialNetworks: dto.socialNetworks,
        referenceTaskId: dto.referenceTaskId,
      },
    });
  }

  async update(
    tx: Prisma.TransactionClient,
    taskId: string,
    dto: UpdatePostTaskDto,
  ) {
    await this.assertValidReference(tx, dto.referenceTaskId);

    return tx.postTask.update({
      where: { taskId },
      data: {
        postTitle: dto.postTitle,
        content: dto.content,
        socialNetworks: dto.socialNetworks,
        referenceTaskId: dto.referenceTaskId,
      },
    });
  }

  private async assertValidReference(
    tx: Prisma.TransactionClient,
    referenceTaskId: string | undefined,
  ) {
    if (!referenceTaskId) return;

    const referenceTask = await tx.task.findUnique({
      where: { id: referenceTaskId },
      select: { type: true },
    });

    if (
      !referenceTask ||
      (referenceTask.type !== TaskTypeEnum.DESIGN &&
        referenceTask.type !== TaskTypeEnum.VIDEO)
    ) {
      throw new BadRequestException(
        'referenceTaskId debe apuntar a una tarea de tipo DESIGN o VIDEO',
      );
    }
  }
}
