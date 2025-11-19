import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
});

export const records = pgTable("records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inventoryNumber: text("inventory_number").notNull(),
  registrationNumber: text("registration_number").notNull(),
  civilRegistrationNumber: text("civil_registration_number").notNull(),
  name: text("name").notNull(),
  governorate: text("governorate").notNull(),
  region: text("region").notNull(),
  reportType: text("report_type").notNull(),
  date: timestamp("date").notNull(),
  notes: text("notes"),
  additionalNotes: text("additional_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
});

export const insertRecordSchema = createInsertSchema(records).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertRecord = z.infer<typeof insertRecordSchema>;
export type Record = typeof records.$inferSelect;
