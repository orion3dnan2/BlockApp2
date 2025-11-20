import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, serial } from "drizzle-orm/pg-core";
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
  recordNumber: serial("record_number").notNull().unique(),
  outgoingNumber: text("outgoing_number").notNull(),
  militaryNumber: text("military_number"),
  ports: text("ports"),
  recordedNotes: text("recorded_notes"),
  firstName: text("first_name").notNull(),
  secondName: text("second_name").notNull(),
  thirdName: text("third_name").notNull(),
  fourthName: text("fourth_name").notNull(),
  tourDate: timestamp("tour_date").notNull(),
  rank: text("rank").notNull(),
  governorate: text("governorate").notNull(),
  office: text("office"),
  policeStation: text("police_station").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
});

export const insertRecordSchema = createInsertSchema(records).omit({
  id: true,
  recordNumber: true,
  createdAt: true,
}).extend({
  tourDate: z.union([z.date(), z.string()]).pipe(z.coerce.date()),
  office: z.string().nullish().transform(val => val || null),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertRecord = z.infer<typeof insertRecordSchema>;
export type Record = typeof records.$inferSelect;
