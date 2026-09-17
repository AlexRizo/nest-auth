import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateEventTaskDto } from '../dto/create-event-task.dto';
import { UpdateEventTaskDto } from '../dto/update-event-task.dto';

@Injectable()
export class EventTaskService {
  create(
    tx: Prisma.TransactionClient,
    taskId: string,
    dto: CreateEventTaskDto,
  ) {
    return tx.eventTask.create({
      data: {
        taskId,
        place: dto.place,
        address: dto.address,
        organizer: dto.organizer,
        startDate: dto.startDate,
        status: dto.status,
        requirements: dto.requirements,
      },
    });
  }

  update(
    tx: Prisma.TransactionClient,
    taskId: string,
    dto: UpdateEventTaskDto,
  ) {
    return tx.eventTask.update({
      where: { taskId },
      data: {
        place: dto.place,
        address: dto.address,
        organizer: dto.organizer,
        startDate: dto.startDate,
        status: dto.status,
        requirements: dto.requirements,
      },
    });
  }
}
