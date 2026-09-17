import { IsEnum, IsInt, IsString, Min, MinLength } from 'class-validator';
import { VideoSceneG2KindEnum } from '@prisma/client';

export class CreateVideoSceneM1Dto {
  @IsInt()
  @Min(1)
  sceneOrder: number;

  @IsString()
  @MinLength(1)
  prompt: string;
}

export class CreateVideoSceneG2Dto {
  @IsEnum(VideoSceneG2KindEnum)
  kind: VideoSceneG2KindEnum;

  @IsString()
  @MinLength(1)
  activity: string;
}

export class CreateVideoSceneN3Dto {
  @IsInt()
  @Min(1)
  sceneOrder: number;

  @IsString()
  @MinLength(1)
  script: string;
}
