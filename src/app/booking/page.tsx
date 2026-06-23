"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Check, 
  MapPin, 
  ShieldCheck, 
  User, 
  Phone, 
  Mail,
  Loader2, 
  Clock,
  RefreshCw,
  Users
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 rounded-xl animate-pulse flex items-center justify-center text-gray-400 font-medium border border-gray-200">Loading interactive map...</div>,
});

interface DBService {
  id: string;
  title: string;
  description: string;
  startingPrice: string;
}

export default function BookingPage() {
  const searchParams = useSearchParams();
  const initialServiceId = searchParams?.get("service");

  // DB services
  const [servicesList, setServicesList] = useState<DBService[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // SECTION 1: Booking Information
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  // SECTION 2: Select Service
  const [selectedServiceId, setSelectedServiceId] = useState("");

  // SECTION 3: Location Selection
  const [city, setCity] = useState("Bengaluru");
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  // SECTION 4: Schedule Service
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // SECTION 5: Additional Requirements
  const [customReqs, setCustomReqs] = useState("");

  // SECTION 6: Customer Verification
  const [verificationStatus, setVerificationStatus] = useState<string>("NEW");
  const [idDocumentType, setIdDocumentType] = useState<string>("Aadhaar");
  const [idDocumentBase64, setIdDocumentBase64] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);

  // SECTION 7: Booking Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [createdBooking, setCreatedBooking] = useState<any>(null);
  
  // Tracking
  const [isPolling, setIsPolling] = useState(false);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("/api/services");
        if (res.ok) {
          const data = await res.json();
          setServicesList(data);
          
          if (initialServiceId) {
            const match = data.find((s: any) => s.id === initialServiceId || s.title.toLowerCase().includes(initialServiceId.toLowerCase()));
            if (match) setSelectedServiceId(match.id);
            else if (data.length > 0) setSelectedServiceId(data[0].id);
          } else if (data.length > 0) {
            setSelectedServiceId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load services:", err);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, [initialServiceId]);

  // Check verification on phone blur
  const checkVerification = async () => {
    if (!phoneNumber || phoneNumber.length < 10) return;
    setIsVerifying(true);
    try {
      const res = await fetch(`/api/customers/verify?phone=${encodeURIComponent(phoneNumber)}`);
      const data = await res.json();
      setVerificationStatus(data.status || "NEW");
    } catch (err) {
      console.error("Verification check failed", err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setIdDocumentBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      if (!customerName || !phoneNumber || !selectedServiceId || !date || !time || !location || lat === null || lng === null) {
        throw new Error("Please fill in all required fields and select a location on the map.");
      }

      if (verificationStatus === "NEW" || verificationStatus === "REJECTED") {
        if (!idDocumentBase64) {
          throw new Error("Please upload an ID document to verify your identity.");
        }
        const verifyRes = await fetch("/api/customers/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: customerName,
            phone: phoneNumber,
            idDocumentType,
            idDocumentBase64
          })
        });
        if (!verifyRes.ok) throw new Error("Failed to upload verification document");
      }

      const requirementText = `Email: ${email || "Not Provided"}. Custom requests: ${customReqs || "None"}. Address: ${location}.`;

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedServiceId,
          name: customerName,
          phone: phoneNumber,
          city,
          date,
          time,
          requirement: requirementText,
          latitude: lat,
          longitude: lng,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit booking request.");
      }

      const booking = await response.json();
      setCreatedBooking(booking);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Poll for booking status updates
  const fetchLatestStatus = async () => {
    if (!createdBooking?.id) return;
    setIsPolling(true);
    try {
      const res = await fetch(`/api/bookings/${createdBooking.id}`);
      if (res.ok) {
        const data = await res.json();
        setCreatedBooking(data);
      }
    } catch (err) {
      console.error("Error fetching latest booking status:", err);
    } finally {
      setIsPolling(false);
    }
  };

  // Setup auto polling
  useEffect(() => {
    if (createdBooking?.id) {
      pollTimerRef.current = setInterval(() => {
        fetchLatestStatus();
      }, 5000);
    }
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [createdBooking?.id]);

  const timelineSteps = [
    { label: "Submitted", desc: "Booking request received" },
    { label: "Under Review", desc: "Admin checking assignments" },
    { label: "Attendant Assigned", desc: "Selecting matched specialist" },
    { label: "Confirmed", desc: "Attendant accepted assignment" },
    { label: "In Progress", desc: "Service active on site" },
    { label: "Completed", desc: "Service request finished" },
  ];

  const getStatusStepIndex = (status: string) => {
    const s = status.toLowerCase();
    if (s === "pending") return 0;
    if (s === "under review" || s === "under_review") return 1;
    if (s === "assigned") return 2;
    if (s === "accepted") return 3;
    if (s === "in progress" || s === "in_progress") return 4;
    if (s === "completed") return 5;
    return 0;
  };

  return (
  <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
    <>
      <Navbar onBookNowClick={() => {}} />
      <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">Book a Women Attendant Service</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Book verified women attendants for elderly care, hospital assistance, travel support and home services.
            </p>
          </div>

          {createdBooking ? (
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-gray-100">
              <div className="text-center mb-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                  <Check className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Request Submitted Successfully!</h3>
                <p className="text-gray-500 mt-2">Your booking ID is <span className="font-mono font-bold text-gray-800">{createdBooking.id}</span></p>
              </div>

              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 shadow-sm mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-bold text-gray-800 flex items-center gap-1.5">
                    <Clock className="h-5 w-5 text-primary" />
                    Live Tracking
                  </h4>
                  <button 
                    onClick={fetchLatestStatus}
                    disabled={isPolling}
                    className="flex items-center space-x-1 text-sm text-primary font-semibold hover:underline disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${isPolling ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="relative border-l-2 border-gray-200 pl-6 ml-3 space-y-8">
                  {timelineSteps.map((step, idx) => {
                    const currentStatusIndex = getStatusStepIndex(createdBooking.status);
                    const isDone = idx <= currentStatusIndex;
                    const isCurrent = idx === currentStatusIndex;

                    return (
                      <div key={idx} className="relative">
                        <span className={`absolute -left-9.5 top-0.5 rounded-full h-5 w-5 flex items-center justify-center border-2 ${
                          isDone 
                            ? "bg-primary border-primary text-white" 
                            : "bg-white border-gray-200 text-gray-300"
                        }`}>
                          {isDone ? <Check className="h-3 w-3 stroke-[3]" /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                        </span>
                        <div>
                          <h5 className={`font-bold text-sm ${isCurrent ? "text-primary" : isDone ? "text-gray-800" : "text-gray-400"}`}>
                            {step.label}
                          </h5>
                          <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {createdBooking.attendant && (
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <span className="text-xs text-primary font-bold uppercase tracking-wider">Assigned Attendant</span>
                    <p className="text-lg font-bold text-gray-900">{createdBooking.attendant.name}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmitBooking} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              
              {submitError && (
                <div className="m-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
                  <p className="font-medium text-sm">{submitError}</p>
                </div>
              )}

              <div className="p-6 sm:p-10 space-y-12">
                {/* SECTION 1: Booking Information */}
                <section>
                  <h2 className="text-xl font-bold text-slate-800 mb-5 pb-2 border-b flex items-center gap-2">
                    <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">1</span>
                    Booking Information
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5"><User className="w-4 h-4 text-slate-400"/> Customer Name *</label>
                      <input type="text" required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="Jane Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-400"/> Mobile Number *</label>
                      <input type="tel" required value={phoneNumber} onBlur={checkVerification} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="+91 9876543210" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400"/> Email Address <span className="text-slate-400 font-normal">(Optional)</span></label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="jane@example.com" />
                    </div>
                  </div>
                </section>

                {/* SECTION 2: Select Service */}
                <section>
                  <h2 className="text-xl font-bold text-slate-800 mb-5 pb-2 border-b flex items-center gap-2">
                    <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">2</span>
                    Select Service
                  </h2>
                  {loadingServices ? (
                    <div className="flex items-center gap-2 text-slate-500"><Loader2 className="w-5 h-5 animate-spin" /> Loading services...</div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {servicesList.map((service) => (
                        <label key={service.id} className={`relative flex cursor-pointer rounded-2xl border p-4 shadow-sm focus:outline-none transition-all ${selectedServiceId === service.id ? 'bg-purple-50 border-primary ring-1 ring-primary' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                          <input type="radio" name="service_selection" value={service.id} checked={selectedServiceId === service.id} onChange={() => setSelectedServiceId(service.id)} className="sr-only" />
                          <div className="flex w-full items-center justify-between">
                            <div className="flex items-center">
                              <div className="text-sm">
                                <p className={`font-bold ${selectedServiceId === service.id ? 'text-primary' : 'text-slate-900'}`}>{service.title}</p>
                                <p className="text-slate-500 text-xs mt-1">Starting from {service.startingPrice}</p>
                              </div>
                            </div>
                            {selectedServiceId === service.id && <Check className="h-5 w-5 text-primary" />}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </section>

                {/* SECTION 3: Location Selection */}
                <section>
                  <h2 className="text-xl font-bold text-slate-800 mb-5 pb-2 border-b flex items-center gap-2">
                    <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">3</span>
                    Location Selection
                  </h2>
                  <div className="space-y-4">
                    <div className="w-full sm:w-1/2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">City</label>
                      <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer">
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Coimbatore">Coimbatore</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400"/> Pin Exact Location</label>
                      <MapComponent 
                        defaultCity={city}
                        onLocationSelect={(newLat, newLng, address) => {
                          setLat(newLat);
                          setLng(newLng);
                          setLocation(address);
                        }} 
                      />
                      {lat && lng && (
                        <div className="mt-4 p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 flex items-start gap-3">
                          <Check className="h-5 w-5 shrink-0 mt-0.5 text-emerald-600" />
                          <div>
                            <p className="font-semibold text-sm">Location Saved</p>
                            <p className="text-xs mt-1">{location}</p>
                            <p className="text-xs font-mono mt-1 opacity-75">Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* SECTION 4: Schedule Service */}
                <section>
                  <h2 className="text-xl font-bold text-slate-800 mb-5 pb-2 border-b flex items-center gap-2">
                    <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">4</span>
                    Schedule Service
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date *</label>
                      <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Time *</label>
                      <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all" />
                    </div>
                  </div>
                </section>

                {/* SECTION 5: Additional Requirements */}
                <section>
                  <h2 className="text-xl font-bold text-slate-800 mb-5 pb-2 border-b flex items-center gap-2">
                    <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">5</span>
                    Additional Requirements
                  </h2>
                  <textarea rows={4} value={customReqs} onChange={(e) => setCustomReqs(e.target.value)} placeholder="Any special instructions or customer notes..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all resize-none"></textarea>
                </section>

                {/* SECTION 6: Customer Verification */}
                <section>
                  <h2 className="text-xl font-bold text-slate-800 mb-5 pb-2 border-b flex items-center gap-2">
                    <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">6</span>
                    Customer Verification
                  </h2>
                  
                  {isVerifying ? (
                    <div className="flex items-center gap-2 text-slate-500 p-4 bg-slate-50 rounded-xl"><Loader2 className="w-5 h-5 animate-spin" /> Checking verification status...</div>
                  ) : !phoneNumber || phoneNumber.length < 10 ? (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500">
                      Please enter a valid mobile number in Section 1 to check verification status.
                    </div>
                  ) : verificationStatus === "VERIFIED" ? (
                    <div className="bg-green-50 border border-green-200 text-green-800 p-5 rounded-xl flex items-center gap-4">
                      <ShieldCheck className="h-8 w-8 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-lg flex items-center gap-2">✅ Verified Customer</p>
                        <p className="text-sm">Your identity is already verified.</p>
                      </div>
                    </div>
                  ) : verificationStatus === "PENDING" ? (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-5 rounded-xl flex items-center gap-4">
                      <Clock className="h-8 w-8 text-yellow-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-lg">Verification Pending</p>
                        <p className="text-sm">We are reviewing your previously uploaded ID.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                      <p className="text-sm text-slate-600 font-medium mb-4">For first booking only: Please upload ID proof.</p>
                      {verificationStatus === "REJECTED" && (
                        <p className="text-sm text-red-600 font-bold mb-4">Your previous ID was rejected. Please upload a clear document.</p>
                      )}
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Document Type</label>
                          <select value={idDocumentType} onChange={(e) => setIdDocumentType(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none">
                            <option value="Aadhaar">Aadhaar Card</option>
                            <option value="PAN">PAN Card</option>
                            <option value="Passport">Passport</option>
                            <option value="DL">Driving License</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Upload ID Proof *</label>
                          <input type="file" required accept="image/*,application/pdf" onChange={handleFileUpload} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
                        </div>
                      </div>
                      {idDocumentBase64 && idDocumentBase64.startsWith("data:image") && (
                        <div className="mt-4">
                          <img src={idDocumentBase64} alt="ID Preview" className="h-32 rounded-lg border border-slate-200 object-cover shadow-sm" />
                        </div>
                      )}
                    </div>
                  )}
                </section>
              </div>

              {/* SECTION 7: BOOKING SUBMISSION */}
              <div className="p-6 sm:p-10 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary text-white font-bold px-10 py-4 rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Submitting Request...</>
                  ) : (
                    <><ShieldCheck className="h-5 w-5" /> Submit Booking Request</>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
}
