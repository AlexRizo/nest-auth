import { IsHexColor, IsNotEmpty, IsString } from 'class-validator';

export class CreateSpaceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsHexColor()
  @IsNotEmpty()
  color: string;

  @IsString()
  @IsNotEmpty()
  workspaceCode: string;
}
