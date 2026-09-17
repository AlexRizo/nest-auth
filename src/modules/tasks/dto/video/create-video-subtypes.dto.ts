import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { VideoN4FocusEnum, VideoSizePresetEnum } from '@prisma/client';
import {
  CreateVideoSceneG2Dto,
  CreateVideoSceneM1Dto,
  CreateVideoSceneN3Dto,
} from './create-video-scene.dto';

// Reel G1: guion único generado por IA a partir de promptAnswers.
export class CreateVideoTaskG1Dto {
  @IsObject()
  promptAnswers: Record<string, unknown>;
}

// Reel M1: máx. 5 escenas libres.
export class CreateVideoTaskM1Dto {
  @IsString()
  @MinLength(1)
  place: string;

  @IsString()
  @MinLength(1)
  participants: string;

  @IsString()
  @MinLength(1)
  subject: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => CreateVideoSceneM1Dto)
  scenes: CreateVideoSceneM1Dto[];
}

// Reel G2: 6 escenas fijas (una por cada VideoSceneG2KindEnum).
export class CreateVideoTaskG2Dto {
  @IsArray()
  @ArrayMinSize(6)
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => CreateVideoSceneG2Dto)
  scenes: CreateVideoSceneG2Dto[];
}

// Video N3: escenas libres e ilimitadas, guion escrito a mano.
export class CreateVideoTaskN3Dto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateVideoSceneN3Dto)
  scenes: CreateVideoSceneN3Dto[];
}

// Video N4: sizePreset o customWidth/customHeight, no ambos.
export class CreateVideoTaskN4Dto {
  @IsString()
  @MinLength(1)
  idea: string;

  @IsEnum(VideoN4FocusEnum)
  focus: VideoN4FocusEnum;

  @IsOptional()
  @IsEnum(VideoSizePresetEnum)
  sizePreset?: VideoSizePresetEnum;

  @ValidateIf((dto: CreateVideoTaskN4Dto) => !dto.sizePreset)
  @IsInt()
  @Min(1)
  customWidth?: number;

  @ValidateIf((dto: CreateVideoTaskN4Dto) => !dto.sizePreset)
  @IsInt()
  @Min(1)
  customHeight?: number;
}
