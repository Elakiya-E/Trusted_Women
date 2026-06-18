"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from "recharts";
import { format } from "date-fns";

// Simple KPI Card component
function KpiCard({ icon, label, value, change, up }) {
  return (
    <div className="kpi-card bg-white rounded-xl shadow-sm p-5 flex items-center space-x-3">
      <div className="text-primary text-2xl">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className={`text-xs ${up ? "text-green-600" : "text-red-600"}`}>▲ {change}</p>
        )}
      </div>
    </div>
  );
}

// Placeholder data – in a real app replace with API calls
const placeholderSummary = {
  totalBookings: 352,
  totalCustomers: 124,
  repeatCustomers: 57,
  activeAttendants: 22,
  monthlyGrowth: "12%",
  satisfactionScore: "4.8/5",
};

const cityData = [
  { city: "Bengaluru", bookings: 120 },
  { city: "Chennai", bookings: 85 },
  { city: "Hyderabad", bookings: 60 },
  { city: "Coimbatore", bookings: 40 },
];

const serviceData = [
  { name: "Elderly Care", value: 30 },
  { name: "Hospital Assistance", value: 25 },
  { name: "Airport Pickup", value: 20 },
  { name: "Railway Pickup", value: 15 },
  { name: "Women Drivers", value: 10 },
];

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#6366f1"];

export default function AdminAnalytics() {
  // In a production version, fetch data from /api/analytics/* endpoints
  const [summary, setSummary] = useState(placeholderSummary);
  const [cityStats, setCityStats] = useState(cityData);
  const [serviceStats, setServiceStats] = useState(serviceData);

  // Example effect to illustrate async fetch – replace with real endpoint if needed
  useEffect(() => {
    // fetch('/api/analytics/summary').then(r => r.json()).then(setSummary);
    // fetch('/api/analytics/bookings-by-city').then(r=>r.json()).then(setCityStats);
    // fetch('/api/analytics/service-demand').then(r=>r.json()).then(setServiceStats);
  }, []);

  return (
    <DashboardLayout>
      <section className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard icon="📌" label="Total Bookings" value={summary.totalBookings} />
          <KpiCard icon="👥" label="Total Customers" value={summary.totalCustomers} />
          <KpiCard icon="🔁" label="Repeat Customers" value={summary.repeatCustomers} />
          <KpiCard icon="👩⚕️" label="Active Attendants" value={summary.activeAttendants} />
          <KpiCard icon="📈" label="Monthly Growth" value={summary.monthlyGrowth} />
          <KpiCard icon="⭐" label="Customer Satisfaction" value={summary.satisfactionScore} />
        </div>

        {/* City Map & Top 3 Locations */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-lg font-semibold mb-4">India Booking Map</h2>
            {/* Simplified static map – replace with interactive map library */}
            <svg viewBox="0 0 400 400" className="w-full h-auto">
              {/* Outline of India (very simplified) */}
              <path d="M200,20 L260,80 L300,150 L260,220 L200,260 L140,220 L100,150 L140,80 Z" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="2" />
              {cityStats.map((c, i) => {
                const positions = {
                  Bengaluru: [260, 150],
                  Chennai: [320, 180],
                  Hyderabad: [240, 200],
                  Coimbatore: [200, 230],
                };
                const [x, y] = positions[c.city] || [200, 200];
                const radius = Math.max(5, Math.sqrt(c.bookings) * 2);
                return (
                  <g key={c.city}>
                    <circle cx={x} cy={y} r={radius} fill="#4f46e5" opacity="0.7" />
                    <title>{c.city} – {c.bookings} bookings</title>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-lg font-semibold mb-4">Top 3 Locations</h2>
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2">Rank</th>
                  <th className="p-2">Location</th>
                  <th className="p-2">Bookings</th>
                  <th className="p-2">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {cityStats
                  .sort((a, b) => b.bookings - a.bookings)
                  .slice(0, 3)
                  .map((c, idx) => (
                    <tr key={c.city} className="border-t">
                      <td className="p-2 font-medium">{idx + 1}</td>
                      <td className="p-2">{c.city}</td>
                      <td className="p-2">{c.bookings}</td>
                      <td className="p-2">{((c.bookings / summary.totalBookings) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Booking Distribution Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold mb-4">Bookings per City</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cityStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="city" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Service Demand Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold mb-4">Service Demand</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={serviceStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                {serviceStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Repeat Customer Analytics (Simple Area Chart) */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold mb-4">New vs Repeat Customers (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={[{ month: "Jan", new: 30, repeat: 10 }, { month: "Feb", new: 35, repeat: 12 }, { month: "Mar", new: 40, repeat: 15 }, { month: "Apr", new: 38, repeat: 14 }, { month: "May", new: 42, repeat: 18 }, { month: "Jun", new: 45, repeat: 20 }]}> 
              <defs>
                <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRepeat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Area type="monotone" dataKey="new" stroke="#4f46e5" fillOpacity={1} fill="url(#colorNew)" />
              <Area type="monotone" dataKey="repeat" stroke="#10b981" fillOpacity={1} fill="url(#colorRepeat)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </DashboardLayout>
  );
}
