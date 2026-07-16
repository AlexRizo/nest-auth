import { UserRoleEnum } from '@prisma/client';

export interface AccessTokenPayload {
  sub: string;
  sid: string;
  jti: string;
  pre2fa?: boolean;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  role: UserRoleEnum;
  sessionId: string;
  jti: string;
  pre2fa: boolean;
}
