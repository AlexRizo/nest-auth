import 'dotenv/config';
import { treeifyError, z } from 'zod';

export const envSchema = z
  .object({
    PORT: z
      .string()
      .min(1, 'PORT is required')
      .transform((v) => Number(v)),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    REDIS: z.string().min(1, 'REDIS is required'),
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
