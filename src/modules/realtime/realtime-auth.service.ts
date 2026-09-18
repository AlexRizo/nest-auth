import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { parseCookie } from 'cookie';
import { UserStatusEnum } from '@prisma/client';
import { envs } from 'src/config/env';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { SessionService } from '../auth/session.service';
import { AUTH_COOKIES } from '../auth/helpers/cookies';
import {
  AccessTokenPayload,
  AuthenticatedUser,
} from '../auth/interfaces/jwt-payload.interface';

// Réplica de JwtStrategy.validate() para el handshake de sockets: ahí no
// hay Request de Express que pase por Passport, así que autenticamos a
// mano a partir del header "cookie" crudo del handshake.
@Injectable()
export class RealtimeAuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly sessions: SessionService,
  ) {}

  async authenticate(cookieHeader?: string): Promise<AuthenticatedUser> {
    const token = this.extractAccessToken(cookieHeader);
    if (!token) throw new UnauthorizedException('Falta el access token');

    let payload: AccessTokenPayload;
    try {
      payload = await this.jwt.verifyAsync<AccessTokenPayload>(token, {
        secret: envs.JWT_SECRET,
      });
    } catch {
      throw new UnauthorizedException('El token no es válido');
    }

    if (payload.pre2fa) {
      throw new UnauthorizedException('Verificación 2FA pendiente');
    }

    const onBlackList = await this.authService.isTokenBlacklisted(payload.jti);
    if (onBlackList) throw new UnauthorizedException('El token no es válido');

    const sessionActive = await this.sessions.isActive(payload.sid);
    if (!sessionActive) {
      throw new UnauthorizedException('La sesión ha expirado o es inválida');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        username: true,
        status: true,
        role: true,
      },
    });

    if (!user) throw new UnauthorizedException();

    if (
      user.status === UserStatusEnum.DELETED ||
      user.status === UserStatusEnum.SUSPENDED
    ) {
      throw new UnauthorizedException(
        'Existe un problema con tu cuenta, por favor contacta al soporte técnico',
      );
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      sessionId: payload.sid,
      jti: payload.jti,
      pre2fa: false,
    };
  }

  private extractAccessToken(cookieHeader?: string): string | null {
    if (!cookieHeader) return null;
    const cookies = parseCookie(cookieHeader);
    return cookies[AUTH_COOKIES.ACCESS_TOKEN] ?? null;
  }
}
