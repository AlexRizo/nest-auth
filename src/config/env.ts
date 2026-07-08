import 'dotenv/config';
import { treeifyError, z } from 'zod';

const envSchema = z
  .object({
    PORT: z
      .string()
      .min(1, 'PORT is required')
      .transform((v) => Number(v)),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

    REDIS: z.string().min(1, 'REDIS is required'),
    REDIS_CLIENT: z.string().min(1, 'REDIS_CLIENT is required'),
    REFRESH_TTL_DAYS: z
      .string()
      .min(1, 'REFRESH_TTL_DAYS is required')
      .transform(Number),

    SESSION_SECRET: z.string().min(1, 'SESSION_SECRET is required'),
    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),

    POSTGRES_USER: z.string().min(1, 'POSTGRES_USER is required'),
    POSTGRES_PASS: z.string().min(1, 'POSTGRES_PASS is required'),
    POSTGRES_DB: z.string().min(1, 'POSTGRES_DB is required'),

    ALLOWED_ORIGINS: z.string().min(1, 'ALLOWED_ORIGINS is required'),
  })
  .loose();

type EnvType = z.infer<typeof envSchema>;

const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
  const error = treeifyError(envParsed.error);
  const errorString = JSON.stringify(error, null, 2);

  throw new Error(`Invalid enviroment variables: ${errorString}`);
}

export const envs: EnvType = envParsed.data;
