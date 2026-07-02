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

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    if (updateUserDto.email) {
      const emailExists = await this.findOneOrNull(updateUserDto.email);

      if (emailExists && emailExists.id !== id)
        throw new ConflictException(`El email ya existe`);
    }

    if (updateUserDto.username) {
      const uName = await this.findOneOrNull(updateUserDto.username);

      if (uName && uName.id !== id)
        throw new ConflictException(`El nombre de usuario ya existe`);
    }

    try {
      const userToUpdate = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });

      return userToUpdate;
    } catch (error) {
      this.logger.error(
        'Ha ocurrido un error al actualizar el usuario:',
        JSON.stringify(error),
      );
      throw new InternalServerErrorException(`Error al actualizar el usuario`);
    }
  }

  async remove(id: string) {
    const user = await this.findOne(id);

    if (user.status === 'DELETED') {
      throw new ConflictException(`El usuario ya ha sido eliminado`);
    }

    try {
      await this.prisma.user.update({
        where: { id },
        data: { status: 'DELETED' },
      });

      return { ok: true };
    } catch (error) {
      this.logger.error(
        'Ha ocurrido un error al eliminar el usuario:',
        JSON.stringify(error),
      );
      throw new InternalServerErrorException(`Error al eliminar el usuario`);
    }
  }
}
