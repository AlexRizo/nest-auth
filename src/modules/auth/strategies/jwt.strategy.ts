import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { AuthService } from '../auth.service';
import { cookieExtractor } from '../helpers/cookies';
import { envs } from 'src/config/env';
import { AccessTokenPayload } from '../interfaces/jwt-payload.interface';
import { SessionService } from '../session.service';
import { UserStatusEnum } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly sessions: SessionService,
  ) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: envs.JWT_SECRET,
    });
  }

  async validate(payload: AccessTokenPayload) {
    const onBlackList = await this.authService.isTokenBlacklisted(payload.jti);

    if (onBlackList) throw new UnauthorizedException('El token no es válido');

    const pre2fa = payload.pre2fa === true;

    const sessionActive = await this.sessions.isActive(payload.sid);

    if (!pre2fa && !sessionActive) {
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

    if (!user) {
      throw new UnauthorizedException();
    }

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
      pre2fa,
    };
  }
}
