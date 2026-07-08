import { envs } from 'src/config/env';

export const REDIS = {
  REDIS_CLIENT: Symbol(envs.REDIS_CLIENT),
  REDIS_KEYS: {
    jwtBlacklist: (jti: string) => `auth:blacklist:${jti}`,
  } as const,
};
