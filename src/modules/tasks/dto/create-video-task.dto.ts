import { Type } from 'class-transformer';
import { IsEnum, ValidateIf, ValidateNested } from 'class-validator';
import { VideoTypeEnum } from '@prisma/client';
import { CreateTaskBaseDto } from './create-task-base.dto';
import {
  CreateVideoTaskG1Dto,
  CreateVideoTaskG2Dto,
  CreateVideoTaskM1Dto,
  CreateVideoTaskN3Dto,
  CreateVideoTaskN4Dto,
} from './video/create-video-subtypes.dto';

// videoType decide cuál de los 5 payloads (g1/m1/g2/n3/n4) se usa; solo el
// que corresponde debe venir en el body. Ver prisma/schema.prisma > model
// VideoTask.
export class CreateVideoTaskDto extends CreateTaskBaseDto {
  @IsEnum(VideoTypeEnum)
  videoType: VideoTypeEnum;

  @ValidateIf(
    (dto: CreateVideoTaskDto) => dto.videoType === VideoTypeEnum.REEL_G1,
  )
  @ValidateNested()
  @Type(() => CreateVideoTaskG1Dto)
  g1?: CreateVideoTaskG1Dto;

  @ValidateIf(
    (dto: CreateVideoTaskDto) => dto.videoType === VideoTypeEnum.REEL_M1,
  )
  @ValidateNested()
  @Type(() => CreateVideoTaskM1Dto)
  m1?: CreateVideoTaskM1Dto;

  @ValidateIf(
    (dto: CreateVideoTaskDto) => dto.videoType === VideoTypeEnum.REEL_G2,
  )
  @ValidateNested()
  @Type(() => CreateVideoTaskG2Dto)
  g2?: CreateVideoTaskG2Dto;

  @ValidateIf(
    (dto: CreateVideoTaskDto) => dto.videoType === VideoTypeEnum.VIDEO_N3,
  )
  @ValidateNested()
  @Type(() => CreateVideoTaskN3Dto)
  n3?: CreateVideoTaskN3Dto;

  @ValidateIf(
    (dto: CreateVideoTaskDto) => dto.videoType === VideoTypeEnum.VIDEO_N4,
  )
  @ValidateNested()
  @Type(() => CreateVideoTaskN4Dto)
  n4?: CreateVideoTaskN4Dto;
}
