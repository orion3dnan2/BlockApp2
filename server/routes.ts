import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hashPassword, verifyPassword, generateToken, authenticateToken, type AuthRequest } from "./auth";
import { insertUserSchema, insertRecordSchema } from "@shared/schema";
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
      });

      const token = generateToken(user.id, user.username, user.displayName, user.role || "user");
      res.json({
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          role: user.role || "user",
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

      const token = generateToken(user.id, user.username, user.displayName, user.role || "user");
      res.json({
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          role: user.role || "user",
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

  // User management routes (admin only)
  app.get("/api/users", authenticateToken, async (req: AuthRequest, res) => {
    try {
      // Check if user is admin
      if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      
      const allUsers = await storage.getAllUsers();
      // Don't send passwords to frontend
      const usersWithoutPasswords = allUsers.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/users", authenticateToken, async (req: AuthRequest, res) => {
    try {
      // Check if user is admin
      if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      const { username, password, displayName, role } = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        displayName,
        role: role || "user",
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

  app.delete("/api/users/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      // Check if user is admin
      if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      // Prevent admin from deleting themselves
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

  // Records routes
  app.get("/api/records", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const records = await storage.getRecords();
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

  app.post("/api/records", authenticateToken, async (req: AuthRequest, res) => {
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

  app.put("/api/records/:id", authenticateToken, async (req: AuthRequest, res) => {
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

  app.delete("/api/records/:id", authenticateToken, async (req: AuthRequest, res) => {
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
