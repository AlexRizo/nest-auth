import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateDesignTaskDto } from '../dto/create-design-task.dto';
import { UpdateDesignTaskDto } from '../dto/update-design-task.dto';

@Injectable()
export class DesignTaskService {
  create(
    tx: Prisma.TransactionClient,
    taskId: string,
    dto: CreateDesignTaskDto,
  ) {
    return tx.designTask.create({
      data: {
        taskId,
        designType: dto.designType,
        orientation: dto.orientation,
        detail: dto.detail,
        size: dto.size,
        printType: dto.printType,
        inkCount: dto.inkCount,
      },
    });
  }

  update(
    tx: Prisma.TransactionClient,
    taskId: string,
    dto: UpdateDesignTaskDto,
  ) {
    return tx.designTask.update({
      where: { taskId },
      data: {
        designType: dto.designType,
        orientation: dto.orientation,
        detail: dto.detail,
        size: dto.size,
        printType: dto.printType,
        inkCount: dto.inkCount,
      },
    });
  }
}
