import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("user"),
});

export const policeStations = pgTable("police_stations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  governorate: text("governorate").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ports = pgTable("ports", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const records = pgTable("records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recordNumber: serial("record_number").notNull().unique(),
  outgoingNumber: text("outgoing_number").notNull(),
  militaryNumber: text("military_number"),
  actionType: text("action_type"),
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
  policeStation: text("police_station"),
  createdAt: timestamp("created_at").defaultNow(),
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
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPoliceStation = z.infer<typeof insertPoliceStationSchema>;
export type PoliceStation = typeof policeStations.$inferSelect;
export type InsertPort = z.infer<typeof insertPortSchema>;
export type Port = typeof ports.$inferSelect;
export type InsertRecord = z.infer<typeof insertRecordSchema>;
export type Record = typeof records.$inferSelect;
