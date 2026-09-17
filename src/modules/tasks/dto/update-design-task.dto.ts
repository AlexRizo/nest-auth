import { PartialType } from '@nestjs/mapped-types';
import { CreateDesignTaskDto } from './create-design-task.dto';

export class UpdateDesignTaskDto extends PartialType(CreateDesignTaskDto) {}
