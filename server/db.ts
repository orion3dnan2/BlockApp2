import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from "@shared/schema";

// Allow missing DATABASE_URL for development/testing
// In production, MySQL connection will fail and should be properly configured
const databaseUrl = process.env.DATABASE_URL || "mysql://root:@localhost:3306/blocksystem_dev";

const pool = mysql.createPool({
  uri: databaseUrl,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
});

export const db = drizzle({ client: pool, schema, mode: 'default' });
