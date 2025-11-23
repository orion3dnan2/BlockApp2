import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hashPassword, verifyPassword, generateToken, authenticateToken, requireAdmin, requireAdminOrSupervisor, type AuthRequest } from "./auth";
import { insertUserSchema, insertRecordSchema, insertPoliceStationSchema, insertPortSchema, type InsertUser } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, displayName } = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        displayName,
        role: "user",
      });

      const token = generateToken(user.id, user.username, user.displayName, user.role as "admin" | "supervisor" | "user");
      res.json({
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user.id, user.username, user.displayName, user.role as "admin" | "supervisor" | "user");
      res.json({
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    res.json({ user: req.user });
  });

  // Users management routes
  app.get("/api/users", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const allUsers = await storage.getUsers();
      // Remove password from response
      const usersWithoutPassword = allUsers.map(({ password, ...user }) => user);
      res.json(usersWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/users", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const validated = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByUsername(validated.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(validated.password);
      const user = await storage.createUser({
        username: validated.username,
        password: hashedPassword,
        displayName: validated.displayName,
        role: validated.role,
      });

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/users/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      // Create validation schema for updates (all fields optional)
      const updateUserSchema = z.object({
        username: z.string().min(3, "Username must be at least 3 characters").optional(),
        password: z.string().min(6, "Password must be at least 6 characters").optional(),
        displayName: z.string().min(2, "Display name must be at least 2 characters").optional(),
        role: z.enum(["admin", "supervisor", "user"]).optional(),
      });
      
      const validated = updateUserSchema.parse(req.body);
      const updateData: Partial<InsertUser> = {};
      
      if (validated.displayName) updateData.displayName = validated.displayName;
      if (validated.username) updateData.username = validated.username;
      if (validated.role) updateData.role = validated.role;
      if (validated.password) {
        updateData.password = await hashPassword(validated.password);
      }
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }
      
      const user = await storage.updateUser(req.params.id, updateData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/users/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      // Prevent user from deleting themselves
      if (req.user?.id === req.params.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      const success = await storage.deleteUser(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Police Stations routes
  app.get("/api/police-stations", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const stations = await storage.getPoliceStations();
      res.json(stations);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/police-stations", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const validated = insertPoliceStationSchema.parse(req.body);
      const station = await storage.createPoliceStation(validated);
      res.status(201).json(station);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/police-stations/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const validated = insertPoliceStationSchema.partial().parse(req.body);
      const station = await storage.updatePoliceStation(id, validated);
      if (!station) {
        return res.status(404).json({ message: "Police station not found" });
      }
      res.json(station);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/police-stations/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePoliceStation(id);
      if (!success) {
        return res.status(404).json({ message: "Police station not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Ports routes
  app.get("/api/ports", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const ports = await storage.getPorts();
      res.json(ports);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/ports", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const validated = insertPortSchema.parse(req.body);
      const port = await storage.createPort(validated);
      res.status(201).json(port);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/ports/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const validated = insertPortSchema.partial().parse(req.body);
      const port = await storage.updatePort(id, validated);
      if (!port) {
        return res.status(404).json({ message: "Port not found" });
      }
      res.json(port);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/ports/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePort(id);
      if (!success) {
        return res.status(404).json({ message: "Port not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Records routes
  app.get("/api/records", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const records = await storage.getRecords();
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/records/search", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const filters: any = {};

      if (req.query.recordNumber) filters.recordNumber = String(req.query.recordNumber);
      if (req.query.outgoingNumber) filters.outgoingNumber = String(req.query.outgoingNumber);
      if (req.query.militaryNumber) filters.militaryNumber = String(req.query.militaryNumber);
      if (req.query.firstName) filters.firstName = String(req.query.firstName);
      if (req.query.secondName) filters.secondName = String(req.query.secondName);
      if (req.query.thirdName) filters.thirdName = String(req.query.thirdName);
      if (req.query.fourthName) filters.fourthName = String(req.query.fourthName);
      if (req.query.governorate) filters.governorate = String(req.query.governorate);
      if (req.query.rank) filters.rank = String(req.query.rank);
      if (req.query.office) filters.office = String(req.query.office);
      if (req.query.policeStation) filters.policeStation = String(req.query.policeStation);
      if (req.query.startDate) filters.startDate = new Date(String(req.query.startDate));
      if (req.query.endDate) filters.endDate = new Date(String(req.query.endDate));
      if (req.query.recordedNotes) filters.recordedNotes = String(req.query.recordedNotes);

      const records = await storage.searchRecords(filters);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/records/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const record = await storage.getRecordById(req.params.id);
      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/records", authenticateToken, requireAdminOrSupervisor, async (req: AuthRequest, res) => {
    try {
      const data = insertRecordSchema.parse(req.body);
      const record = await storage.createRecord(data);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/records/import", authenticateToken, requireAdminOrSupervisor, async (req: AuthRequest, res) => {
    try {
      const { records } = req.body;

      if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ message: "Invalid input: records array is required and must not be empty" });
      }

      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < records.length; i++) {
        try {
          const data = insertRecordSchema.parse(records[i]);
          await storage.createRecord(data);
          successCount++;
        } catch (error) {
          failedCount++;
          if (error instanceof z.ZodError) {
            const firstError = error.errors[0];
            errors.push(`الصف ${i + 2}: ${firstError.path.join('.')} - ${firstError.message}`);
          } else {
            errors.push(`الصف ${i + 2}: ${error instanceof Error ? error.message : "خطأ في المعالجة"}`);
          }
        }
      }

      res.json({
        success: successCount,
        failed: failedCount,
        errors: errors.slice(0, 50),
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/records/:id", authenticateToken, requireAdminOrSupervisor, async (req: AuthRequest, res) => {
    try {
      const updateSchema = insertRecordSchema.partial();
      const data = updateSchema.parse(req.body);
      
      if (Object.keys(data).length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }
      
      const record = await storage.updateRecord(req.params.id, data);
      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }
      res.json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/records/:id", authenticateToken, requireAdminOrSupervisor, async (req: AuthRequest, res) => {
    try {
      const success = await storage.deleteRecord(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Record not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
