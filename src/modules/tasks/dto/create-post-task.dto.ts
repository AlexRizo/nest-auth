import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { SocialNetworkEnum } from '@prisma/client';
import { CreateTaskBaseDto } from './create-task-base.dto';

// referenceTaskId apunta a la tarea de VIDEO o DESIGN que se va a publicar;
// se valida en el service, no aquí (el schema no lo restringe). Ver
// prisma/schema.prisma > model PostTask.
export class CreatePostTaskDto extends CreateTaskBaseDto {
  @IsString()
  @MinLength(1)
  postTitle: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsEnum(SocialNetworkEnum, { each: true })
  socialNetworks: SocialNetworkEnum[];

  @IsOptional()
  @IsUUID()
  referenceTaskId?: string;
}
