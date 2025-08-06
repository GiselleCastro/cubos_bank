import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config(); 

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']),
    API_COMPILANCE_CUBOS_BASE_URL: z.url(),
    API_COMPILANCE_CUBOS_TIMEOUT: z.string().regex(/^\d+$/).transform(Number),
    API_COMPILANCE_CUBOS_CLIENT:z.email(),
    API_COMPILANCE_CUBOS_SECRET: z.string().min(1),
    DATABASE_URL: z.url(),
    SERVER_PORT: z.string().regex(/^\d+$/).transform(Number),
    SERVER_HOST: z.string().min(1),
    JWT_SECRET: z.string().min(1),
    JWT_SECRET_EXPIRES_IN_SECONDS: z.string().regex(/^\d+$/).transform(Number),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Variáveis de ambiente inválidas:');
  process.exit(1); 
}

export const env = parsedEnv.data;