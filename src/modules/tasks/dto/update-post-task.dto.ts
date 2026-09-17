import { PartialType } from '@nestjs/mapped-types';
import { CreatePostTaskDto } from './create-post-task.dto';

export class UpdatePostTaskDto extends PartialType(CreatePostTaskDto) {}
