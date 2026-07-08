import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { AuthService } from '../auth.service';
import { cookieExtractor } from '../helpers/cookies';
import { envs } from 'src/config/env';
import { AccessTokenPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly sessions: any,
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

    const sessionActive = await this.sessions.
  }
}
| 