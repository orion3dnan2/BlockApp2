import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL || "mysql://root:@localhost:3306/blocksystem";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    url: databaseUrl,
  },
});
