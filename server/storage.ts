import { users, records, type User, type InsertUser, type Record, type InsertRecord } from "@shared/schema";
import { db } from "./db";
import { eq, and, like, gte, lte, or } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  deleteUser(id: string): Promise<boolean>;

  // Record methods
  getRecords(): Promise<Record[]>;
  getRecordById(id: string): Promise<Record | undefined>;
  createRecord(record: InsertRecord): Promise<Record>;
  updateRecord(id: string, record: Partial<InsertRecord>): Promise<Record | undefined>;
  deleteRecord(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    return result.length > 0;
  }

  // Record methods
  async getRecords(): Promise<Record[]> {
    return await db.select().from(records).orderBy(records.createdAt);
  }

  async getRecordById(id: string): Promise<Record | undefined> {
    const [record] = await db.select().from(records).where(eq(records.id, id));
    return record || undefined;
  }


  async createRecord(insertRecord: InsertRecord): Promise<Record> {
    const [record] = await db
      .insert(records)
      .values(insertRecord)
      .returning();
    return record;
  }

  async updateRecord(id: string, updateData: Partial<InsertRecord>): Promise<Record | undefined> {
    const [record] = await db
      .update(records)
      .set(updateData)
      .where(eq(records.id, id))
      .returning();
    return record || undefined;
  }

  async deleteRecord(id: string): Promise<boolean> {
    const result = await db
      .delete(records)
      .where(eq(records.id, id))
      .returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
