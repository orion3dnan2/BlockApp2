import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ApiClient } from "@/lib/api";
import { useLocation } from "wouter";
import type { Permission, Role } from "@shared/schema";

export type UserRole = Role;

export interface User {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  permissions: Permission[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await ApiClient.get<{ user: User }>("/api/auth/me");
      setUser(response.user);
    } catch (error) {
      localStorage.removeItem("auth_token");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await ApiClient.post<{ user: User; token: string }>(
      "/api/auth/login",
      { username, password }
    );
    localStorage.setItem("auth_token", response.token);
    setUser(response.user);
    setLocation("/");
  };

  const register = async (username: string, password: string, displayName: string) => {
    const response = await ApiClient.post<{ user: User; token: string }>(
      "/api/auth/register",
      { username, password, displayName }
    );
    localStorage.setItem("auth_token", response.token);
    setUser(response.user);
    setLocation("/");
  };

  const logout = () => {
    console.log("Logout function called - removing token and redirecting");
    localStorage.removeItem("auth_token");
    setUser(null);
    setLocation("/login");
    // Force reload to ensure clean state
    setTimeout(() => {
      window.location.href = "/login";
    }, 100);
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    if (user.role === "admin") return true;
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
