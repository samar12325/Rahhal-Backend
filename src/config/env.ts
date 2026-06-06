import { envSchema } from './env.schema';

export function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      '❌ Invalid environment variables:',
      parsed.error.flatten().fieldErrors,
    );
    process.exit(1);
  }
  return parsed.data;
}
