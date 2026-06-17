"use client";

import React from "react";
import { AdminAuthProvider } from "@/components/AdminAuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
