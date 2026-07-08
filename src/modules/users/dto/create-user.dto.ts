import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message: 'username solo puede contener letras, números, ".", "-" y "_"',
  })
  @Length(3, 20, {
    message: 'El nombre de usuario debe tener entre 3 y 20 caracteres',
  })
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, {
    message: 'La contraseña debe tener 8 caracteres como mínimo',
  })
  @MaxLength(72, {
    message: 'La contraseña debe tener 72 caracteres como máximo',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100, {
    message: 'El nombre debe tener 100 caracteres como máximo',
  })
  name: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
