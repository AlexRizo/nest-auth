import { IsEnum } from 'class-validator';
import { TaskStatusEnum } from '@prisma/client';

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatusEnum)
  status: TaskStatusEnum;
}
