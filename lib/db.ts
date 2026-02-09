import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/db/schema';

function getDb() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Please set it in your .env.local file or Vercel environment variables.'
    );
  }

  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}

// Lazy initialization - only create connection when needed
let _db: ReturnType<typeof getDb> | null = null;

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_, prop) {
    if (!_db) {
      _db = getDb();
    }
    return (_db as Record<string | symbol, unknown>)[prop];
  },
});
