import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { SessionService } from './session.service';
import type Redis from 'ioredis';
import { envs } from 'src/config/env';
import { RegisterUserDto } from './dto/register-user.dto';
import { UsersService } from '../users/users.service';
import { compareHash } from 'src/common/helpers/bcrypt';
import { AuthProviderEnum, User, UserStatusEnum } from '@prisma/client';
import { Request, Response } from 'express';
import { AccessTokenPayload } from './interfaces/jwt-payload.interface';
import { randomUUID } from 'crypto';
import { AUTH_COOKIES } from './helpers/cookies';
import { REDIS } from './helpers/redis';
import { GoogleProfilePayload } from './interfaces/google-profile-payload.interface';

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
    @Inject(REDIS.REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async register(dto: RegisterUserDto) {
    const user = await this.usersService.create(dto);

    return user;
  }

  async validateCredentials(email: string, password: string) {
    const user = await this.usersService.findOneOrNull(email);

    if (!user || !compareHash(password, user?.password || '')) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    this.assertUsable(user);

    return user;
  }

  private assertUsable(user: User) {
    if (
      user.status === UserStatusEnum.DELETED ||
      user.status === UserStatusEnum.SUSPENDED
    ) {
      throw new UnauthorizedException(
        'Existe un problema con tu cuenta, por favor contacta al soporte técnico',
      );
    }
  }

  // ? Métodos de LOGIN:

  async login(user: User, req: Request, res: Response) {
    this.assertUsable(user);

    if (user.twoFactorEnabled) {
      const partial = await this.signAccessToken({
        sub: user.id,
        sid: 'pre2fa',
        pre2fa: true,
      });

      this.setCookie(
        res,
        AUTH_COOKIES.ACCESS_TOKEN,
        partial,
        this.pre2faTtlSec * 1000,
      );

      return { twoFactorRequired: true as const };
    }

    return this.establishSession(user, req, res);
  }

  async establishSession(user: User, req: Request, res: Response) {
    const { cookieValue, session } = await this.sessions.create(user.id, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    const accessToken = await this.signAccessToken({
      sub: user.id,
      sid: session.id,
    });

    this.setCookie(
      res,
      AUTH_COOKIES.ACCESS_TOKEN,
      accessToken,
      this.accessTtlSec * 1000,
    );
    this.setCookie(
      res,
      AUTH_COOKIES.REFRESH_TOKEN,
      cookieValue,
      session.expiresAt.getTime() - Date.now(),
      '/api/v1/auth/refresh',
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      twoFactorRequired: false,
      user: this.toPublicUser(user),
    };
  }

  // ? Métodos de LOGOUT:

  async logout(sessionId: string, jti: string, res: Response) {
    if (sessionId !== 'pre2fa') {
      await this.sessions.revoke(sessionId);
    }

    await this.redis.set(
      REDIS.REDIS_KEYS.jwtBlacklist(jti),
      '1',
      'EX',
      this.accessTtlSec,
    );

    this.clearAuthCookies(res);
    return { ok: true };
  }

  async isTokenBlacklisted(jti: string) {
    return (await this.redis.exists(REDIS.REDIS_KEYS.jwtBlacklist(jti))) === 1;
  }

  // ? OAUTH GOOGLE:

  async validateOAuthUser(profile: GoogleProfilePayload) {
    const existing = await this.usersService.findOneOrNull(profile.email);

    if (existing) {
      this.assertUsable(existing);
      return this.prisma.user.update({
        where: { id: existing.id },
        data: {
          emailVerified: true,
          avatar: existing.avatar ?? profile.avatar,
          name: existing.name ?? profile.name,
        },
      });
    }

    return this.prisma.user.create({
      data: {
        email: profile.email,
        username: await this.uniqueUsername(profile.name ?? profile.email),
        name: profile.name ?? '',
        avatar: profile.avatar,
        authProvider: AuthProviderEnum.GOOGLE,
        emailVerified: true,
      },
    });
  }

  private async uniqueUsername(base: string) {
    const clean =
      base
        .toLocaleLowerCase()
        .replace(/[^a-z0-9_.-]/g, '')
        .slice(0, 24) || 'user';
    let candidate = clean;

    for (let i = 0; i < 5; i++) {
      const taken = await this.usersService.findOneOrNull(candidate);

      if (!taken) return candidate;
      candidate = `${clean}-${randomUUID().slice(0, 6)}`;
    }

    return `${clean}-${randomUUID().slice(0, 12)}`;
  }

  // ? Helpers

  private signAccessToken(payload: Omit<AccessTokenPayload, 'jti'>) {
    return this.jwt.signAsync(
      { ...payload, jti: randomUUID() },
      {
        expiresIn: payload.pre2fa ? this.pre2faTtlSec : this.accessTtlSec,
      },
    );
  }

  // ? Métodos de REFRESH:

  async refresh(req: Request, res: Response) {
    const cookieValue = (req.cookies as Record<string, string | undefined>)[
      AUTH_COOKIES.REFRESH_TOKEN
    ];

    if (!cookieValue) throw new UnauthorizedException('Sin refresh token');

    const { cookieValue: rotated, session } =
      await this.sessions.rotate(cookieValue);

    const user = await this.usersService.findOne(session.userId);

    this.assertUsable(user);

    const accessToken = await this.signAccessToken({
      sub: user.id,
      sid: session.id,
    });

    this.setCookie(
      res,
      AUTH_COOKIES.ACCESS_TOKEN,
      accessToken,
      this.accessTtlSec * 1000,
    );
    this.setCookie(
      res,
      AUTH_COOKIES.REFRESH_TOKEN,
      rotated,
      session.expiresAt.getTime() - Date.now(),
      '/api/v1/auth/refresh',
    );

    return { user: this.toPublicUser(user) };
  }

  private setCookie(
    res: Response,
    name: string,
    value: string,
    maxAgeMs: number,
    path = '/',
  ) {
    res.cookie(name, value, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: 'lax',
      path,
      maxAge: maxAgeMs,
    });
  }

  clearAuthCookies(res: Response) {
    const base = {
      httpOnly: true,
      secure: this.isProd,
      sameSite: 'lax' as const,
    };

    res.clearCookie(AUTH_COOKIES.ACCESS_TOKEN, {
      ...base,
      path: '/',
    });
    res.clearCookie(AUTH_COOKIES.REFRESH_TOKEN, {
      ...base,
      path: '/api/v1/auth/refresh',
    });
  }

  toPublicUser(user: User) {
    const { password, twoFactorSecret, ...rest } = user;

    void password;
    void twoFactorSecret;

    return rest;
  }
}
