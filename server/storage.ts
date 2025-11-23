import { 
  users, records, policeStations, ports,
  type User, type InsertUser, 
  type Record, type InsertRecord,
  type PoliceStation, type InsertPoliceStation,
  type Port, type InsertPort
} from "@shared/schema";
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

  // Police Station methods
  getPoliceStations(): Promise<PoliceStation[]>;
  getPoliceStationById(id: number): Promise<PoliceStation | undefined>;
  createPoliceStation(station: InsertPoliceStation): Promise<PoliceStation>;
  updatePoliceStation(id: number, station: Partial<InsertPoliceStation>): Promise<PoliceStation | undefined>;
  deletePoliceStation(id: number): Promise<boolean>;

  // Port methods
  getPorts(): Promise<Port[]>;
  getPortById(id: number): Promise<Port | undefined>;
  createPort(port: InsertPort): Promise<Port>;
  updatePort(id: number, port: Partial<InsertPort>): Promise<Port | undefined>;
  deletePort(id: number): Promise<boolean>;

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
    await db
      .insert(users)
      .values(insertUser);
    const [user] = await db.select().from(users).where(eq(users.username, insertUser.username));
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    await db
      .update(users)
      .set(data)
      .where(eq(users.id, id));
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    await db.delete(users).where(eq(users.id, id));
    return true;
  }

  // Police Station methods
  async getPoliceStations(): Promise<PoliceStation[]> {
    return await db.select().from(policeStations).orderBy(policeStations.name);
  }

  async getPoliceStationById(id: number): Promise<PoliceStation | undefined> {
    const [station] = await db.select().from(policeStations).where(eq(policeStations.id, id));
    return station || undefined;
  }

  async createPoliceStation(insertStation: InsertPoliceStation): Promise<PoliceStation> {
    await db
      .insert(policeStations)
      .values(insertStation);
    const allStations = await db.select().from(policeStations).where(eq(policeStations.name, insertStation.name));
    return allStations[0];
  }

  async updatePoliceStation(id: number, data: Partial<InsertPoliceStation>): Promise<PoliceStation | undefined> {
    await db
      .update(policeStations)
      .set(data)
      .where(eq(policeStations.id, id));
    const [station] = await db.select().from(policeStations).where(eq(policeStations.id, id));
    return station || undefined;
  }

  async deletePoliceStation(id: number): Promise<boolean> {
    await db.delete(policeStations).where(eq(policeStations.id, id));
    return true;
  }

  // Port methods
  async getPorts(): Promise<Port[]> {
    return await db.select().from(ports).orderBy(ports.name);
  }

  async getPortById(id: number): Promise<Port | undefined> {
    const [port] = await db.select().from(ports).where(eq(ports.id, id));
    return port || undefined;
  }

  async createPort(insertPort: InsertPort): Promise<Port> {
    await db
      .insert(ports)
      .values(insertPort);
    const allPorts = await db.select().from(ports).where(eq(ports.name, insertPort.name));
    return allPorts[0];
  }

  async updatePort(id: number, data: Partial<InsertPort>): Promise<Port | undefined> {
    await db
      .update(ports)
      .set(data)
      .where(eq(ports.id, id));
    const [port] = await db.select().from(ports).where(eq(ports.id, id));
    return port || undefined;
  }

  async deletePort(id: number): Promise<boolean> {
    await db.delete(ports).where(eq(ports.id, id));
    return true;
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
    await db
      .insert(records)
      .values(insertRecord);
    // Fetch the last inserted record by created date
    const result = await db
      .select()
      .from(records)
      .orderBy(records.createdAt)
      .limit(1);
    return result[result.length - 1];
  }

  async updateRecord(id: string, updateData: Partial<InsertRecord>): Promise<Record | undefined> {
    await db
      .update(records)
      .set(updateData)
      .where(eq(records.id, id));
    const [record] = await db.select().from(records).where(eq(records.id, id));
    return record || undefined;
  }

  async deleteRecord(id: string): Promise<boolean> {
    await db
      .delete(records)
      .where(eq(records.id, id));
    return true;
  }
}

export const storage = new DatabaseStorage();
