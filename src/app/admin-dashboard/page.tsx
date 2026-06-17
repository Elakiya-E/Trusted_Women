"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import {
  ShoppingCart,
  CalendarCheck,
  Users,
  UserCheck,
  CheckCircle,
  Truck,
  Star,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ExternalLink,
  ShieldCheck
} from "lucide-react";

interface Service {
  title: string;
}

interface Attendant {
  id: string;
  name: string;
}

interface Booking {
  id: string;
  name: string;
  phone: string;
  city: string;
  date: string;
  time: string;
  requirement: string;
  status: string;
  createdAt: string;
  service: Service;
  attendant: Attendant | null;
}

const statusStyles: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  "Under Review": "bg-amber-100 text-amber-800",
  Assigned: "bg-blue-100 text-blue-800",
  Accepted: "bg-teal-100 text-teal-800",
  "In Progress": "bg-indigo-100 text-indigo-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-700",
};

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [attendantsCount, setAttendantsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const bookingsRes = await fetch("/api/bookings");
      const attendantsRes = await fetch("/api/attendants");

      if (bookingsRes.ok && attendantsRes.ok) {
        const bookingsData = await bookingsRes.json();
        const attendantsData = await attendantsRes.json();
        setBookings(bookingsData);
        setAttendantsCount(attendantsData.length);
      }
    } catch (error) {
      console.error("Error fetching live metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute live KPIs
  const totalOrders = bookings.length;
  
  // Today's orders count
  const todayStr = new Date().toISOString().split("T")[0];
  const todaysOrders = bookings.filter(b => b.createdAt.startsWith(todayStr) || b.date.includes(todayStr)).length;
  
  const ongoingServices = bookings.filter(b => b.status === "In Progress").length;
  const completedServices = bookings.filter(b => b.status === "Completed").length;
  const pendingRequests = bookings.filter(b => b.status === "Pending" || b.status === "Under Review").length;
  const assignedRequests = bookings.filter(b => b.status === "Assigned" || b.status === "Accepted").length;

  const kpis = [
    { label: "Total Booking Requests", value: totalOrders.toString(), change: `+${pendingRequests} pending`, up: true, icon: ShoppingCart, color: "bg-purple-100 text-purple-600" },
    { label: "Today's Orders", value: todaysOrders.toString(), change: "Live", up: true, icon: CalendarCheck, color: "bg-blue-100 text-blue-600" },
    { label: "Active Attendants", value: attendantsCount.toString(), change: "Registered", up: true, icon: Users, color: "bg-indigo-100 text-indigo-600" },
    { label: "Ongoing Services", value: ongoingServices.toString(), change: `${assignedRequests} assigned`, up: true, icon: Truck, color: "bg-orange-100 text-orange-600" },
    { label: "Completed Services", value: completedServices.toString(), change: "Total archive", up: true, icon: CheckCircle, color: "bg-emerald-100 text-emerald-600" },
    { label: "Operator Review Required", value: pendingRequests.toString(), change: "Action needed", up: pendingRequests > 0, icon: Clock, color: "bg-yellow-100 text-yellow-600" },
  ];

  // Dynamic Recent Activity Log based on actual DB records
  const getRecentActivity = () => {
    const logs: { text: string; time: string }[] = [];
    bookings.slice(0, 5).forEach((b) => {
      const timeAgo = new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (b.status === "Pending") {
        logs.push({ text: `New booking request from ${b.name} (${b.service.title})`, time: `${timeAgo} today` });
      } else if (b.status === "Assigned") {
        logs.push({ text: `Attendant assigned to ${b.name} for ${b.service.title}`, time: `${timeAgo} today` });
      } else if (b.status === "Accepted") {
        logs.push({ text: `${b.attendant?.name || 'Attendant'} accepted service request for ${b.name}`, time: `${timeAgo} today` });
      } else {
        logs.push({ text: `${b.name} service status updated to ${b.status}`, time: `${timeAgo} today` });
      }
    });

    if (logs.length === 0) {
      return [
        { text: "No operational activity recorded yet.", time: "System Idle" }
      ];
    }
    return logs;
  };

  const recentActivity = getRecentActivity();
  const recentBookingsList = bookings.slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-sm text-gray-500 mt-1">Real-time metrics across all operations</p>
          </div>
          <button 
            onClick={fetchData} 
            className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-primary border border-purple-200 rounded-xl text-xs font-bold transition-all"
          >
            Sync Data
          </button>
        </div>

        {/* KPI Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-xl border border-gray-100 p-6 h-[120px] animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpis.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div key={idx} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${kpi.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2.5 py-0.5 rounded-full border border-gray-100">
                      {kpi.change}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Two-column: Recent Bookings + Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="font-bold text-gray-900">Recent Booking Requests</h2>
                <Link href="/manage-bookings" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                  <span>Manage All</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <span className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary"></span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50/20 border-b border-gray-50">
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Service</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Scheduled</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentBookingsList.map((b) => (
                        <tr key={b.id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="px-5 py-3.5 text-xs font-mono text-gray-400">
                            {b.id.substring(0, 8)}
                          </td>
                          <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">
                            <div>{b.name}</div>
                            <span className="text-[10px] text-gray-400 font-mono font-normal">{b.phone}</span>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-gray-700">
                            <div>{b.service?.title}</div>
                            <span className="text-[10px] text-gray-400 font-normal">{b.city}</span>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-gray-600">
                            {b.date} · {b.time}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusStyles[b.status] || "bg-gray-100"}`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {recentBookingsList.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">
                            No service bookings requested yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-bold text-gray-900">Recent Operations Log</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {recentActivity.map((a, idx) => (
                  <div key={idx} className="px-5 py-4 flex items-start space-x-3">
                    <div className="mt-0.5 p-1.5 bg-slate-50 rounded-lg flex-shrink-0 border border-slate-100">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-700 leading-snug break-words">{a.text}</p>
                      <p className="text-xs text-gray-400 mt-1">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
