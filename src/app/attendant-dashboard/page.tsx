"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  MapPin,
  Bell,
  LogOut,
  User,
  ChevronDown,
  Phone,
  Briefcase,
  AlertOctagon,
  TrendingUp,
  UserCheck
} from "lucide-react";

type Status = "Available" | "Busy" | "On Duty" | "Offline";

const statusColors: Record<Status, string> = {
  Available: "bg-green-100 text-green-700 border-green-200",
  Busy: "bg-yellow-100 text-yellow-700 border-yellow-200",
  "On Duty": "bg-blue-100 text-blue-700 border-blue-200",
  Offline: "bg-gray-100 text-gray-500 border-gray-200",
};

const statusDot: Record<Status, string> = {
  Available: "bg-green-500",
  Busy: "bg-yellow-500",
  "On Duty": "bg-blue-500",
  Offline: "bg-gray-400",
};

interface Booking {
  id: string;
  name: string;
  phone: string;
  city: string;
  date: string;
  time: string;
  requirement: string;
  status: string;
  service: {
    title: string;
  };
  attendantId?: string | null;
  attendant?: Attendant | null;
}

interface Attendant {
  id: string;
  name: string;
  role: string;
  experience: string;
  languages: string[];
}

export default function AttendantDashboard() {
  const [status, setStatus] = useState<Status>("Available");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [selectedAttendantId, setSelectedAttendantId] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");

  const fetchData = async () => {
    try {
      const attendantsRes = await fetch("/api/attendants");
      const bookingsRes = await fetch("/api/bookings");
      
      if (attendantsRes.ok && bookingsRes.ok) {
        const attendantsData = await attendantsRes.json();
        const bookingsData = await bookingsRes.json();
        
        setAttendants(attendantsData);
        setBookings(bookingsData);
        
        if (attendantsData.length > 0 && !selectedAttendantId) {
          setSelectedAttendantId(attendantsData[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching attendant portal data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedAttendantId]);

  const activeAttendant = attendants.find(a => a.id === selectedAttendantId) || null;

  // Filter bookings for this attendant
  const attendantBookings = bookings.filter(b => b.attendantId === selectedAttendantId);

  // Categorize bookings with sorting by date
  const newAssignments = attendantBookings
    .filter(b => b.status === "Assigned")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const todaysActive = attendantBookings
    .filter(b => b.status === "Accepted" || b.status === "In Progress")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const upcomingServices = attendantBookings
    .filter(b => b.status === "Confirmed" || b.status === "Scheduled")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const completedServices = attendantBookings
    .filter(b => b.status === "Completed")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Accept Assignment
  const handleAccept = async (bookingId: string) => {
    setActionMessage("");
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Accepted" }),
      });
      if (res.ok) {
        setActionMessage("Assignment accepted!");
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reject Assignment
  const handleReject = async (bookingId: string) => {
    setActionMessage("");
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: "Pending", // Release it back to review pool
          attendantId: null 
        }),
      });
      if (res.ok) {
        setActionMessage("Assignment rejected.");
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Start Service
  const handleStartService = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "In Progress" }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Complete Service
  const handleCompleteService = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Completed" }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // KPI summaries
  const kpis = [
    { label: "New Requests", value: newAssignments.length, icon: <AlertTriangle className="h-5 w-5" />, color: "text-amber-600 bg-amber-100" },
    { label: "Active Services", value: todaysActive.length, icon: <Briefcase className="h-5 w-5" />, color: "text-blue-600 bg-blue-100" },
    { label: "Completed Overall", value: completedServices.length, icon: <CheckCircle className="h-5 w-5" />, color: "text-green-600 bg-green-100" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold text-sm">W</div>
          <span className="font-bold text-gray-800">WithYours <span className="text-primary text-xs font-semibold ml-1">Attendant Portal</span></span>
        </div>

        {/* Emulate dropdown + profile */}
        <div className="flex items-center space-x-4">
          {attendants.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400 font-semibold hidden sm:inline">Emulate Attendant:</span>
              <select
                value={selectedAttendantId}
                onChange={(e) => setSelectedAttendantId(e.target.value)}
                className="bg-purple-50 text-primary border border-purple-200 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none cursor-pointer"
              >
                {attendants.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}

          <Bell className="h-5 w-5 text-gray-500 cursor-pointer hover:text-primary" />
          <a href="/attendant-login" className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-500 transition-colors font-semibold">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:block">Logout</span>
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome + Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {activeAttendant?.name || "Attendant"} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">{activeAttendant?.role || "Specialist care professional"}</p>
          </div>

          {/* Status Selector */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full border font-semibold text-sm transition-all ${statusColors[status]}`}
            >
              <span className={`inline-block w-2 h-2 rounded-full ${statusDot[status]}`}></span>
              <span>{status}</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </button>
            {showStatusMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                {(["Available", "Busy", "On Duty", "Offline"] as Status[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStatus(s); setShowStatusMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gray-50 flex items-center space-x-2 ${status === s ? "text-primary" : "text-gray-700"}`}
                  >
                    <span className={`inline-block w-2 h-2 rounded-full ${statusDot[s]}`}></span>
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action toast info */}
        {actionMessage && (
          <div className="px-4 py-3 bg-purple-50 border border-purple-100 rounded-xl text-primary text-sm font-semibold">
            {actionMessage}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${kpi.color}`}>{kpi.icon}</div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{kpi.label}</p>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* New Assignments Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-amber-50/20">
            <h2 className="font-bold text-gray-900 flex items-center gap-1.5">
              <AlertOctagon className="h-4.5 w-4.5 text-amber-500" />
              New Assignment Requests ({newAssignments.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {newAssignments.map((b) => (
              <div key={b.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50/30 transition-colors">
                <div className="space-y-1">
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold uppercase">{b.status}</span>
                  <h4 className="font-bold text-gray-900 text-base">{b.service?.title}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-500 mt-2">
                    <div><strong>Customer Name:</strong> {b.name}</div>
                    <div><strong>Phone:</strong> {b.phone}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{b.city} (Address inside specifications)</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{b.date} at {b.time}</span>
                    </div>
                  </div>
                  {b.requirement && (
                    <p className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-600 font-mono mt-3 max-w-xl">
                      {b.requirement}
                    </p>
                  )}
                </div>
                
                {/* Accept/Reject Buttons */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={() => handleAccept(b.id)}
                    className="flex-1 md:flex-none px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs rounded-xl shadow hover:shadow-md transition-all cursor-pointer text-center"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(b.id)}
                    className="flex-1 md:flex-none px-5 py-2.5 border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
            {newAssignments.length === 0 && (
              <div className="py-8 text-center text-sm text-gray-400">
                No new assignment requests.
              </div>
            )}
          </div>
        </div>

        {/* Active Assignments in Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-blue-50/20">
            <h2 className="font-bold text-gray-900 flex items-center gap-1.5">
              <Briefcase className="h-4.5 w-4.5 text-blue-500" />
              Active Assignments ({todaysActive.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {todaysActive.map((b) => (
              <div key={b.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50/30 transition-colors">
                <div className="space-y-1">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    b.status === "In Progress" ? "bg-indigo-100 text-indigo-800" : "bg-teal-100 text-teal-800"
                  }`}>
                    {b.status}
                  </span>
                  <h4 className="font-bold text-gray-900 text-base">{b.service?.title}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-500 mt-2">
                    <div><strong>Customer Name:</strong> {b.name}</div>
                    <div><strong>Phone:</strong> {b.phone}</div>
                    <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{b.city}</div>
                    <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{b.date} at {b.time}</div>
                  </div>
                </div>

                {/* Status Advancement Buttons */}
                <div className="w-full md:w-auto">
                  {b.status === "Accepted" && (
                    <button
                      onClick={() => handleStartService(b.id)}
                      className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
                    >
                      Start Service
                    </button>
                  )}
                  {b.status === "In Progress" && (
                    <button
                      onClick={() => handleCompleteService(b.id)}
                      className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
                    >
                      Complete Service
                    </button>
                  )}
                </div>
              </div>
            ))}
            {todaysActive.length === 0 && (
              <div className="py-8 text-center text-sm text-gray-400">
                No active assignments in progress.
              </div>
            )}
          </div>
        </div>

        {/* Completed Services history */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Completed Services History</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {completedServices.map((b) => (
              <div key={b.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-50 rounded-lg"><CheckCircle className="h-4 w-4 text-green-600" /></div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{b.service?.title}</p>
                    <p className="text-xs text-gray-500">{b.name} · {b.date}</p>
                  </div>
                </div>
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold uppercase">Finished</span>
              </div>
            ))}
            {completedServices.length === 0 && (
              <div className="py-6 text-center text-sm text-gray-400">
                No completed services recorded yet.
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
