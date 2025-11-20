import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required for JWT token signing. Please set it in your environment.");
}

const JWT_SECRET = process.env.SESSION_SECRET;

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    displayName: string;
    role: "admin" | "supervisor" | "user";
  };
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function generateToken(userId: string, username: string, displayName: string, role: "admin" | "supervisor" | "user"): string {
  return jwt.sign({ id: userId, username, displayName, role }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { id: string; username: string; displayName: string; role: "admin" | "supervisor" | "user" } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; username: string; displayName: string; role: "admin" | "supervisor" | "user" };
  } catch {
    return null;
  }
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }

  req.user = user;
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
}

export function requireAdminOrSupervisor(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (req.user.role !== "admin" && req.user.role !== "supervisor") {
    return res.status(403).json({ message: "Admin or supervisor access required" });
  }

  next();
}
