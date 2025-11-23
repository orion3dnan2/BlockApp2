import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from "@shared/schema";

const databaseUrl = process.env.DATABASE_URL || "mysql://root:@localhost:3306/blocksystem";

// Parse DATABASE_URL properly for mysql2
const pool = mysql.createPool(databaseUrl);

export const db = drizzle({ client: pool, schema, mode: 'default' });
