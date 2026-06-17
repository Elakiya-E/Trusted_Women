"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Search, 
  Filter, 
  Download, 
  ChevronDown, 
  UserCheck, 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  AlertCircle, 
  Info,
  CheckCircle2,
  Trash2,
  Loader2
} from "lucide-react";

type BookingStatus = "Pending" | "Under Review" | "Assigned" | "Accepted" | "In Progress" | "Completed" | "Cancelled";

interface Attendant {
  id: string;
  name: string;
  role: string;
  experience: string;
  languages: string[];
}

interface Booking {
  id: string;
  serviceId: string;
  service: {
    title: string;
  };
  name: string;
  phone: string;
  city: string;
  date: string;
  time: string;
  requirement: string;
  status: BookingStatus;
  attendantId: string | null;
  attendant: Attendant | null;
}

const statusStyles: Record<BookingStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Under Review": "bg-amber-100 text-amber-800 border-amber-200",
  Assigned: "bg-blue-100 text-blue-800 border-blue-200",
  Accepted: "bg-teal-100 text-teal-800 border-teal-200",
  "In Progress": "bg-indigo-100 text-indigo-800 border-indigo-200",
  Completed: "bg-green-100 text-green-800 border-green-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
};

const allStatuses: BookingStatus[] = ["Pending", "Under Review", "Assigned", "Accepted", "In Progress", "Completed", "Cancelled"];

export default function ManageBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "All">("All");

  // Modal State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Assignment form states
  const [targetAttendantId, setTargetAttendantId] = useState("");
  const [targetStatus, setTargetStatus] = useState<BookingStatus>("Pending");
  const [targetDate, setTargetDate] = useState("");
  const [targetTime, setTargetTime] = useState("");
  
  const [saveLoading, setSaveLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const bookingsRes = await fetch("/api/bookings");
      const attendantsRes = await fetch("/api/attendants");

      if (bookingsRes.ok && attendantsRes.ok) {
        const bookingsData = await bookingsRes.json();
        const attendantsData = await attendantsRes.json();
        setBookings(bookingsData);
        setAttendants(attendantsData);
      }
    } catch (error) {
      console.error("Error fetching admin operations data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAssignModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setTargetAttendantId(booking.attendantId || "");
    setTargetStatus(booking.status);
    setTargetDate(booking.date);
    setTargetTime(booking.time);
    setActionMessage("");
    setModalOpen(true);
  };

  const closeAssignModal = () => {
    setModalOpen(false);
    setSelectedBooking(null);
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setSaveLoading(true);
    setActionMessage("");

    // If an attendant is selected and status was Pending/Under Review, automatically update it to Assigned
    let updatedStatus = targetStatus;
    if (targetAttendantId && (targetStatus === "Pending" || targetStatus === "Under Review")) {
      updatedStatus = "Assigned";
    }

    try {
      const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: updatedStatus,
          attendantId: targetAttendantId || null,
          date: targetDate,
          time: targetTime,
        }),
      });

      if (res.ok) {
        setActionMessage("Booking updated successfully!");
        // Refresh local listings
        await fetchData();
        setTimeout(() => {
          closeAssignModal();
        }, 1000);
      } else {
        const data = await res.json();
        setActionMessage(`Error: ${data.error || "Could not update booking"}`);
      }
    } catch (err) {
      setActionMessage("Network error. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
            <p className="text-sm text-gray-500 mt-1">Review customer requests and assign verified women attendants</p>
          </div>
          <button 
            onClick={fetchData} 
            className="self-start sm:self-auto px-4 py-2 bg-purple-50 text-primary hover:bg-purple-100 rounded-xl text-xs font-semibold border border-purple-200 transition-colors"
          >
            Refresh Data
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, customer, service, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none bg-white"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus | "All")}
              className="pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none bg-white appearance-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              {allStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Table / Details */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></span>
              <p className="text-gray-400 text-xs font-semibold">Loading operations log...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking ID</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service Type</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date &amp; Time</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendant</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 text-xs font-mono font-medium text-gray-500 truncate max-w-[100px]" title={b.id}>
                        {b.id.substring(0, 8)}...
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-900">{b.name}</td>
                      <td className="px-5 py-4 text-sm text-gray-600 font-mono">{b.phone}</td>
                      <td className="px-5 py-4 text-sm text-gray-700 font-medium">{b.service?.title}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{b.city}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {b.date} · {b.time}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-purple-700">
                        {b.attendant ? b.attendant.name : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${statusStyles[b.status] || "bg-gray-100"}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => openAssignModal(b)}
                          className="px-3 py-1.5 bg-primary hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Manage</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-5 py-12 text-center text-sm text-gray-400">
                        No requests submitted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">{filtered.length} of {bookings.length} requests</p>
          </div>
        </div>
      </div>

      {/* Assignment / Management Modal */}
      {modalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-indigo-700 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Manage Assignment</h3>
                <p className="text-[10px] text-indigo-100 uppercase tracking-widest font-mono">ID: {selectedBooking.id}</p>
              </div>
              <button 
                onClick={closeAssignModal}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSaveAssignment} className="p-6 space-y-4">
              
              {actionMessage && (
                <div className={`px-4 py-3 rounded-xl text-sm font-semibold border ${
                  actionMessage.includes("success") 
                    ? "bg-green-50 text-green-700 border-green-200" 
                    : "bg-red-50 text-red-700 border-red-200"
                }`}>
                  {actionMessage}
                </div>
              )}

              {/* Booking Metadata details */}
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span className="font-semibold">Customer:</span>
                  <span className="font-bold text-gray-800">{selectedBooking.name} ({selectedBooking.phone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Requested Service:</span>
                  <span className="font-bold text-gray-800">{selectedBooking.service?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">City &amp; Location:</span>
                  <span className="font-bold text-gray-800">{selectedBooking.city} · {selectedBooking.requirement.split("Address: ")[1]?.split(".")[0] || "No Address"}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 text-slate-500">
                  <span className="font-semibold">Special Requirements:</span>
                  <p className="mt-1 bg-white p-2 rounded border border-slate-100 text-slate-700 leading-relaxed max-h-[80px] overflow-y-auto font-mono">
                    {selectedBooking.requirement}
                  </p>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Update Booking Status
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as BookingStatus)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                >
                  {allStatuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Attendant Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Assign Attendant
                </label>
                <select
                  value={targetAttendantId}
                  onChange={(e) => setTargetAttendantId(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                >
                  <option value="">Unassigned (None)</option>
                  {attendants.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.role} · {a.experience})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time Override */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Service Date
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Service Time
                  </label>
                  <input
                    type="time"
                    value={targetTime}
                    onChange={(e) => setTargetTime(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeAssignModal}
                  className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-6 py-2.5 bg-primary hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saveLoading ? (
                    <>
                      <Loader2 className="animate-spin h-3.5 w-3.5" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Assignment</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
