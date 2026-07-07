import { Session } from '@prisma/client';

export interface SessionMeta {
  userAgent?: string;
  ipAddress?: string;
}

export interface IssuedRefreshToken {
  cookieValue: string;
  session: Session;
}
