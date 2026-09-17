import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  DesignDetailEnum,
  DesignOrientationEnum,
  DesignTypeEnum,
  ShirtPrintTypeEnum,
} from '@prisma/client';
import { CreateTaskBaseDto } from './create-task-base.dto';

// orientation/detail no aplican para SHIRT/OTHER; printType/inkCount solo
// aplican para SHIRT (inkCount solo si printType = FLAT_INKS). Ver
// prisma/schema.prisma > model DesignTask.
export class CreateDesignTaskDto extends CreateTaskBaseDto {
  @IsEnum(DesignTypeEnum)
  designType: DesignTypeEnum;

  @ValidateIf(
    (dto: CreateDesignTaskDto) =>
      dto.designType !== DesignTypeEnum.SHIRT &&
      dto.designType !== DesignTypeEnum.OTHER,
  )
  @IsEnum(DesignOrientationEnum)
  orientation?: DesignOrientationEnum;

  @ValidateIf(
    (dto: CreateDesignTaskDto) =>
      dto.designType !== DesignTypeEnum.SHIRT &&
      dto.designType !== DesignTypeEnum.OTHER,
  )
  @IsEnum(DesignDetailEnum)
  detail?: DesignDetailEnum;

  @IsOptional()
  @IsString()
  size?: string;

  @ValidateIf(
    (dto: CreateDesignTaskDto) => dto.designType === DesignTypeEnum.SHIRT,
  )
  @IsEnum(ShirtPrintTypeEnum)
  printType?: ShirtPrintTypeEnum;

  @ValidateIf(
    (dto: CreateDesignTaskDto) =>
      dto.designType === DesignTypeEnum.SHIRT &&
      dto.printType === ShirtPrintTypeEnum.FLAT_INKS,
  )
  @IsInt()
  @Min(1)
  inkCount?: number;
}
