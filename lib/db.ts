import { neon } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '@/db/schema';

type DbType = NeonHttpDatabase<typeof schema>;

let db: DbType;

export function getDb(): DbType {
  if (!db) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error(
        'DATABASE_URL environment variable is not set. ' +
        'Please set it in your .env.local file or Vercel environment variables.'
      );
    }

    const sql = neon(connectionString);
    db = drizzle(sql, { schema });
  }

  return db;
}

export { db };
