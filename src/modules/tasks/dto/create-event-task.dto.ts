import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { EventRequirementEnum, EventStatusEnum } from '@prisma/client';
import { CreateTaskBaseDto } from './create-task-base.dto';

// Task.dueDate se usa como fecha/hora de finalización del evento; startDate
// es el inicio. Ver prisma/schema.prisma > model EventTask.
export class CreateEventTaskDto extends CreateTaskBaseDto {
  @IsString()
  @MinLength(1)
  place: string;

  @IsString()
  @MinLength(1)
  address: string;

  @IsString()
  @MinLength(1)
  organizer: string;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @IsOptional()
  @IsEnum(EventStatusEnum)
  status?: EventStatusEnum;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(EventRequirementEnum, { each: true })
  requirements?: EventRequirementEnum[];
}
