import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from "@shared/schema";

const databaseUrl = process.env.DATABASE_URL || "mysql://root:@localhost:3306/blocksystem";

const pool = mysql.createPool({
  uri: databaseUrl,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = drizzle({ client: pool, schema, mode: 'default' });
