import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/db/schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL environment variable is not set. ' +
    'Please set it in your .env.local file or Vercel environment variables.'
  );
}

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
