import { users, records, type User, type InsertUser, type Record, type InsertRecord } from "@shared/schema";
import { db } from "./db";
import { eq, and, like, gte, lte, or } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Record methods
  getRecords(): Promise<Record[]>;
  getRecordById(id: string): Promise<Record | undefined>;
  searchRecords(filters: {
    recordNumber?: string;
    outgoingNumber?: string;
    militaryNumber?: string;
    firstName?: string;
    secondName?: string;
    thirdName?: string;
    fourthName?: string;
    governorate?: string;
    rank?: string;
    office?: string;
    policeStation?: string;
    startDate?: Date;
    endDate?: Date;
    recordedNotes?: string;
  }): Promise<Record[]>;
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

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Record methods
  async getRecords(): Promise<Record[]> {
    return await db.select().from(records).orderBy(records.createdAt);
  }

  async getRecordById(id: string): Promise<Record | undefined> {
    const [record] = await db.select().from(records).where(eq(records.id, id));
    return record || undefined;
  }

  async searchRecords(filters: {
    recordNumber?: string;
    outgoingNumber?: string;
    militaryNumber?: string;
    firstName?: string;
    secondName?: string;
    thirdName?: string;
    fourthName?: string;
    governorate?: string;
    rank?: string;
    office?: string;
    policeStation?: string;
    startDate?: Date;
    endDate?: Date;
    recordedNotes?: string;
  }): Promise<Record[]> {
    const conditions = [];

    if (filters.recordNumber) {
      conditions.push(eq(records.recordNumber, parseInt(filters.recordNumber)));
    }
    if (filters.outgoingNumber) {
      conditions.push(like(records.outgoingNumber, `%${filters.outgoingNumber}%`));
    }
    if (filters.militaryNumber) {
      conditions.push(like(records.militaryNumber, `%${filters.militaryNumber}%`));
    }
    if (filters.firstName) {
      conditions.push(like(records.firstName, `%${filters.firstName}%`));
    }
    if (filters.secondName) {
      conditions.push(like(records.secondName, `%${filters.secondName}%`));
    }
    if (filters.thirdName) {
      conditions.push(like(records.thirdName, `%${filters.thirdName}%`));
    }
    if (filters.fourthName) {
      conditions.push(like(records.fourthName, `%${filters.fourthName}%`));
    }
    if (filters.governorate) {
      conditions.push(eq(records.governorate, filters.governorate));
    }
    if (filters.rank) {
      conditions.push(eq(records.rank, filters.rank));
    }
    if (filters.office) {
      conditions.push(eq(records.office, filters.office));
    }
    if (filters.policeStation) {
      conditions.push(eq(records.policeStation, filters.policeStation));
    }
    if (filters.startDate) {
      conditions.push(gte(records.tourDate, filters.startDate));
    }
    if (filters.endDate) {
      conditions.push(lte(records.tourDate, filters.endDate));
    }
    if (filters.recordedNotes) {
      conditions.push(like(records.recordedNotes, `%${filters.recordedNotes}%`));
    }

    if (conditions.length === 0) {
      return await this.getRecords();
    }

    return await db
      .select()
      .from(records)
      .where(and(...conditions))
      .orderBy(records.createdAt);
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
