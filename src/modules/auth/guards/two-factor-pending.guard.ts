import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthenticatedUser } from '../interfaces/jwt-payload.interface';

@Injectable()
export class TwoFactorPendingGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext) {
    const ok = await super.canActivate(context);

    if (!ok) return false;

    const user = context.switchToHttp().getRequest<Request>()
      .user as AuthenticatedUser;

    if (!user.pre2fa) {
      throw new UnauthorizedException(
        'Este endpoint requiere verificación 2FA',
      );
    }

    return true;
  }
}
