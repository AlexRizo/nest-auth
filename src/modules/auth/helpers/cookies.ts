import { Request } from 'express';

export const AUTH_COOKIES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export const cookieExtractor = (req: Request): string | null => {
  return (
    (req?.cookies as Record<string, string | undefined>)?.[
      AUTH_COOKIES.ACCESS_TOKEN
    ] ?? null
  );
};
