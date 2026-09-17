import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsUUID, ValidateNested } from 'class-validator';

export class TaskAssignmentDto {
  @IsUUID()
  taskId: string;

  @IsUUID()
  userId: string;
}

export class BulkAssignTasksDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TaskAssignmentDto)
  assignments: TaskAssignmentDto[];
}
