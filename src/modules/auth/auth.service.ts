import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { SessionService } from './session.service';
import type Redis from 'ioredis';
import { envs } from 'src/config/env';
import { RegisterUserDto } from './dto/register-user.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private readonly isProd = envs.NODE_ENV === 'production';
  private readonly accessTtlSec = envs.ACCESS_TTL_SEC;
  private readonly pre2faTtlSec = 5 * 60;

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
    private readonly sessions: SessionService,
    @Inject(envs.REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async register(dto: RegisterUserDto) {
    const user = await this.usersService.create(dto);

    return user;
  }
}
