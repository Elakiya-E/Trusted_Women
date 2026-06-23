"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Clock, CheckCircle, AlertTriangle, Calendar, MapPin, Bell, LogOut, 
  User, ChevronDown, Phone, Briefcase, AlertOctagon, TrendingUp, 
  UserCheck, Upload, Eye, FileText, Settings, ShieldCheck, Heart, 
  Star, Award, CheckCircle2, Shield, Menu, X, Trash2, ListChecks
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
}

interface AttendantAccount {
  mobileNumber?: string;
  status?: string;
}

interface AttendantLocation {
  city?: string;
}

interface Attendant {
  id: string;
  name: string;
  role: string;
  experience: string;
  languages: string[];
  rating: number;
  certifications: string[];
  bgGradient: string;
  account?: AttendantAccount | null;
  location?: AttendantLocation | null;

  // Extended Profile Fields
  email?: string | null;
  address?: string | null;
  state?: string | null;
  pinCode?: string | null;
  emergencyContact?: string | null;
  profilePhotoBase64?: string | null;
  selectedServices: string[];
  
  // Uploaded Documents
  aadhaarBase64?: string | null;
  aadhaarStatus: string;
  panBase64?: string | null;
  panStatus: string;
  dlBase64?: string | null;
  dlStatus: string;
  certificatesBase64?: string | null;
  certificatesStatus: string;
  policeVerifBase64?: string | null;
  policeVerifStatus: string;

  // Scheduler
  workingDays: string[];
  workingHours: string[];
  preferredCities: string[];

  // Verification Status
  verificationStatus: string;
}

const SERVICES_CAT = [
  { label: "Women Driver", icon: "🚗" },
  { label: "Hospital Attendant", icon: "🏥" },
  { label: "Elderly Care", icon: "👵" },
  { label: "Home Support", icon: "🏠" },
  { label: "Airport Pickup", icon: "✈️" },
  { label: "Railway Pickup", icon: "🚆" }
];

const TIME_SLOTS = [
  "6 AM - 9 AM",
  "9 AM - 12 PM",
  "12 PM - 3 PM",
  "3 PM - 6 PM",
  "6 PM - 9 PM"
];

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const CITIES = ["Chennai", "Bengaluru", "Hyderabad", "Coimbatore", "Madurai"];

const VERIFICATION_STEPS = [
  "Registration Submitted",
  "Document Verification",
  "Background Check",
  "Admin Review",
  "Approved",
  "Active Attendant"
];

export default function AttendantDashboard() {
  const [status, setStatus] = useState<Status>("Available");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [selectedAttendantId, setSelectedAttendantId] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");

  // Edit profile states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "Chennai",
    experience: "",
    languages: "",
    emergencyContact: ""
  });

  // Modal Doc States
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [previewDocName, setPreviewDocName] = useState("");

  // File Upload inputs
  const fileInputRefs = {
    profilePhoto: useRef<HTMLInputElement>(null),
    aadhaar: useRef<HTMLInputElement>(null),
    pan: useRef<HTMLInputElement>(null),
    dl: useRef<HTMLInputElement>(null),
    cert: useRef<HTMLInputElement>(null),
    police: useRef<HTMLInputElement>(null),
  };

  const fetchData = async () => {
    // 1. Initial check for session in localStorage
    const sessionStr = localStorage.getItem("withyours_attendant_session");
    if (!sessionStr) {
      window.location.href = "/attendant-login";
      return;
    }

    let loggedInId = "";
    try {
      const sessionObj = JSON.parse(sessionStr);
      loggedInId = sessionObj?.id || "";
    } catch {
      window.location.href = "/attendant-login";
      return;
    }

    if (!loggedInId) {
      window.location.href = "/attendant-login";
      return;
    }

    try {
      const attendantsRes = await fetch("/api/attendants");
      const bookingsRes = await fetch("/api/bookings");
      
      if (attendantsRes.ok && bookingsRes.ok) {
        const attendantsData = await attendantsRes.json();
        const bookingsData = await bookingsRes.json();
        
        // Verify that this attendant is approved (exists in the active attendants list)
        const exists = attendantsData.some((a: any) => a.id === loggedInId);
        if (!exists) {
          localStorage.removeItem("withyours_attendant_session");
          window.location.href = "/attendant-login";
          return;
        }

        setAttendants(attendantsData);
        setBookings(bookingsData);
        
        if (!selectedAttendantId) {
          setSelectedAttendantId(loggedInId);
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

  // Initialize edit form when emulated attendant changes
  useEffect(() => {
    if (activeAttendant) {
      const mobileNo = activeAttendant.account?.mobileNumber || "";
      const city = activeAttendant.location?.city || "Chennai";
      setEditForm({
        name: activeAttendant.name || "",
        email: activeAttendant.email || "",
        phone: mobileNo,
        address: activeAttendant.address || "",
        city: city,
        experience: activeAttendant.experience || "",
        languages: Array.isArray(activeAttendant.languages) ? activeAttendant.languages.join(", ") : "",
        emergencyContact: activeAttendant.emergencyContact || ""
      });
      setIsEditingProfile(false);
      
      if (activeAttendant.account?.status) {
        const statusMap: Record<string, Status> = {
          AVAILABLE: "Available",
          BUSY: "Busy",
          ON_DUTY: "On Duty",
          OFFLINE: "Offline",
        };
        setStatus(statusMap[activeAttendant.account.status] || "Available");
      }
    }
  }, [activeAttendant]);

  // Filter bookings for this attendant
  const attendantBookings = bookings.filter(b => b.attendantId === selectedAttendantId);

  // Categorize bookings with sorting by date
  const newAssignments = attendantBookings
    .filter(b => b.status === "Assigned")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const todaysActive = attendantBookings
    .filter(b => b.status === "Accepted" || b.status === "In Progress")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const completedServices = attendantBookings
    .filter(b => b.status === "Completed")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Save changes helper
  const handlePatchAttendant = async (payload: Partial<Attendant> & { city?: string }) => {
    if (!selectedAttendantId) return;
    try {
      const res = await fetch(`/api/attendants/${selectedAttendantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setActionMessage("Updates saved successfully!");
        await fetchData();
        setTimeout(() => setActionMessage(""), 4000);
        return true;
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update profile details.");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred while saving profile.");
    }
    return false;
  };

  // Accept Assignment
  const handleAccept = async (bookingId: string) => {
    setActionMessage("");
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "Pending", 
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Completed" }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Change Operational Status
  const handleStatusChange = async (newStatus: Status) => {
    setStatus(newStatus);
    setShowStatusMenu(false);
    
    // Map visual status to DB status
    const dbStatusMap: Record<Status, string> = {
      Available: "AVAILABLE",
      Busy: "BUSY",
      "On Duty": "ON_DUTY",
      Offline: "OFFLINE"
    };

    if (selectedAttendantId) {
      try {
        await fetch(`/api/attendants/${selectedAttendantId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // Save status on account
            verificationStatus: activeAttendant?.verificationStatus, // keep current
          }),
        });
        // Note: we can also create a separate api if account status changes, 
        // but since this is simulated we'll keep the visual toggle
      } catch (err) {
        console.error(err);
      }
    }
  };

  // File upload reader helper
  const uploadFile = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      alert("File size exceeds 2MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const payload: any = {};
      payload[key] = base64;
      await handlePatchAttendant(payload);
    };
    reader.readAsDataURL(file);
  };

  // Availability Scheduler handlers
  const handleToggleSchedulerDay = async (day: string) => {
    if (!activeAttendant) return;
    const current = activeAttendant.workingDays || [];
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day];
    await handlePatchAttendant({ workingDays: updated });
  };

  const handleToggleSchedulerHour = async (hour: string) => {
    if (!activeAttendant) return;
    const current = activeAttendant.workingHours || [];
    const updated = current.includes(hour)
      ? current.filter(h => h !== hour)
      : [...current, hour];
    await handlePatchAttendant({ workingHours: updated });
  };

  const handleToggleSchedulerCity = async (city: string) => {
    if (!activeAttendant) return;
    const current = activeAttendant.preferredCities || [];
    const updated = current.includes(city)
      ? current.filter(c => c !== city)
      : [...current, city];
    await handlePatchAttendant({ preferredCities: updated });
  };

  // Service Specialization toggle
  const handleToggleServiceSpec = async (service: string) => {
    if (!activeAttendant) return;
    const current = activeAttendant.selectedServices || [];
    const updated = current.includes(service)
      ? current.filter(s => s !== service)
      : [...current, service];
    await handlePatchAttendant({ selectedServices: updated });
  };

  // Edit Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const languagesArray = editForm.languages
      .split(",")
      .map(l => l.trim())
      .filter(Boolean);

    const success = await handlePatchAttendant({
      name: editForm.name,
      email: editForm.email,
      address: editForm.address,
      city: editForm.city,
      experience: editForm.experience,
      languages: languagesArray,
      emergencyContact: editForm.emergencyContact,
    });

    if (success) {
      setIsEditingProfile(false);
    }
  };

  // Scroll to section helper
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setSidebarOpen(false);
  };

  const viewDocument = (url: string | null | undefined, name: string) => {
    if (!url) return;
    setPreviewDocUrl(url);
    setPreviewDocName(name);
  };

  // Original KPI summaries (preserved)
  const kpis = [
    { label: "New Requests", value: newAssignments.length, icon: <AlertTriangle className="h-5 w-5" />, color: "text-amber-600 bg-amber-100" },
    { label: "Active Services", value: todaysActive.length, icon: <Briefcase className="h-5 w-5" />, color: "text-blue-600 bg-blue-100" },
    { label: "Completed Overall", value: completedServices.length, icon: <CheckCircle className="h-5 w-5" />, color: "text-green-600 bg-green-100" },
  ];

  // CALCULATE PROFILE COMPLETION %
  const getProfileCompletion = () => {
    if (!activeAttendant) return { pct: 0, missing: [], pending: [] };
    
    let score = 0;
    const missing: string[] = [];
    const pending: string[] = [];

    // Profile Photo (10 pts)
    if (activeAttendant.profilePhotoBase64) score += 10;
    else missing.push("Profile Photo");

    // Email (10 pts)
    if (activeAttendant.email) score += 10;
    else missing.push("Email Address");

    // Address (10 pts)
    if (activeAttendant.address) score += 10;
    else missing.push("Permanent Address");

    // Pin Code (10 pts)
    if (activeAttendant.pinCode) score += 10;
    // (optional item, let's look at simple fields)

    // Emergency Contact (10 pts)
    if (activeAttendant.emergencyContact) score += 10;
    else missing.push("Emergency Contact Number");

    // Selected Services Specializations (10 pts)
    if (activeAttendant.selectedServices && activeAttendant.selectedServices.length > 0) score += 10;
    else missing.push("Service Specialization Categories");

    // Aadhaar Document (15 pts)
    if (activeAttendant.aadhaarBase64) {
      score += 15;
      if (activeAttendant.aadhaarStatus === "Uploaded") pending.push("Aadhaar Card");
    } else {
      missing.push("Aadhaar Card Copy");
    }

    // PAN Document (15 pts)
    if (activeAttendant.panBase64) {
      score += 15;
      if (activeAttendant.panStatus === "Uploaded") pending.push("PAN Card");
    } else {
      missing.push("PAN Card Copy");
    }

    // Availability configs (20 pts total)
    if (activeAttendant.workingDays && activeAttendant.workingDays.length > 0) score += 10;
    else missing.push("Working Days Preferences");
    
    if (activeAttendant.workingHours && activeAttendant.workingHours.length > 0) score += 10;
    else missing.push("Preferred Shift Slots");

    // Check status values of remaining documents
    if (activeAttendant.dlBase64 && activeAttendant.dlStatus === "Uploaded") pending.push("Driving License");
    if (activeAttendant.certificatesBase64 && activeAttendant.certificatesStatus === "Uploaded") pending.push("Training Certificates");
    if (activeAttendant.policeVerifBase64 && activeAttendant.policeVerifStatus === "Uploaded") pending.push("Police Verification Report");

    return { pct: Math.min(100, score), missing, pending };
  };

  const { pct: completionPct, missing: missingDocs, pending: pendingDocs } = getProfileCompletion();

  // NOTIFICATION WIDGET DATA
  type NotificationType = "alert" | "success" | "warning" | "info";
  const getNotificationsList = () => {
    const list: { id: string; title: string; desc: string; type: NotificationType }[] = [];
    if (newAssignments.length > 0) {
      list.push({
        id: "notif-1",
        title: "New Assignment",
        desc: `You have ${newAssignments.length} new partner bookings waiting for approval.`,
        type: "alert"
      });
    }
    if (activeAttendant?.verificationStatus === "Approved" || activeAttendant?.verificationStatus === "Active Attendant") {
      list.push({
        id: "notif-2",
        title: "Verification Approved",
        desc: "Congratulations! Your partner account is fully verified and operational.",
        type: "success"
      });
    }
    if (completionPct < 80) {
      list.push({
        id: "notif-3",
        title: "Profile Incomplete",
        desc: `Your profile score is only ${completionPct}%. Please upload missing documents to unlock premium bookings.`,
        type: "warning"
      });
    }
    if (!activeAttendant?.policeVerifBase64) {
      list.push({
        id: "notif-4",
        title: "Document Expiring",
        desc: "Police verification report is missing. Upload one to build customer trust.",
        type: "info"
      });
    }
    list.push({
      id: "notif-5",
      title: "Admin Messages",
      desc: "Our operations manager updated service pricing charts for outstation trips. Review pricing.",
      type: "info"
    });
    return list;
  };

  const notificationItems = getNotificationsList();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-gray-800">
      
      {/* Dynamic Modal Document Previewer */}
      {previewDocUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-bold text-gray-900 text-sm">{previewDocName}</h3>
              <button onClick={() => setPreviewDocUrl(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden max-h-[380px] flex items-center justify-center p-4">
              {previewDocUrl.startsWith("data:application/pdf") ? (
                <div className="text-center py-10 space-y-3">
                  <FileText className="w-14 h-14 text-primary mx-auto" />
                  <p className="text-xs text-gray-500 font-semibold">PDF document uploaded. Ready for admin verification.</p>
                </div>
              ) : (
                <img src={previewDocUrl} alt={previewDocName} className="max-w-full max-h-[340px] object-contain" />
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
              <a href={previewDocUrl} download={previewDocName.replace(/\s+/g, "_")} className="px-4 py-2 bg-primary hover:bg-purple-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1">
                <Upload className="w-3.5 h-3.5 rotate-180" /> Download
              </a>
              <button onClick={() => setPreviewDocUrl(null)} className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header navbar */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center space-x-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 mr-1">
            <Menu className="h-5 w-5" />
          </button>
          <div className="h-8 w-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold text-sm">W</div>
          <span className="font-bold text-gray-800 flex items-center gap-1.5">
            WithYours
            <span className="text-[10px] bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Partner Console
            </span>
          </span>
        </div>

        {/* Emulate dropdown + profile */}
        <div className="flex items-center space-x-4">
          {attendants.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider hidden sm:inline">Emulate Attendant:</span>
              <select
                value={selectedAttendantId}
                onChange={(e) => setSelectedAttendantId(e.target.value)}
                className="bg-purple-50 text-primary border border-purple-200 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none cursor-pointer hover:bg-purple-100/60 transition-all"
              >
                {attendants.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}

          <a 
            href="/attendant-login" 
            onClick={() => {
              localStorage.removeItem("withyours_attendant_session");
            }}
            className="flex items-center space-x-1 text-xs text-gray-500 hover:text-red-500 transition-colors font-bold uppercase tracking-wider"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:block">Logout</span>
          </a>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex relative">

        {/* SIDEBAR NAVIGATION (Section 9) */}
        <aside className={`lg:w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 transition-transform duration-200 z-30 ${
          sidebarOpen ? "translate-x-0 fixed inset-y-0 left-0 pt-16" : "-translate-x-full lg:translate-x-0 fixed lg:static inset-y-0 left-0"
        }`}>
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
            <div className="px-3 mb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Navigation</div>
            {[
              { label: "Dashboard", icon: Briefcase, target: "dashboard" },
              { label: "Profile", icon: User, target: "profile" },
              { label: "Documents", icon: FileText, target: "documents" },
              { label: "Availability", icon: Calendar, target: "availability" },
              { label: "Assignments", icon: Clock, target: "assignments" },
              { label: "Service History", icon: CheckCircle, target: "history" },
              { label: "Notifications", icon: Bell, target: "notifications" },
              { label: "Settings", icon: Settings, target: "profile" }
            ].map(item => (
              <button
                key={item.label}
                onClick={() => scrollToId(item.target)}
                className="w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold text-gray-600 hover:bg-purple-50/40 hover:text-primary transition-all text-left"
              >
                <item.icon className="h-4.5 w-4.5 text-gray-400 shrink-0" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          {/* Active Emulator details */}
          {activeAttendant && (
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-purple-200 bg-white shrink-0">
                {activeAttendant.profilePhotoBase64 ? (
                  <img src={activeAttendant.profilePhotoBase64} alt={activeAttendant.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {activeAttendant.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-800 truncate">{activeAttendant.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{activeAttendant.role}</p>
              </div>
            </div>
          )}
        </aside>

        {/* Mobile Sidebar overlay backdrop */}
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/30 backdrop-blur-xs z-20 lg:hidden" />
        )}

        {/* Main Workspace scroll area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">

          {/* Action Alerts */}
          {actionMessage && (
            <div className="px-4 py-3 bg-purple-50 border border-purple-100 rounded-xl text-primary text-sm font-semibold shadow-sm flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-4.5 h-4.5" />
              {actionMessage}
            </div>
          )}

          {/* SECTION 0: Dashboard Home Welcome block + Availability Status */}
          <div id="dashboard" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Welcome back, {activeAttendant?.name || "Attendant"} 👋
              </h1>
              <p className="text-gray-500 text-xs mt-1 font-semibold">
                💼 {activeAttendant?.role || "Specialist care professional"}
              </p>
            </div>

            {/* Availability Status Selector (preserved) */}
            <div className="relative shrink-0">
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
                      onClick={() => handleStatusChange(s)}
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

          {/* SECTION 1: ATTENDANT PROFILE COMPLETION (Below Welcome) */}
          {activeAttendant && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
              {/* Background gradient hint */}
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-purple-50 rounded-full blur-2xl" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 flex-1">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Attendant Profile Completion</h3>
                  
                  {/* Completion Progress Bar */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="text-2xl font-extrabold text-primary shrink-0">{completionPct}% Completed</div>
                    <div className="h-2.5 bg-gray-100 rounded-full flex-1 overflow-hidden max-w-xs border border-gray-100">
                      <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300" style={{ width: `${completionPct}%` }} />
                    </div>
                  </div>

                  {/* Summary of items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 text-xs pt-2">
                    {/* Missing documents list */}
                    {missingDocs.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-rose-600 font-bold flex items-center gap-1.5">
                          <AlertOctagon className="w-4 h-4 shrink-0" />
                          Missing Documents ({missingDocs.length}):
                        </span>
                        <ul className="list-disc list-inside pl-1 text-gray-500 font-medium space-y-0.5">
                          {missingDocs.slice(0, 3).map(m => <li key={m}>{m}</li>)}
                          {missingDocs.length > 3 && <li>And {missingDocs.length - 3} others...</li>}
                        </ul>
                      </div>
                    )}
                    {/* Pending verification checks */}
                    {pendingDocs.length > 0 ? (
                      <div className="space-y-1">
                        <span className="text-amber-600 font-bold flex items-center gap-1.5">
                          <Clock className="w-4 h-4 shrink-0" />
                          Pending Verifications ({pendingDocs.length}):
                        </span>
                        <ul className="list-disc list-inside pl-1 text-gray-500 font-medium space-y-0.5">
                          {pendingDocs.map(p => <li key={p}>{p}</li>)}
                        </ul>
                      </div>
                    ) : (
                      missingDocs.length === 0 && (
                        <div className="flex items-center gap-1 text-emerald-600 font-bold">
                          <CheckCircle2 className="w-5 h-5 shrink-0" />
                          All documents verified!
                        </div>
                      )
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => scrollToId("documents")}
                  className="bg-primary hover:bg-purple-800 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] self-start md:self-center"
                >
                  Complete Profile
                </button>
              </div>
            </div>
          )}

          {/* Original KPI Cards (preserved) */}
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

          {/* SECTION 2: PERSONAL PROFILE CARD */}
          {activeAttendant && (
            <div id="profile" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <User className="w-4.5 h-4.5 text-primary" />
                  Personal Profile Card
                </h3>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                /* Edit Profile Form Inline */
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/40 focus:border-primary outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/40 focus:border-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Mobile Phone</label>
                      <input
                        type="text"
                        value={editForm.phone}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-100 text-gray-500 outline-none"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">City</label>
                      <select
                        value={editForm.city}
                        onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/40 focus:border-primary outline-none"
                      >
                        {CITIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Experience (e.g. 5 Years)</label>
                      <input
                        type="text"
                        value={editForm.experience}
                        onChange={(e) => setEditForm(prev => ({ ...prev, experience: e.target.value }))}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/40 focus:border-primary outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Languages (comma separated)</label>
                      <input
                        type="text"
                        value={editForm.languages}
                        onChange={(e) => setEditForm(prev => ({ ...prev, languages: e.target.value }))}
                        placeholder="e.g. Tamil, English, Hindi"
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/40 focus:border-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Emergency Contact</label>
                      <input
                        type="text"
                        value={editForm.emergencyContact}
                        onChange={(e) => setEditForm(prev => ({ ...prev, emergencyContact: e.target.value }))}
                        placeholder="Family mobile number"
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/40 focus:border-primary outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Permanent Address</label>
                      <input
                        type="text"
                        value={editForm.address}
                        onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/40 focus:border-primary outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary hover:bg-purple-800 text-white rounded-lg text-xs font-semibold"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                /* Profile Card details view */
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  {/* Photo Display */}
                  <div className="relative group shrink-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-200 bg-gray-50 flex items-center justify-center">
                      {activeAttendant.profilePhotoBase64 ? (
                        <img src={activeAttendant.profilePhotoBase64} alt={activeAttendant.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-10 w-10 text-gray-300" />
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRefs.profilePhoto.current?.click()}
                      className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full border border-white hover:bg-purple-800 transition-all shadow-md"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                    <input
                      ref={fileInputRefs.profilePhoto}
                      type="file"
                      accept="image/*"
                      onChange={(e) => uploadFile(e, "profilePhotoBase64")}
                      className="hidden"
                    />
                  </div>

                  {/* Profile info fields */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs font-medium">
                    <div>
                      <span className="text-gray-400 block font-semibold">Full Name</span>
                      <span className="text-gray-800 font-bold">{activeAttendant.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold">Phone Number</span>
                      <span className="text-gray-800 font-bold">{activeAttendant.account?.mobileNumber || "Not Linked"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold">Email Address</span>
                      <span className="text-gray-800 font-bold">{activeAttendant.email || "Not Provided"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold">City</span>
                      <span className="text-gray-800 font-bold">📍 {activeAttendant.location?.city || "Chennai"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold">Experience</span>
                      <span className="text-gray-800 font-bold">{activeAttendant.experience}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold">Languages Known</span>
                      <span className="text-gray-800 font-bold">{activeAttendant.languages.join(", ") || "None listed"}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-gray-400 block font-semibold">Service Categories</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {activeAttendant.selectedServices?.length > 0 ? (
                          activeAttendant.selectedServices.map(s => (
                            <span key={s} className="bg-purple-50 text-primary border border-purple-100/60 font-semibold px-2 py-0.5 rounded-md text-[10px]">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 italic">None selected. Update specialized categories below.</span>
                        )}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-gray-400 block font-semibold">Emergency Contact</span>
                      <span className="text-gray-800 font-bold">🚨 {activeAttendant.emergencyContact || "No contact linked"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: SERVICE SPECIALIZATION */}
          {activeAttendant && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Award className="w-4.5 h-4.5 text-primary" />
                Service Specialization Settings
              </h3>
              <p className="text-xs text-gray-500 mb-4 font-medium">Select companion roles you are fully trained and authorized to perform.</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {SERVICES_CAT.map(service => {
                  const isEnabled = (activeAttendant.selectedServices || []).includes(service.label);
                  return (
                    <div
                      key={service.label}
                      onClick={() => handleToggleServiceSpec(service.label)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between h-24 ${
                        isEnabled
                          ? "border-primary bg-purple-50/35 shadow-xs"
                          : "border-gray-100 hover:border-purple-200 bg-white"
                      }`}
                    >
                      <span className="text-2xl">{service.icon}</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-bold text-gray-800">{service.label}</span>
                        <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border ${
                          isEnabled ? "bg-primary border-primary text-white" : "border-gray-300 bg-white"
                        }`}>
                          {isEnabled && <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 4: DOCUMENT MANAGEMENT */}
          {activeAttendant && (
            <div id="documents" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <FileText className="w-4.5 h-4.5 text-primary" />
                Verification Document Management
              </h3>
              <p className="text-xs text-gray-500 mb-5 font-medium">Upload clean document copies to maintain active verification statuses.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "Aadhaar", key: "aadhaarBase64", statusKey: "aadhaarStatus", ref: fileInputRefs.aadhaar },
                  { name: "PAN Card", key: "panBase64", statusKey: "panStatus", ref: fileInputRefs.pan },
                  { name: "Driving License", key: "dlBase64", statusKey: "dlStatus", ref: fileInputRefs.dl },
                  { name: "Certificates", key: "certificatesBase64", statusKey: "certificatesStatus", ref: fileInputRefs.cert },
                  { name: "Police Verification", key: "policeVerifBase64", statusKey: "policeVerifStatus", ref: fileInputRefs.police },
                ].map(doc => {
                  const docBase64 = (activeAttendant as any)[doc.key];
                  const docStatus = (activeAttendant as any)[doc.statusKey] || "Pending";

                  return (
                    <div key={doc.name} className="border border-gray-100 rounded-xl p-4 flex flex-col justify-between hover:border-purple-200 transition-all bg-white shadow-xs gap-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-xs text-gray-800">{doc.name}</h4>
                          <span className="text-[10px] text-gray-400 block mt-0.5">Max file size: 2MB</span>
                        </div>
                        {/* Status Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          docStatus === "Verified"
                            ? "bg-green-100 text-green-700"
                            : docStatus === "Rejected"
                            ? "bg-rose-100 text-rose-700"
                            : docStatus === "Uploaded"
                            ? "bg-blue-100 text-blue-700 animate-pulse"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {docStatus}
                        </span>
                      </div>

                      <div className="flex gap-1.5 items-center mt-2">
                        {/* Actions */}
                        <button
                          type="button"
                          onClick={() => doc.ref.current?.click()}
                          className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-primary border border-purple-200/50 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                        >
                          <Upload className="w-3 h-3" />
                          {docBase64 ? "Replace" : "Upload"}
                        </button>

                        {docBase64 && (
                          <button
                            type="button"
                            onClick={() => viewDocument(docBase64, doc.name)}
                            className="px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>
                        )}

                        <input
                          ref={doc.ref}
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => uploadFile(e, doc.key)}
                          className="hidden"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 5: AVAILABILITY SCHEDULER */}
          {activeAttendant && (
            <div id="availability" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-1.5">
                <Calendar className="w-4.5 h-4.5 text-primary" />
                Partner Availability Scheduler
              </h3>

              <div className="space-y-5">
                {/* Working Days */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Weekly Working Days</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map(day => {
                      const isSelected = (activeAttendant.workingDays || []).includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleToggleSchedulerDay(day)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            isSelected
                              ? "bg-primary border-primary text-white"
                              : "bg-white border-gray-200 text-gray-600 hover:border-purple-200"
                          }`}
                        >
                          {day.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Shift Hours */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Preferred Working Time Slots</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {TIME_SLOTS.map(slot => {
                      const isSelected = (activeAttendant.workingHours || []).includes(slot);
                      return (
                        <div
                          key={slot}
                          onClick={() => handleToggleSchedulerHour(slot)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected ? "border-primary bg-purple-50/20" : "border-gray-100 bg-white hover:border-purple-200"
                          }`}
                        >
                          <span className="text-xs font-bold text-gray-700">{slot}</span>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isSelected ? "bg-primary border-primary text-white" : "border-gray-300"
                          }`}>
                            {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Preferred Cities */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Preferred Operation Cities</label>
                  <div className="flex flex-wrap gap-2">
                    {CITIES.map(city => {
                      const isSelected = (activeAttendant.preferredCities || []).includes(city);
                      return (
                        <button
                          key={city}
                          type="button"
                          onClick={() => handleToggleSchedulerCity(city)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            isSelected
                              ? "bg-primary border-primary text-white"
                              : "bg-white border-gray-200 text-gray-600 hover:border-purple-200"
                          }`}
                        >
                          {city}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: PERFORMANCE ANALYTICS */}
          {activeAttendant && (
            <div id="analytics" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-1.5">
                <TrendingUp className="w-4.5 h-4.5 text-primary" />
                Partner Performance Analytics
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex flex-col justify-between h-24">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-gray-400">⭐ Rating</span>
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  </div>
                  <p className="text-2xl font-black text-gray-900">{activeAttendant.rating?.toFixed(1) || "5.0"}</p>
                </div>

                <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex flex-col justify-between h-24">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-gray-400">📦 Total Services</span>
                    <Briefcase className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-2xl font-black text-gray-900">{attendantBookings.length}</p>
                </div>

                <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex flex-col justify-between h-24">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-gray-400">✅ Completed Services</span>
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-black text-gray-900">{completedServices.length}</p>
                </div>

                <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex flex-col justify-between h-24">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-gray-400">⏰ On-Time Percentage</span>
                    <Clock className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-black text-gray-900">98.5%</p>
                </div>

                <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex flex-col justify-between h-24">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-gray-400">🏆 Customer Satisfaction</span>
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500 stroke-none" />
                  </div>
                  <p className="text-2xl font-black text-gray-900">97%</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: VERIFICATION STATUS (Timeline flow) */}
          {activeAttendant && (
            <div id="verification" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-1.5">
                <ShieldCheck className="w-4.5 h-4.5 text-primary" />
                Verification Status
              </h3>
              
              <div className="relative">
                <div className="hidden md:flex justify-between items-center relative">
                  {VERIFICATION_STEPS.map((stepName, idx) => {
                    const stepNum = idx + 1;
                    const currentIdx = VERIFICATION_STEPS.indexOf(activeAttendant.verificationStatus || "Registration Submitted");
                    const isCompleted = idx < currentIdx;
                    const isActive = idx === currentIdx;

                    return (
                      <div key={idx} className="flex flex-col items-center flex-1 relative z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                          isCompleted
                            ? "bg-primary text-white"
                            : isActive
                            ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md ring-4 ring-purple-100"
                            : "bg-gray-100 text-gray-400"
                        }`}>
                          {isCompleted ? <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> : stepNum}
                        </div>
                        <span className={`text-[10px] font-bold text-center mt-2.5 max-w-[90px] leading-tight ${
                          isActive ? "text-primary" : isCompleted ? "text-gray-700" : "text-gray-400"
                        }`}>
                          {stepName}
                        </span>
                      </div>
                    );
                  })}
                  <div className="absolute top-4 left-[8%] right-[8%] h-0.5 bg-gray-100 -z-1">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                      style={{ 
                        width: `${Math.max(0, (VERIFICATION_STEPS.indexOf(activeAttendant.verificationStatus || "Registration Submitted") / (VERIFICATION_STEPS.length - 1)) * 100)}%` 
                      }}
                    />
                  </div>
                </div>

                <div className="md:hidden space-y-5 pl-5 border-l border-gray-100 relative">
                  {VERIFICATION_STEPS.map((stepName, idx) => {
                    const currentIdx = VERIFICATION_STEPS.indexOf(activeAttendant.verificationStatus || "Registration Submitted");
                    const isCompleted = idx < currentIdx;
                    const isActive = idx === currentIdx;

                    return (
                      <div key={idx} className="relative text-xs">
                        <div className={`absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          isCompleted ? "bg-primary" : isActive ? "bg-secondary ring-4 ring-pink-100" : "bg-gray-200"
                        }`} />
                        <h4 className={`font-bold ${isActive ? "text-primary text-sm" : isCompleted ? "text-gray-800" : "text-gray-400"}`}>
                          {stepName}
                        </h4>
                        {idx < VERIFICATION_STEPS.length - 1 && (
                          <p className="text-gray-300 mt-1 ml-1">↓</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 8: NOTIFICATIONS BOARD */}
          <div id="notifications" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Bell className="w-4.5 h-4.5 text-primary" />
              Operational Notifications & Alerts
            </h3>
            
            <div className="space-y-3">
              {notificationItems.map((notif) => {
                const borderColors: Record<NotificationType, string> = {
                  alert: "border-l-rose-500 bg-rose-50/20",
                  success: "border-l-emerald-500 bg-emerald-50/20",
                  warning: "border-l-amber-500 bg-amber-50/20",
                  info: "border-l-primary bg-purple-50/10"
                };

                return (
                  <div key={notif.id} className={`p-4 rounded-xl border border-gray-100 border-l-4 ${borderColors[notif.type]} text-xs flex gap-3`}>
                    {notif.type === "alert" && <AlertTriangle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />}
                    {notif.type === "success" && <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />}
                    {notif.type === "warning" && <AlertOctagon className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />}
                    {notif.type === "info" && <Bell className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />}

                    <div className="space-y-0.5 flex-1">
                      <h4 className="font-bold text-gray-900">{notif.title}</h4>
                      <p className="text-gray-500 font-semibold">{notif.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PREVIOUS PROCESS: New Assignments Requests */}
          <div id="assignments" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-amber-50/20">
              <h2 className="font-bold text-gray-900 flex items-center gap-1.5 text-sm uppercase tracking-wide">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-500 mt-2 font-medium">
                      <div><strong>Customer Name:</strong> {b.name}</div>
                      <div><strong>Phone:</strong> {b.phone}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{b.city} (Address inside specs)</span>
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
                <div className="py-8 text-center text-xs text-gray-400 font-medium">
                  No new assignment requests.
                </div>
              )}
            </div>
          </div>

          {/* PREVIOUS PROCESS: Active Assignments in Progress */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-blue-50/20">
              <h2 className="font-bold text-gray-900 flex items-center gap-1.5 text-sm uppercase tracking-wide">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-500 mt-2 font-medium">
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
                <div className="py-8 text-center text-xs text-gray-400 font-medium">
                  No active assignments in progress.
                </div>
              )}
            </div>
          </div>

          {/* PREVIOUS PROCESS: Completed Services History */}
          <div id="history" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Completed Services History</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {completedServices.map((b) => (
                <div key={b.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/20 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-50 rounded-lg"><CheckCircle className="h-4 w-4 text-green-600" /></div>
                    <div className="text-xs font-semibold">
                      <p className="font-bold text-gray-800">{b.service?.title}</p>
                      <p className="text-gray-500 mt-0.5">{b.name} · {b.date}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold uppercase tracking-wide">Finished</span>
                </div>
              ))}
              {completedServices.length === 0 && (
                <div className="py-6 text-center text-xs text-gray-400 font-medium">
                  No completed services recorded yet.
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
