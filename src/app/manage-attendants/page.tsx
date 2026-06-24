"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Search, MapPin, Check, X, FileText, Phone, Mail, Calendar, 
  Award, SlidersHorizontal, Eye, Download, RefreshCw, AlertCircle, FileCheck, Languages
} from "lucide-react";

type AttStatus = "Available" | "Busy" | "On Duty" | "Offline";

interface AttendantRow {
  id: string;
  name: string;
  location: string;
  availability: AttStatus;
  experience: string;
  languages: string;
  assignedServices: number;
  workingDays: string[];
  workingHours: string;
  preferredCities: string[];
}

interface Registration {
  id: string;
  fullName: string;
  profilePhotoBase64?: string;
  dateOfBirth: string;
  age: number;
  mobileNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  emergencyContact: string;
  selectedServices: string[];
  yearsOfExperience: number;
  languagesKnown: string[];
  certifications?: string;
  specialSkills?: string;
  previousExperience?: string;
  aadhaarBase64?: string;
  drivingLicenseBase64?: string;
  panCardBase64?: string;
  professionalCertBase64?: string;
  policeVerifBase64?: string;
  workingDays: string[];
  preferredTimeSlots: string[];
  preferredCities: string[];
  status: string;
  rejectionReason?: string;
  adminNotes?: string;
  createdAt: string;
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
  const [activeTab, setActiveTab] = useState<"active" | "approvals">("active");

  // State for active attendants tab
  const [searchQuery, setSearchQuery] = useState("");
  const [attendants, setAttendants] = useState<AttendantRow[]>([]);
  const [loadingActive, setLoadingActive] = useState(true);
  const [errorActive, setErrorActive] = useState<string | null>(null);


  // State for registrations tab
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingReg, setLoadingReg] = useState(true);
  const [errorReg, setErrorReg] = useState<string | null>(null);
  

  const [regSearch, setRegSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCity, setFilterCity] = useState('All');
  const [filterService, setFilterService] = useState('All');
  const [filterExp, setFilterExp] = useState('All');
  const [filterWorkingDay, setFilterWorkingDay] = useState('All');
  const [filterWorkingHours, setFilterWorkingHours] = useState('All');
  const [filterPreferredCity, setFilterPreferredCity] = useState('All');

  // Modals / Action States
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [modalType, setModalType] = useState<"reject" | "changes" | "document" | null>(null);
  const [modalText, setModalText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  
  // Document Viewer Modal State
  const [activeDocUrl, setActiveDocUrl] = useState<string | null>(null);
  const [activeDocName, setActiveDocName] = useState<string>("");

  // Fetch active attendants
  const fetchAttendants = async () => {
    setLoadingActive(true);
    try {
      const res = await fetch("/api/attendants");
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
      
      const mapped = data.map((a: any) => {
        let availability = "Offline";
        if (a.account?.status) {
          const statusMap: Record<string, string> = {
            AVAILABLE: "Available",
            BUSY: "Busy",
            ON_DUTY: "On Duty",
            OFFLINE: "Offline",
          };
          availability = statusMap[a.account.status] || "Offline";
        }
        return {
          id: a.id,
          name: a.name,
          location: a.location?.city || "Chennai",
          availability,
          experience: a.experience,
          languages: Array.isArray(a.languages) ? a.languages.join(", ") : "",
          assignedServices: a.bookings?.length || 0,
          workingDays: a.workingDays || [],
          workingHours: a.workingHours || "",
          preferredCities: a.preferredCities || [],
        };
      });

      setAttendants(mapped);
      setErrorActive(null);
    } catch (err: any) {
      setErrorActive(err.message || "Unknown error");
    } finally {
      setLoadingActive(false);
    }
  };

  // Fetch registrations
  const fetchRegistrations = async () => {
    setLoadingReg(true);
    try {
      const res = await fetch("/api/attendant-registration");
      if (!res.ok) throw new Error(`Failed to fetch registrations: ${res.status}`);
      const data = await res.json();
      setRegistrations(data);
      setErrorReg(null);
    } catch (err: any) {
      setErrorReg(err.message || "Unknown error");
    } finally {
      setLoadingReg(false);
    }
  };

  useEffect(() => {
    fetchAttendants();
    fetchRegistrations();
  }, []);

  // Handle updates to registrations status (Approve/Reject/Request Changes)
  const handleUpdateStatus = async (regId: string, newStatus: string, details?: { reason?: string; notes?: string }) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/attendant-registration/${regId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          rejectionReason: details?.reason,
          adminNotes: details?.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update registration status");
      }

      // Close modal
      setModalType(null);
      setSelectedReg(null);
      setModalText("");

      // Refresh both datasets (since approval creates an active attendant)
      await Promise.all([fetchAttendants(), fetchRegistrations()]);
    } catch (err: any) {
      alert(err.message || "Failed to update application status.");
    } finally {
      setActionLoading(false);
    }
  };

  // Compute unique working hours options for filter
  const workingHoursOptions = React.useMemo(() => {
    const hrs = attendants
      .map((a) => a.workingHours)
      .filter((h) => typeof h === "string" && h.trim() !== "");
    return Array.from(new Set(hrs));
  }, [attendants]);

  // Active attendants filtering
  const filteredAttendants = attendants.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDay =
      filterWorkingDay === "All" || (a.workingDays && a.workingDays.includes(filterWorkingDay));
    const matchesHours =
      filterWorkingHours === "All" || a.workingHours === filterWorkingHours;
    const matchesCity =
      filterPreferredCity === "All" || (a.preferredCities && a.preferredCities.includes(filterPreferredCity));
    return matchesSearch && matchesDay && matchesHours && matchesCity;
  });

  // Registrations filtering
  const filteredRegistrations = registrations.filter((r) => {
    const matchesSearch = 
      r.fullName.toLowerCase().includes(regSearch.toLowerCase()) ||
      r.mobileNumber.includes(regSearch) ||
      r.email.toLowerCase().includes(regSearch.toLowerCase());
    
    const matchesStatus = filterStatus === "All" || r.status === filterStatus;
    const matchesCity = filterCity === "All" || r.city === filterCity;
    const matchesService = filterService === "All" || r.selectedServices.includes(filterService);
    
    let matchesExp = true;
    if (filterExp !== "All") {
      const minExp = parseInt(filterExp, 10);
      matchesExp = r.yearsOfExperience >= minExp;
    }

    return matchesSearch && matchesStatus && matchesCity && matchesService && matchesExp;
  });

  const viewDocument = (docBase64: string | undefined, docName: string) => {
    if (!docBase64) {
      alert("No document uploaded for this field.");
      return;
    }
    setActiveDocUrl(docBase64);
    setActiveDocName(docName);
    setModalType("document");
  };

  const isPDF = (url: string) => url.startsWith("data:application/pdf");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Attendant Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage verified female attendants and approve registration applications</p>
          </div>
          
          {/* Tab buttons */}
          <div className="bg-gray-100 p-1 rounded-xl flex space-x-1 self-start sm:self-auto shadow-inner">
            <button
              id="active-attendants-tab"
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === "active"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Active Attendants ({attendants.length})
            </button>
            <button
              id="registration-approvals-tab"
              onClick={() => setActiveTab("approvals")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                activeTab === "approvals"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Registration Approvals
              {registrations.filter(r => r.status === "Pending Approval").length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: ACTIVE ATTENDANTS */}
        {activeTab === "active" && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {(["Available", "Busy", "On Duty", "Offline"] as AttStatus[]).map((s) => {
                const count = attendants.filter((a) => a.availability === s).length;
                return (
                  <div key={s} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${statusDot[s]}`} />
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{s}</span>
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900">{count}</p>
                  </div>
                );
              })}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none bg-white transition-all"
                />
              </div>
              {/* Working Day Filter */}
              <select
                value={filterWorkingDay}
                onChange={(e) => setFilterWorkingDay(e.target.value)}
                className="w-full md:w-auto px-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none bg-white text-gray-700 font-medium"
              >
                <option value="All">All Days</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
              {/* Working Hours Filter */}
              <select
                  value={filterWorkingHours}
                  onChange={(e) => setFilterWorkingHours(e.target.value)}
                  className="w-full md:w-auto px-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none bg-white text-gray-700 font-medium"
                >
                  <option value="All">All Hours</option>
                  {workingHoursOptions.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              {/* Preferred City Filter */}
              <select
                value={filterPreferredCity}
                onChange={(e) => setFilterPreferredCity(e.target.value)}
                className="w-full md:w-auto px-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none bg-white text-gray-700 font-medium"
              >
                <option value="All">All Cities</option>
                <option value="Chennai">Chennai</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Coimbatore">Coimbatore</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </div>

            {/* Table or loader */}
            {errorActive && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-semibold">
                Error loading attendants: {errorActive}
              </div>
            )}

            {loadingActive ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="grid grid-cols-6 gap-4 p-4 bg-white rounded-xl shadow-sm animate-pulse border border-gray-100">
                    <div className="col-span-2 h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="col-span-1 h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="col-span-1 h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="col-span-1 h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="col-span-1 h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50/70 border-b border-gray-100">
                        <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Working Days</th>
                        <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Working Hours</th>
                        <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Preferred Cities</th>
                        <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Experience</th>
                        <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Languages</th>
                        <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Active Bookings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredAttendants.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-5 py-10 text-center text-gray-400 text-sm font-medium">
                            No attendants found matching the query.
                          </td>
                        </tr>
                      ) : (
                        filteredAttendants.map((a, idx) => (
                          <tr key={a.id || idx} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                                  {a.name.charAt(0)}
                                </div>
                                <span className="text-sm font-semibold text-gray-900">{a.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className="flex items-center text-sm text-gray-600 font-medium">
                                <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400 shrink-0" />{a.location}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              {a.workingDays && a.workingDays.length > 0 ? a.workingDays.join(', ') : '-'}
                            </td>
                            <td className="px-5 py-4">
                              {a.workingHours || '-'}
                            </td>
                            <td className="px-5 py-4">
                              {a.preferredCities && a.preferredCities.length > 0 ? a.preferredCities.join(', ') : '-'}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusStyles[a.availability]}`}>
                                <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusDot[a.availability]}`} />
                                <span>{a.availability}</span>
                              </span>
                            </td>
                            <td className="px-5 py-4 text-sm text-gray-600 font-medium">{a.experience}</td>
                            <td className="px-5 py-4 text-sm text-gray-500 font-medium">{a.languages}</td>
                            <td className="px-5 py-4 text-sm font-bold text-gray-900 text-center">{a.assignedServices}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50/20">
                  <p className="text-xs text-gray-400 font-medium">{filteredAttendants.length} of {attendants.length} active attendants</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REGISTRATION APPROVALS */}
        {activeTab === "approvals" && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <span>Filters & Search</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Search query */}
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, phone or email..."
                    value={regSearch}
                    onChange={(e) => setRegSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none bg-white"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none bg-white text-gray-700 font-medium"
                  >
                    <option value="All">All Verification Statuses</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Request Changes">Request Changes</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {/* City Filter */}
                <div>
                  <select
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none bg-white text-gray-700 font-medium"
                  >
                    <option value="All">All Cities</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Coimbatore">Coimbatore</option>
                  </select>
                </div>

                {/* Experience Filter */}
                <div>
                  <select
                    value={filterExp}
                    onChange={(e) => setFilterExp(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none bg-white text-gray-700 font-medium"
                  >
                    <option value="All">Any Experience</option>
                    <option value="1">1+ Years Experience</option>
                    <option value="3">3+ Years Experience</option>
                    <option value="5">5+ Years Experience</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Error or Loader */}
            {errorReg && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-semibold">
                Error loading registrations: {errorReg}
              </div>
            )}

            {loadingReg ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-pulse space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                      </div>
                    </div>
                    <div className="h-10 bg-gray-150 rounded" />
                  </div>
                ))}
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400 text-sm font-medium">
                No registration applications found matching the selected filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredRegistrations.map((reg) => {
                  return (
                    <div
                      key={reg.id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col md:flex-row"
                    >
                      {/* Left: Quick overview card */}
                      <div className="p-6 md:w-80 bg-gray-50/50 border-r border-gray-100 flex flex-col items-center text-center shrink-0">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-purple-200 bg-white mb-3">
                          {reg.profilePhotoBase64 ? (
                            <img
                              src={reg.profilePhotoBase64}
                              alt={reg.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                              {reg.fullName.charAt(0)}
                            </div>
                          )}
                        </div>
                        
                        <h3 className="font-bold text-gray-900 text-base leading-snug">{reg.fullName}</h3>
                        <span className="text-xs text-gray-500 font-medium">Age: {reg.age} • DOB: {reg.dateOfBirth}</span>
                        
                        {/* Status Badge */}
                        <div className="mt-3">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            reg.status === "Approved"
                              ? "bg-green-100 text-green-700"
                              : reg.status === "Rejected"
                              ? "bg-rose-100 text-rose-700"
                              : reg.status === "Request Changes"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-purple-100 text-primary animate-pulse"
                          }`}>
                            {reg.status}
                          </span>
                        </div>

                        {/* Quick contacts */}
                        <div className="w-full mt-5 pt-4 border-t border-gray-200/60 text-left space-y-2 text-xs font-semibold text-gray-600">
                          <a href={`tel:${reg.mobileNumber}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span>{reg.mobileNumber}</span>
                          </a>
                          <a href={`mailto:${reg.email}`} className="flex items-center gap-2 hover:text-primary transition-colors overflow-hidden text-ellipsis whitespace-nowrap block">
                            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="overflow-hidden text-ellipsis">{reg.email}</span>
                          </a>
                          <div className="flex items-start gap-2 text-gray-500 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                            <span>{reg.city}, {reg.state}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Full Details & Documents */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          
                          {/* Services */}
                          <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                              <Award className="w-4 h-4 text-purple-400" />
                              Selected Services
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {reg.selectedServices.map(s => (
                                <span key={s} className="bg-purple-50 border border-purple-100 text-primary font-semibold text-xs px-2.5 py-1 rounded-lg">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Experience & Langs */}
                          <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                              <Languages className="w-4 h-4 text-purple-400" />
                              Experience & Languages
                            </h4>
                            <p className="text-xs font-semibold text-gray-800">
                              💼 {reg.yearsOfExperience} Years Experience
                            </p>
                            <p className="text-xs text-gray-500 mt-1 font-semibold">
                              🗣️ {reg.languagesKnown.join(", ")}
                            </p>
                          </div>

                          {/* Extra info */}
                          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs">
                            <div>
                              <span className="text-gray-400 font-medium block">Working Days</span>
                              <span className="font-semibold text-gray-800">{reg.workingDays.join(", ")}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 font-medium block">Preferred Slots</span>
                              <span className="font-semibold text-gray-800">{reg.preferredTimeSlots.join(", ")}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 font-medium block">Special Skills</span>
                              <span className="font-semibold text-gray-800">{reg.specialSkills || "None"}</span>
                            </div>
                          </div>

                          {/* Address & Emergency info */}
                          <div className="sm:col-span-2 text-xs space-y-1">
                            <p className="text-gray-500 font-medium">
                              🏡 <strong className="text-gray-700">Permanent Address:</strong> {reg.address}, PIN {reg.pinCode}
                            </p>
                            {reg.certifications && (
                              <p className="text-gray-500 font-medium">
                                📜 <strong className="text-gray-700">Certifications:</strong> {reg.certifications}
                              </p>
                            )}
                            {reg.previousExperience && (
                              <p className="text-gray-500 font-medium">
                                🏢 <strong className="text-gray-700">Previous Duties:</strong> {reg.previousExperience}
                              </p>
                            )}
                            <p className="text-gray-500 font-medium">
                              🚨 <strong className="text-gray-700">Emergency Contact:</strong> {reg.emergencyContact}
                            </p>
                          </div>

                          {/* Documents grid */}
                          <div className="sm:col-span-2">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Verification Documents</h4>
                            <div className="flex flex-wrap gap-2">
                              
                              {/* Aadhaar card */}
                              <button
                                type="button"
                                onClick={() => viewDocument(reg.aadhaarBase64, "Aadhaar Card")}
                                className="px-3.5 py-2 text-xs bg-gray-50 hover:bg-purple-50 hover:text-primary border border-gray-200 rounded-xl font-semibold flex items-center gap-1.5 transition-all"
                              >
                                <FileText className="w-3.5 h-3.5 text-gray-400" />
                                Aadhaar Card
                              </button>

                              {/* PAN Card */}
                              <button
                                type="button"
                                onClick={() => viewDocument(reg.panCardBase64, "PAN Card")}
                                className="px-3.5 py-2 text-xs bg-gray-50 hover:bg-purple-50 hover:text-primary border border-gray-200 rounded-xl font-semibold flex items-center gap-1.5 transition-all"
                              >
                                <FileText className="w-3.5 h-3.5 text-gray-400" />
                                PAN Card
                              </button>

                              {/* Driving License */}
                              {reg.drivingLicenseBase64 ? (
                                <button
                                  type="button"
                                  onClick={() => viewDocument(reg.drivingLicenseBase64, "Driving License")}
                                  className="px-3.5 py-2 text-xs bg-gray-50 hover:bg-purple-50 hover:text-primary border border-gray-200 rounded-xl font-semibold flex items-center gap-1.5 transition-all"
                                >
                                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                                  Driving License
                                </button>
                              ) : (
                                reg.selectedServices.includes("Women Driver") && (
                                  <span className="px-3.5 py-2 text-xs bg-red-50 text-red-600 border border-red-100 rounded-xl font-semibold flex items-center gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    No DL uploaded!
                                  </span>
                                )
                              )}

                              {/* Police verification */}
                              {reg.policeVerifBase64 && (
                                <button
                                  type="button"
                                  onClick={() => viewDocument(reg.policeVerifBase64, "Police Verification")}
                                  className="px-3.5 py-2 text-xs bg-gray-50 hover:bg-purple-50 hover:text-primary border border-gray-200 rounded-xl font-semibold flex items-center gap-1.5 transition-all"
                                >
                                  <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                                  Police verification
                                </button>
                              )}

                              {/* Professional Certificate */}
                              {reg.professionalCertBase64 && (
                                <button
                                  type="button"
                                  onClick={() => viewDocument(reg.professionalCertBase64, "Professional Certificate")}
                                  className="px-3.5 py-2 text-xs bg-gray-50 hover:bg-purple-50 hover:text-primary border border-gray-200 rounded-xl font-semibold flex items-center gap-1.5 transition-all"
                                >
                                  <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                                  Course Certificate
                                </button>
                              )}

                            </div>
                          </div>

                        </div>

                        {/* Admin Notes / Rejection Reason Display if any */}
                        {(reg.adminNotes || reg.rejectionReason) && (
                          <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 text-xs leading-relaxed space-y-1">
                            {reg.adminNotes && (
                              <p className="text-gray-700">
                                <strong className="text-primary">Admin Internal Notes:</strong> {reg.adminNotes}
                              </p>
                            )}
                            {reg.rejectionReason && (
                              <p className="text-rose-700">
                                <strong>Rejection/Request Details:</strong> {reg.rejectionReason}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Admin Action Buttons */}
                        {reg.status !== "Approved" && reg.status !== "Rejected" && (
                          <div className="flex flex-wrap gap-2.5 justify-end pt-4 border-t border-gray-100">
                            {reg.status !== "Under Review" && (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(reg.id, "Under Review")}
                                className="px-4 py-2 text-xs bg-white text-gray-600 hover:text-primary border border-gray-200 rounded-xl font-semibold flex items-center gap-1.5 transition-all active:scale-[0.98]"
                              >
                                Mark Under Review
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReg(reg);
                                setModalType("changes");
                              }}
                              className="px-4 py-2 text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/50 rounded-xl font-semibold flex items-center gap-1.5 transition-all active:scale-[0.98]"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              Request Changes
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReg(reg);
                                setModalType("reject");
                              }}
                              className="px-4 py-2 text-xs bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200/50 rounded-xl font-semibold flex items-center gap-1.5 transition-all active:scale-[0.98]"
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(reg.id, "Approved")}
                              className="px-5 py-2 text-xs bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-green-500/10 active:scale-[0.98]"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              Approve Partner
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* MODAL SYSTEM */}
        {modalType && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-gray-100 max-w-xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              
              {/* Document Viewer Modal Content */}
              {modalType === "document" && activeDocUrl && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <h3 className="font-bold text-gray-900 text-base">{activeDocName} Preview</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setModalType(null);
                        setActiveDocUrl(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 font-semibold"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-xl max-h-[420px] overflow-auto flex items-center justify-center p-4">
                    {isPDF(activeDocUrl) ? (
                      <div className="text-center py-10 space-y-4">
                        <FileText className="w-16 h-16 text-primary mx-auto" />
                        <p className="text-xs text-gray-500">This document is a PDF scan and cannot be rendered directly.</p>
                      </div>
                    ) : (
                      <img
                        src={activeDocUrl}
                        alt={activeDocName}
                        className="max-w-full max-h-[380px] object-contain rounded-lg"
                      />
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                    <a
                      href={activeDocUrl}
                      download={activeDocName.replace(/\s+/g, "_")}
                      className="px-4 py-2 bg-primary hover:bg-purple-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Document
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setModalType(null);
                        setActiveDocUrl(null);
                      }}
                      className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-semibold transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {/* Reject / Changes Form Modal Content */}
              {(modalType === "reject" || modalType === "changes") && selectedReg && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <h3 className="font-bold text-gray-900 text-base">
                      {modalType === "reject" ? "Reject Application" : "Request Document/Detail Changes"}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setModalType(null);
                        setSelectedReg(null);
                        setModalText("");
                      }}
                      className="text-gray-400 hover:text-gray-600 font-semibold"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {modalType === "reject" 
                        ? `Please specify why you are rejecting ${selectedReg.fullName}'s application. This message will be logged and sent as notification updates.`
                        : `Please describe what changes/documents ${selectedReg.fullName} needs to update. E.g. 'Upload clearer PAN card image'`
                      }
                    </p>
                    <textarea
                      value={modalText}
                      onChange={(e) => setModalText(e.target.value)}
                      rows={4}
                      placeholder="Enter explanation details here..."
                      className="w-full px-3 py-2 text-xs border border-gray-200 focus:border-primary focus:ring-1 focus:ring-purple-100 outline-none rounded-xl bg-gray-50/50"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        setModalType(null);
                        setSelectedReg(null);
                        setModalText("");
                      }}
                      className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-semibold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading || !modalText.trim()}
                      onClick={() => {
                        const nextStatus = modalType === "reject" ? "Rejected" : "Request Changes";
                        handleUpdateStatus(selectedReg.id, nextStatus, { reason: modalText });
                      }}
                      className={`px-5 py-2 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                        modalType === "reject" 
                          ? "bg-rose-600 hover:bg-rose-700" 
                          : "bg-amber-600 hover:bg-amber-700"
                      } disabled:opacity-50`}
                    >
                      Confirm Action
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
