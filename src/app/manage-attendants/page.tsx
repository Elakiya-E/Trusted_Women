"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, MapPin } from "lucide-react";

type AttStatus = "Available" | "Busy" | "On Duty" | "Offline";

interface AttendantRow {
  name: string;
  location: string;
  availability: AttStatus;
  experience: string;
  languages: string;
  assignedServices: number;
}



const statusStyles: Record<AttStatus, string> = {
  Available: "bg-green-100 text-green-700",
  Busy: "bg-yellow-100 text-yellow-700",
  "On Duty": "bg-blue-100 text-blue-700",
  Offline: "bg-gray-100 text-gray-500",
};

const statusDot: Record<AttStatus, string> = {
  Available: "bg-green-500",
  Busy: "bg-yellow-500",
  "On Duty": "bg-blue-500",
  Offline: "bg-gray-400",
};

export default function ManageAttendantsPage() {
  const [searchQuery, setSearchQuery] = useState("");
const [attendants, setAttendants] = useState<AttendantRow[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// Fetch attendants from API on component mount
useEffect(() => {
  const fetchAttendants = async () => {
    try {
      const res = await fetch("/api/attendants");
      if (!res.ok) {
        throw new Error(`Failed to fetch attendants: ${res.status}`);
      }
      const data = await res.json();
      setAttendants(data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };
  fetchAttendants();
}, []);

  const filtered = attendants.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendant Management</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all registered attendants</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {(["Available", "Busy", "On Duty", "Offline"] as AttStatus[]).map((s) => {
            const count = attendants.filter((a) => a.availability === s).length;
            return (
              <div key={s} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${statusDot[s]}`} />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{s}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none bg-white"
          />
        </div>

{/* Loading / Error / Table */}
{error && (
  <p className="text-red-600 font-medium">Error: {error}</p>
)}
{loading ? (
  // Skeleton placeholders while loading
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="grid grid-cols-6 gap-4 p-4 bg-white rounded-xl shadow-sm animate-pulse">
        <div className="col-span-2 h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="col-span-1 h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="col-span-1 h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="col-span-1 h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="col-span-1 h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    ))}
  </div>
) : (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Experience</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Languages</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {filtered.map((a, idx) => (
            <tr key={idx} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-4">
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                    {a.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{a.name}</span>
                </div>
              </td>
              <td className="px-5 py-4">
                <span className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />{a.location}
                </span>
              </td>
              <td className="px-5 py-4">
                <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[a.availability]}`}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusDot[a.availability]}`} />
                  <span>{a.availability}</span>
                </span>
              </td>
              <td className="px-5 py-4 text-sm text-gray-600">{a.experience}</td>
              <td className="px-5 py-4 text-sm text-gray-600">{a.languages}</td>
              <td className="px-5 py-4 text-sm font-semibold text-gray-900">{a.assignedServices}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="px-5 py-3 border-t border-gray-100">
      <p className="text-xs text-gray-400">{filtered.length} of {attendants.length} attendants</p>
    </div>
  </div>
)}
      </div>
    </DashboardLayout>
  );
}
