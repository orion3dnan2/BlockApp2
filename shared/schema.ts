import { sql } from "drizzle-orm";
import { mysqlTable, text, varchar, datetime, int } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("user"),
});

export const policeStations = mysqlTable("police_stations", {
  id: int("id").primaryKey().autoincrement(),
  name: text("name").notNull().unique(),
  governorate: text("governorate").notNull(),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const ports = mysqlTable("ports", {
  id: int("id").primaryKey().autoincrement(),
  name: text("name").notNull().unique(),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const records = mysqlTable("records", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  recordNumber: int("record_number").notNull().unique().autoincrement(),
  outgoingNumber: text("outgoing_number").notNull(),
  militaryNumber: text("military_number"),
  actionType: text("action_type"),
  ports: text("ports"),
  recordedNotes: text("recorded_notes"),
  firstName: text("first_name").notNull(),
  secondName: text("second_name").notNull(),
  thirdName: text("third_name").notNull(),
  fourthName: text("fourth_name").notNull(),
  tourDate: datetime("tour_date").notNull(),
  rank: text("rank").notNull(),
  governorate: text("governorate").notNull(),
  office: text("office"),
  policeStation: text("police_station"),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  role: true,
}).extend({
  role: z.enum(["admin", "supervisor", "user"]).default("user"),
});

export const insertPoliceStationSchema = createInsertSchema(policeStations).omit({
  id: true,
  createdAt: true,
});

export const insertPortSchema = createInsertSchema(ports).omit({
  id: true,
  createdAt: true,
});

export const insertRecordSchema = createInsertSchema(records).omit({
  id: true,
  recordNumber: true,
  createdAt: true,
}).extend({
  tourDate: z.union([z.date(), z.string()]).pipe(z.coerce.date()),
  office: z.string().nullish().transform(val => val || null),
  policeStation: z.string().nullish().transform(val => val || null),
  ports: z.string().nullish().transform(val => val || null),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPoliceStation = z.infer<typeof insertPoliceStationSchema>;
export type PoliceStation = typeof policeStations.$inferSelect;
export type InsertPort = z.infer<typeof insertPortSchema>;
export type Port = typeof ports.$inferSelect;
export type InsertRecord = z.infer<typeof insertRecordSchema>;
export type Record = typeof records.$inferSelect;
