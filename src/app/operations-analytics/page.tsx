"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { TrendingUp, Clock, MapPin, Star, BarChart3, Users } from "lucide-react";

/* Simple bar chart built with pure CSS — no charting library needed */
function BarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end space-x-2 h-40">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <span className="text-xs font-semibold text-gray-700 mb-1">{d.value}</span>
          <div
            className={`w-full rounded-t-lg ${color} transition-all duration-500`}
            style={{ height: `${(d.value / max) * 100}%`, minHeight: 4 }}
          />
          <span className="text-[10px] text-gray-500 mt-1.5 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

const dailyBookings = [
  { label: "Mon", value: 18 },
  { label: "Tue", value: 24 },
  { label: "Wed", value: 22 },
  { label: "Thu", value: 30 },
  { label: "Fri", value: 28 },
  { label: "Sat", value: 35 },
  { label: "Sun", value: 20 },
];

const attendantAvailability = [
  { label: "Available", value: 36 },
  { label: "Busy", value: 12 },
  { label: "On Duty", value: 8 },
  { label: "Offline", value: 2 },
];

const servicesCompleted = [
  { label: "Week 1", value: 120 },
  { label: "Week 2", value: 145 },
  { label: "Week 3", value: 132 },
  { label: "Week 4", value: 168 },
];

const peakHours = [
  { label: "6 AM", value: 5 },
  { label: "8 AM", value: 22 },
  { label: "10 AM", value: 30 },
  { label: "12 PM", value: 18 },
  { label: "2 PM", value: 25 },
  { label: "4 PM", value: 28 },
  { label: "6 PM", value: 15 },
  { label: "8 PM", value: 8 },
];

const cityDemand = [
  { label: "Bengaluru", value: 48 },
  { label: "Chennai", value: 32 },
  { label: "Hyderabad", value: 28 },
  { label: "Coimbatore", value: 16 },
];

const customerRatings = [
  { label: "5★", value: 245 },
  { label: "4★", value: 120 },
  { label: "3★", value: 35 },
  { label: "2★", value: 8 },
  { label: "1★", value: 3 },
];

const charts = [
  { title: "Daily Bookings", subtitle: "This week", icon: TrendingUp, data: dailyBookings, color: "bg-purple-500" },
  { title: "Attendant Availability", subtitle: "Current status", icon: Users, data: attendantAvailability, color: "bg-blue-500" },
  { title: "Services Completed", subtitle: "Last 4 weeks", icon: BarChart3, data: servicesCompleted, color: "bg-green-500" },
  { title: "Peak Hours", subtitle: "Today", icon: Clock, data: peakHours, color: "bg-orange-500" },
  { title: "City-wise Demand", subtitle: "This month", icon: MapPin, data: cityDemand, color: "bg-indigo-500" },
  { title: "Customer Ratings", subtitle: "All time", icon: Star, data: customerRatings, color: "bg-yellow-500" },
];

export default function OperationsAnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operations Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Visual insights across bookings, attendants, and service performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {charts.map((chart, idx) => {
            const Icon = chart.icon;
            return (
              <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{chart.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{chart.subtitle}</p>
                  </div>
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Icon className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
                <BarChart data={chart.data} color={chart.color} />
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
