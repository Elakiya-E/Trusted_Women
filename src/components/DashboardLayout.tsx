"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/AdminAuthContext";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  BarChart3,
  Bell,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  Settings,
  AlertOctagon,
  UserCheck,
} from "lucide-react";

const sidebarLinks = [
  { label: "Admin Dashboard", href: "/admin-dashboard", icon: LayoutDashboard },
  { label: "Manage Bookings", href: "/manage-bookings", icon: CalendarCheck },
  { label: "Manage Attendants", href: "/manage-attendants", icon: Users },
  { label: "Attendant Approvals", href: "/admin-dashboard/attendant-approvals", icon: ShieldCheck },
  { label: "Customer Verifications", href: "/admin-dashboard/customers", icon: UserCheck },
  { label: "Operations Analytics", href: "/operations-analytics", icon: BarChart3 },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, isLoading, logout } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Auto redirect to admin-login if not authenticated
  useEffect(() => {
    if (!isLoading && !admin) {
      const redirectPath = encodeURIComponent(pathname);
      router.push(`/admin-login?redirect=${redirectPath}`);
    }
  }, [admin, isLoading, pathname, router]);

  // Render a clean loading screen on mount/session check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-gradient-to-br from-primary to-secondary text-white p-3.5 rounded-2xl animate-pulse shadow-md">
            <ShieldCheck className="h-8 w-8 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-slate-800 text-lg">Verifying Session...</h3>
            <p className="text-xs text-slate-400 mt-1">Please wait while we secure your connection</p>
          </div>
        </div>
      </div>
    );
  }

  // If session verified but no admin user, show redirecting state
  if (!admin) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h3 className="font-semibold text-slate-700">Redirecting to Login...</h3>
        </div>
      </div>
    );
  }

  // Verify Admin Role: Only verified admins can access the dashboard.
  // Unauthorized users must see: "Access Denied. Administrator privileges required."
  if (admin.role !== "administrator") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12 mesh-grid">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-100 p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 text-red-500 mb-6 glow-red">
            <AlertOctagon className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Access Denied</h2>
          <p className="text-slate-600 text-sm mb-8 leading-relaxed">
            Administrator privileges required. If you believe this is an error, please log in with a different account.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                logout();
                router.push("/admin-login");
              }}
              className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold py-3 px-4 rounded-xl text-sm shadow-md transition-all hover:scale-[1.01]"
            >
              Sign in with another account
            </button>
            <Link
              href="/"
              className="block w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-xl text-sm transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar — Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200 fixed top-0 left-0 bottom-0 z-40">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <Link href="/" className="flex items-center space-x-2.5">
            <span className="bg-gradient-to-br from-primary to-secondary text-white p-2 rounded-xl">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                WithYours
              </span>
              <p className="text-[10px] text-gray-400 font-medium -mt-0.5">Operations Console</p>
            </div>
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom User */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800 truncate">{admin.name}</p>
              <p className="text-xs text-gray-400 truncate">{admin.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute top-0 left-0 bottom-0 w-72 bg-white shadow-xl z-50 flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <span className="bg-gradient-to-br from-primary to-secondary text-white p-2 rounded-xl">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">WithYours</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {sidebarLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
            {/* Mobile Sidebar User Bottom info */}
            <div className="px-6 py-5 border-t border-gray-100 flex items-center space-x-3 bg-gray-50">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800 truncate">{admin.name}</p>
                <p className="text-xs text-gray-400 truncate">{admin.email}</p>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold text-gray-800 hidden sm:block">
              {sidebarLinks.find((l) => l.href === pathname)?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/notifications" className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white" />
            </Link>
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400 hidden sm:block" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-1">
                  <Link href="/admin-dashboard" className="flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    <Settings className="h-4 w-4" /><span>Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      router.push("/admin-login");
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer text-left focus:outline-none"
                  >
                    <LogOut className="h-4 w-4" /><span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

