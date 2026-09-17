import { PartialType } from '@nestjs/mapped-types';
import { CreateEventTaskDto } from './create-event-task.dto';

export class UpdateEventTaskDto extends PartialType(CreateEventTaskDto) {}
