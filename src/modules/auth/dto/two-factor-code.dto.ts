import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class TwoFactorCodeDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'El código debe ser de 6 dígitos' })
  code: string;
}
