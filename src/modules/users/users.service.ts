import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { isEmail, isUUID } from 'class-validator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create({ email, username, ...rest }: CreateUserDto) {
    const emailExists = await this.findOneOrNull(email);

    if (emailExists) throw new ConflictException(`El email ya existe`);

    const uName = await this.findOneOrNull(username);

    if (uName) throw new ConflictException(`El nombre de usuario ya existe`);

    try {
      return await this.prisma.user.create({
        data: {
          email,
          username,
          ...rest,
        },
      });
    } catch (error) {
      this.logger.error(
        'Ha ocurrido un error al crear un usuario:',
        JSON.stringify(error),
      );
      throw new InternalServerErrorException(`Error al crear el usuario`);
    }
  }

  async findAll() {
    return await this.prisma.user.findMany();
  }

  async findOne(term: string) {
    const user = await this.findOneOrNull(term);

    if (!user) throw new NotFoundException(`Usuario no encontrado`);

    return user;
  }

  async findOneOrNull(term: string) {
    const where = isUUID(term)
      ? { id: term }
      : isEmail(term)
        ? { email: term }
        : { username: term };

    return await this.prisma.user.findUnique({ where });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
