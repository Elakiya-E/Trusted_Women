"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface AdminUser {
  email: string;
  name: string;
  role: "administrator";
  lastLogin: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

// Simulated admin credentials — replace with real API call in production
const ADMIN_CREDENTIALS = [
  { email: "admin@withyours.in", password: "Admin@2025", name: "Admin" },
  { email: "ops@withyours.in", password: "Ops@2025", name: "Operations Manager" },
  { email: "elakiya16aram@gmail.com", password: "Admin@2025", name: "Elakiya" },
];

const SESSION_KEY = "withyours_admin_session";
const SESSION_TIMEOUT_MS = 8 * 60 * 60 * 1000; // 8 hours

function hashPassword(password: string): string {
  // Simple hash for client-side comparison — real hashing happens server-side
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        const elapsed = Date.now() - session.timestamp;
        if (elapsed < SESSION_TIMEOUT_MS) {
          setAdmin(session.admin);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string, remember: boolean): Promise<{ success: boolean; error?: string }> => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));

    const found = ADMIN_CREDENTIALS.find(
      (c) => c.email.toLowerCase() === email.toLowerCase() && c.password === password
    );

    if (!found) {
      return { success: false, error: "Invalid email or password." };
    }

    const adminUser: AdminUser = {
      email: found.email,
      name: found.name,
      role: "administrator",
      lastLogin: new Date().toISOString(),
    };

    setAdmin(adminUser);

    if (remember) {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ admin: adminUser, timestamp: Date.now() })
      );
    } else {
      // Session-only — store in sessionStorage
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ admin: adminUser, timestamp: Date.now() })
      );
    }

    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setAdmin(null);
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  // Also check sessionStorage on mount
  useEffect(() => {
    if (!admin) {
      try {
        const stored = sessionStorage.getItem(SESSION_KEY);
        if (stored) {
          const session = JSON.parse(stored);
          const elapsed = Date.now() - session.timestamp;
          if (elapsed < SESSION_TIMEOUT_MS) {
            setAdmin(session.admin);
          } else {
            sessionStorage.removeItem(SESSION_KEY);
          }
        }
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
  }, [admin]);

  return (
    <AdminAuthContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}
