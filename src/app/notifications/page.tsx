"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Bell, CheckCircle, AlertTriangle, User, Star, Truck, Filter } from "lucide-react";

type NotifType = "booking" | "assigned" | "started" | "completed" | "emergency" | "feedback";

interface Notification {
  id: number;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const allNotifications: Notification[] = [
  { id: 1, type: "booking", title: "New Booking", message: "Meena R. booked Airport Escort for Jun 18 at 09:00 AM in Bengaluru", time: "2 min ago", read: false },
  { id: 2, type: "assigned", title: "Attendant Assigned", message: "Ananya M. has been assigned to BKG-1028 (Train Escort, Bengaluru)", time: "10 min ago", read: false },
  { id: 3, type: "started", title: "Service Started", message: "BKG-1024 — Airport Escort by Ananya M. has started at Bengaluru Airport", time: "25 min ago", read: false },
  { id: 4, type: "completed", title: "Service Completed", message: "BKG-1027 — Elderly Care by Rekha P. completed successfully in Hyderabad", time: "45 min ago", read: true },
  { id: 5, type: "emergency", title: "Emergency Alert", message: "Client Sunita L. requires immediate medical assistance at Manipal Hospital, Bengaluru", time: "1 hr ago", read: false },
  { id: 6, type: "feedback", title: "Customer Feedback", message: "Kavitha M. rated her experience 5★ — 'Exceptional service, felt very safe!'", time: "1.5 hr ago", read: true },
  { id: 7, type: "booking", title: "New Booking", message: "Lakshmi T. booked Home Nursing for Jun 19 at 10:00 AM in Bengaluru", time: "2 hr ago", read: true },
  { id: 8, type: "assigned", title: "Attendant Assigned", message: "Divya S. has been assigned to BKG-1025 (Medical Escort, Chennai)", time: "3 hr ago", read: true },
  { id: 9, type: "completed", title: "Service Completed", message: "BKG-1022 — Train Escort by Latha R. completed in Bengaluru", time: "4 hr ago", read: true },
  { id: 10, type: "feedback", title: "Customer Feedback", message: "Deepa S. rated her experience 4★ — 'Very professional attendant.'", time: "5 hr ago", read: true },
];

const typeConfig: Record<NotifType, { icon: React.ReactNode; dotColor: string; bgColor: string }> = {
  booking: { icon: <Bell className="h-4 w-4" />, dotColor: "bg-purple-500", bgColor: "bg-purple-50 border-purple-100" },
  assigned: { icon: <User className="h-4 w-4" />, dotColor: "bg-blue-500", bgColor: "bg-blue-50 border-blue-100" },
  started: { icon: <Truck className="h-4 w-4" />, dotColor: "bg-indigo-500", bgColor: "bg-indigo-50 border-indigo-100" },
  completed: { icon: <CheckCircle className="h-4 w-4" />, dotColor: "bg-green-500", bgColor: "bg-green-50 border-green-100" },
  emergency: { icon: <AlertTriangle className="h-4 w-4" />, dotColor: "bg-red-500", bgColor: "bg-red-50 border-red-100" },
  feedback: { icon: <Star className="h-4 w-4" />, dotColor: "bg-yellow-500", bgColor: "bg-yellow-50 border-yellow-100" },
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<NotifType | "all">("all");
  const [notifications, setNotifications] = useState(allNotifications);

  const filtered = filter === "all" ? notifications : notifications.filter((n) => n.type === filter);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Type Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all" as const, label: "All" },
            { key: "booking" as const, label: "New Booking" },
            { key: "assigned" as const, label: "Assigned" },
            { key: "started" as const, label: "Started" },
            { key: "completed" as const, label: "Completed" },
            { key: "emergency" as const, label: "Emergency" },
            { key: "feedback" as const, label: "Feedback" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                filter === f.key
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="space-y-2">
          {filtered.map((n) => {
            const config = typeConfig[n.type];
            return (
              <div
                key={n.id}
                className={`flex items-start space-x-4 px-5 py-4 rounded-2xl border transition-all ${
                  n.read ? "bg-white border-gray-100" : `${config.bgColor}`
                }`}
              >
                <div className={`mt-0.5 p-2 rounded-xl ${n.read ? "bg-gray-100 text-gray-500" : `${config.bgColor} text-gray-700`}`}>
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-0.5">
                    {!n.read && <span className={`inline-block w-2 h-2 rounded-full ${config.dotColor}`} />}
                    <p className={`text-sm font-semibold ${n.read ? "text-gray-600" : "text-gray-900"}`}>{n.title}</p>
                  </div>
                  <p className={`text-sm leading-relaxed ${n.read ? "text-gray-400" : "text-gray-600"}`}>{n.message}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 pt-0.5">{n.time}</span>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              No notifications in this category.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
