"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  HeartHandshake, 
  ShieldCheck, 
  User, 
  Phone, 
  Building, 
  Loader2, 
  RefreshCw 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 rounded-xl animate-pulse flex items-center justify-center text-gray-400 font-medium border border-gray-200">Loading interactive map...</div>,
});

interface BookingFlowProps {
  selectedServiceId: string;
}

interface DBService {
  id: string;
  title: string;
  description: string;
  startingPrice: string;
  rating: number;
  badge: string;
  iconName: string;
  gradient: string;
}

const addOnsList = [
  { id: "sos", name: "Premium SOS Family Alert", price: 199 },
  { id: "luggage", name: "Extra Luggage Assistance", price: 99 },
  { id: "multilingual", name: "Multi-lingual Attendant", price: 149 },
];

export default function BookingFlow({ selectedServiceId }: BookingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Database services state
  const [servicesList, setServicesList] = useState<DBService[]>([]);
  const [selectedService, setSelectedService] = useState<DBService | null>(null);
  const [loadingServices, setLoadingServices] = useState(true);

  // Form Fields
  const [numPeople, setNumPeople] = useState(1);
  const [customReqs, setCustomReqs] = useState("");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [providedId, setProvidedId] = useState("");
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [duration, setDuration] = useState(1);

  // Verification States
  const [verificationStatus, setVerificationStatus] = useState<string>("NEW");
  const [idDocumentType, setIdDocumentType] = useState<string>("Aadhaar");
  const [idDocumentBase64, setIdDocumentBase64] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Submission / Tracking States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [createdBooking, setCreatedBooking] = useState<any>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch services from DB
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("/api/services");
        if (res.ok) {
          const data = await res.json();
          setServicesList(data);
          if (data.length > 0) {
            setSelectedService(data[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load services:", err);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  // Map homepage selectedServiceId slug to database service UUID
  useEffect(() => {
    if (selectedServiceId && servicesList.length > 0) {
      const match = servicesList.find((s) => {
        const titleLower = s.title.toLowerCase();
        const iconLower = s.iconName.toLowerCase();
        if (selectedServiceId === "airport") return titleLower.includes("airport") || iconLower === "plane";
        if (selectedServiceId === "railway") return titleLower.includes("railway") || iconLower === "train";
        if (selectedServiceId === "nursing") return titleLower.includes("nursing") || iconLower === "heartpulse";
        if (selectedServiceId === "security") return titleLower.includes("security") || iconLower === "shieldalert";
        if (selectedServiceId === "hospital") return titleLower.includes("hospital") || titleLower.includes("elderly") || iconLower === "award";
        if (selectedServiceId === "driver") return titleLower.includes("driver") || iconLower === "car";
        return false;
      });

      if (match) {
        setSelectedService(match);
        const bookingSection = document.getElementById("booking");
        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  }, [selectedServiceId, servicesList]);

  // Dynamic calculations based on selected service startingPrice
  const getBasePrice = () => {
    if (!selectedService) return 999;
    const cleanPriceStr = selectedService.startingPrice.replace(/[^0-9]/g, "");
    return parseInt(cleanPriceStr) || 999;
  };

  const getUnit = () => {
    if (!selectedService) return "trip";
    return selectedService.startingPrice.toLowerCase().includes("day") ? "day" : "trip";
  };

  const basePrice = getBasePrice();
  const unitLabel = getUnit();

  const subtotal = (basePrice * duration) + 
    selectedAddOns.reduce((acc, addonId) => {
      const addon = addOnsList.find(a => a.id === addonId);
      return acc + (addon ? addon.price : 0);
    }, 0);
  
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const discount = subtotal > 1500 ? Math.round(subtotal * 0.1) : 0;
  const totalAmount = subtotal + tax - discount;

  const toggleAddOn = (id: string) => {
    if (selectedAddOns.includes(id)) {
      setSelectedAddOns(selectedAddOns.filter(item => item !== id));
    } else {
      setSelectedAddOns([...selectedAddOns, id]);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!selectedService) {
        alert("Please choose a service first.");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!customerName.trim()) {
        alert("Please enter your name.");
        return;
      }
      if (!phoneNumber.trim()) {
        alert("Please enter your phone number.");
        return;
      }
      if (!date) {
        alert("Please select a date.");
        return;
      }
      if (!time) {
        alert("Please select a time.");
        return;
      }
      if (!location.trim() || lat === null || lng === null) {
        alert("Please pin your exact location on the map.");
        return;
      }
      
      setIsVerifying(true);
      fetch(`/api/customers/verify?phone=${encodeURIComponent(phoneNumber)}`)
        .then(res => res.json())
        .then(data => {
          setVerificationStatus(data.status || "NEW");
          setCurrentStep(3);
        })
        .catch(err => {
          console.error("Verification check failed", err);
          setCurrentStep(3);
        })
        .finally(() => setIsVerifying(false));
    }
  };

  const handlePrev = () => {
    if (currentStep > 1 && currentStep <= 3) {
      setCurrentStep(currentStep - 1);
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

  // Submit Booking Request
  const handleSubmitBooking = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    // Build compound requirements block
    const addOnNames = selectedAddOns
      .map((id) => addOnsList.find((a) => a.id === id)?.name)
      .filter(Boolean)
      .join(", ");

    const requirementText = `[Customer ID: ${providedId || "Not Provided"}] People: ${numPeople}. Add-ons: ${addOnNames || "None"}. Custom requests: ${customReqs || "None"}. Duration: ${duration} ${unitLabel}(s). Address: ${location}. Total amount: ₹${totalAmount}`;

    try {
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

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: selectedService?.id,
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
      setCurrentStep(4); // Advance to dynamic tracking screen
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong. Please check fields.");
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
    if (currentStep === 4 && createdBooking?.id) {
      pollTimerRef.current = setInterval(() => {
        fetchLatestStatus();
      }, 5000);
    }

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [currentStep, createdBooking?.id]);

  // Clean polling on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, []);

  // Status mapping to timeline index
  const getStatusStepIndex = (status: string) => {
    const s = status.toLowerCase();
    if (s === "pending") return 0;
    if (s === "under review" || s === "under_review") return 1;
    if (s === "assigned") return 2;
    if (s === "accepted") return 3;
    if (s === "in progress" || s === "in_progress") return 4;
    if (s === "completed") return 5;
    return 0; // default/cancelled
  };

  const timelineSteps = [
    { label: "Submitted", desc: "Booking request received" },
    { label: "Under Review", desc: "Admin checking assignments" },
    { label: "Attendant Assigned", desc: "Selecting matched specialist" },
    { label: "Confirmed", desc: "Attendant accepted assignment" },
    { label: "In Progress", desc: "Service active on site" },
    { label: "Completed", desc: "Service request finished" },
  ];

  const currentStatusIndex = createdBooking ? getStatusStepIndex(createdBooking.status) : 0;
  const isCancelled = createdBooking?.status.toLowerCase() === "cancelled";

  return (
    <section id="booking" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-base text-primary font-bold tracking-wide uppercase">Easy Booking</h2>
          <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Schedule Your Verified Attendant
          </p>
          <p className="mt-3 text-lg text-gray-600">
            Submit an assignment request for a trusted female companion or nursing specialist. No upfront payment required.
          </p>
        </div>

        {/* Progress Indicator (hidden on success step) */}
        {currentStep <= 3 && (
          <div className="mb-12">
            <div className="flex items-center justify-between max-w-md mx-auto relative">
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
              <div 
                className="absolute left-0 top-1/2 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
              />
              
              {[1, 2, 3].map((step) => (
                <div key={step} className="z-10 flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
                      currentStep > step
                        ? "bg-primary border-primary text-white"
                        : currentStep === step
                        ? "bg-white border-primary text-primary shadow-lg scale-110"
                        : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {currentStep > step ? <Check className="h-5 w-5" /> : step}
                  </div>
                  <span className={`text-xs mt-2 font-bold ${currentStep === step ? "text-primary" : "text-gray-500"}`}>
                    {step === 1 ? "Requirements" : step === 2 ? "Details & Location" : "Review Request"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-gray-50 rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xl min-h-[400px] flex flex-col justify-between">
          {loadingServices && currentStep === 1 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-gray-500 text-sm font-semibold">Loading available services...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              
              {/* STEP 1 */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <HeartHandshake className="text-primary h-5 w-5" />
                      Step 1: Choose Service & Details
                    </h3>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Select Service</label>
                        <select
                          value={selectedService?.id || ""}
                          onChange={(e) => {
                            const found = servicesList.find((s) => s.id === e.target.value);
                            if (found) setSelectedService(found);
                          }}
                          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        >
                          {servicesList.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.title} (Starting: {s.startingPrice})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Number of Assisted People</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={numPeople}
                          onChange={(e) => setNumPeople(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Custom Safety/Medical Requirements</label>
                    <textarea
                      rows={3}
                      placeholder="E.g., Prefers Tamil speaking attendant, assistance needed with wheelchair, medication list details..."
                      value={customReqs}
                      onChange={(e) => setCustomReqs(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Available Add-ons</label>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {addOnsList.map((addon) => {
                        const isSelected = selectedAddOns.includes(addon.id);
                        return (
                          <button
                            key={addon.id}
                            type="button"
                            onClick={() => toggleAddOn(addon.id)}
                            className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                              isSelected
                                ? "bg-purple-50 border-primary shadow-sm"
                                : "bg-white border-gray-200 hover:border-purple-200"
                            }`}
                          >
                            <span className={`text-sm font-bold ${isSelected ? "text-primary" : "text-gray-800"}`}>
                              {addon.name}
                            </span>
                            <span className="text-xs text-gray-500 font-semibold mt-2">
                              +₹{addon.price}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2 */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="text-primary h-5 w-5" />
                    Step 2: Details & Address
                  </h3>

                  {/* Contact Info */}
                  <div className="grid sm:grid-cols-3 gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                        <User className="h-4 w-4 text-gray-400" /> Customer Name
                      </label>
                      <input
                        type="text"
                        placeholder="Your full name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                        <Phone className="h-4 w-4 text-gray-400" /> Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="Mobile number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                        <Building className="h-4 w-4 text-gray-400" /> Metropolitan City
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
                      >
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Coimbatore">Coimbatore</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                        <User className="h-4 w-4 text-gray-400" /> Government/Customer ID <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Aadhaar, Passport, etc."
                        value={providedId}
                        onChange={(e) => setProvidedId(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Time</label>
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Service Address / Pickup Location</label>
                      <MapComponent 
                        defaultCity={city}
                        onLocationSelect={(newLat, newLng, address) => {
                          setLat(newLat);
                          setLng(newLng);
                          setLocation(address);
                        }} 
                      />
                      {lat && lng && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 grid sm:grid-cols-3 gap-4">
                          <div className="sm:col-span-2">
                            <span className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-1"><MapPin className="h-3 w-3" /> Selected Address</span>
                            <p className="font-semibold text-gray-800 text-sm line-clamp-2" title={location}>{location}</p>
                          </div>
                          <div className="flex gap-4">
                            <div>
                              <span className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-1">🌐 Latitude</span>
                              <p className="font-semibold text-gray-800 text-sm">{lat.toFixed(6)}</p>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-1">🌐 Longitude</span>
                              <p className="font-semibold text-gray-800 text-sm">{lng.toFixed(6)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Duration ({unitLabel === "trip" ? "Trips" : "Days"})
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={duration}
                        onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3 */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ShieldCheck className="text-primary h-5 w-5" />
                    Step 3: Review Request & Summary
                  </h3>

                  {submitError && (
                    <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                      {submitError}
                    </div>
                  )}

                  {/* ID Verification Section */}
                  <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm space-y-4">
                    <h4 className="font-bold text-gray-800 border-b pb-2">Customer Verification</h4>
                    
                    {verificationStatus === "VERIFIED" && (
                      <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-3">
                        <ShieldCheck className="h-6 w-6 flex-shrink-0" />
                        <div>
                          <p className="font-bold">Verified Customer</p>
                          <p className="text-sm">Your identity has already been verified. You may proceed.</p>
                        </div>
                      </div>
                    )}

                    {verificationStatus === "PENDING" && (
                      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-xl flex items-center gap-3">
                        <Clock className="h-6 w-6 flex-shrink-0" />
                        <div>
                          <p className="font-bold">Verification Pending</p>
                          <p className="text-sm">We are reviewing your previously uploaded ID.</p>
                        </div>
                      </div>
                    )}

                    {(verificationStatus === "NEW" || verificationStatus === "REJECTED") && (
                      <div className="space-y-4">
                        {verificationStatus === "REJECTED" && (
                          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
                            <span className="font-bold">Verification Rejected:</span> Your previous ID was rejected. Please upload a clear, valid document.
                          </div>
                        )}
                        <p className="text-sm text-gray-600">As this is your first booking, please upload a valid Government ID for verification.</p>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Document Type</label>
                            <select 
                              value={idDocumentType} 
                              onChange={(e) => setIdDocumentType(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            >
                              <option value="Aadhaar">Aadhaar Card</option>
                              <option value="PAN">PAN Card</option>
                              <option value="Passport">Passport</option>
                              <option value="DL">Driving License</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Upload ID (Image/PDF)</label>
                            <input 
                              type="file" 
                              accept="image/jpeg,image/png,application/pdf"
                              onChange={handleFileUpload}
                              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-primary hover:file:bg-purple-100 cursor-pointer"
                            />
                          </div>
                        </div>
                        {idDocumentBase64 && idDocumentBase64.startsWith("data:image") && (
                          <div className="mt-4">
                            <p className="text-xs text-gray-500 mb-2 font-semibold uppercase">Document Preview</p>
                            <img src={idDocumentBase64} alt="ID Preview" className="h-32 object-contain border border-gray-200 rounded-lg" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4 border-b pb-4">
                      <div>
                        <span className="text-xs font-semibold text-gray-400 uppercase">Customer</span>
                        <p className="font-bold text-gray-800">{customerName} ({phoneNumber})</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-gray-400 uppercase">City & Location</span>
                        <p className="font-bold text-gray-800">{city} · {location}</p>
                      </div>
                    </div>

                    <div className="flex justify-between border-b pb-3">
                      <span className="font-semibold text-gray-600">Selected Service:</span>
                      <span className="font-bold text-gray-900">{selectedService?.title}</span>
                    </div>

                    <div className="flex justify-between border-b pb-3">
                      <span className="font-semibold text-gray-600">Scheduled Time:</span>
                      <span className="font-bold text-gray-900">{date} at {time}</span>
                    </div>

                    <div className="flex justify-between border-b pb-3">
                      <span className="font-semibold text-gray-600">Duration:</span>
                      <span className="font-bold text-gray-900">
                        {duration} {unitLabel}(s)
                      </span>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="pt-2 space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Estimate Subtotal:</span>
                        <span>₹{subtotal}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>GST (18%):</span>
                        <span>₹{tax}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-medium">
                          <span>Discount Applied:</span>
                          <span>-₹{discount}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t">
                        <span>Total Estimated Cost:</span>
                        <span className="text-primary text-xl">₹{totalAmount}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: SUCCESS TRACKING TIMELINE */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 text-primary mb-4 animate-bounce">
                      <ShieldCheck className="h-9 w-9" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900">Request Submitted!</h3>
                    <p className="text-sm text-gray-500 mt-1">Your attendant booking is now under operator review.</p>
                  </div>

                  {/* Booking Stats Box */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2 border-b pb-3">
                      <div>
                        <span className="text-xs text-gray-400 font-semibold">BOOKING ID</span>
                        <p className="text-sm font-mono font-bold text-gray-800">{createdBooking?.id}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400 font-semibold">STATUS:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          isCancelled ? "bg-red-100 text-red-700" :
                          createdBooking?.status.toLowerCase() === "completed" ? "bg-green-100 text-green-700" :
                          createdBooking?.status.toLowerCase() === "in progress" || createdBooking?.status.toLowerCase() === "in_progress" ? "bg-blue-100 text-blue-700" :
                          createdBooking?.status.toLowerCase() === "accepted" ? "bg-teal-100 text-teal-700" :
                          createdBooking?.status.toLowerCase() === "assigned" ? "bg-indigo-100 text-indigo-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {createdBooking?.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 text-sm pt-2">
                      <div>
                        <span className="text-gray-400 font-medium">Customer Profile:</span>
                        <p className="font-bold text-gray-800">{createdBooking?.name} ({createdBooking?.phone})</p>
                      </div>
                      <div>
                        <span className="text-gray-400 font-medium">Requested Service:</span>
                        <p className="font-bold text-gray-800">{selectedService?.title}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 font-medium">Schedule Details:</span>
                        <p className="font-bold text-gray-800">{createdBooking?.date} at {createdBooking?.time}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-gray-400 font-medium">Service Location:</span>
                        <p className="font-bold text-gray-800">{createdBooking?.city} · {location}</p>
                        {createdBooking?.latitude && createdBooking?.longitude && (
                          <div className="flex gap-4 mt-1">
                            <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">Lat: {createdBooking.latitude.toFixed(6)}</p>
                            <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">Lng: {createdBooking.longitude.toFixed(6)}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {createdBooking?.attendant && (
                      <div className="mt-4 p-4 bg-purple-50/50 rounded-xl border border-purple-100 flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <span className="text-xs text-primary font-semibold">ASSIGNED SPECIALIST</span>
                          <p className="text-sm font-bold text-gray-800">{createdBooking.attendant.name}</p>
                          <p className="text-xs text-gray-500">{createdBooking.attendant.role}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Real-time Tracking Timeline */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="font-bold text-gray-800 flex items-center gap-1.5">
                        <Clock className="h-4.5 w-4.5 text-primary animate-spin" style={{ animationDuration: '4s' }} />
                        Assignment Timeline
                      </h4>
                      <button 
                        onClick={fetchLatestStatus}
                        disabled={isPolling}
                        className="flex items-center space-x-1 text-xs text-primary font-bold hover:underline disabled:opacity-50 cursor-pointer focus:outline-none"
                      >
                        <RefreshCw className={`h-3 w-3 ${isPolling ? 'animate-spin' : ''}`} />
                        <span>Refresh Status</span>
                      </button>
                    </div>

                    {isCancelled ? (
                      <div className="py-4 text-center text-red-500 font-semibold bg-red-50/50 rounded-xl border border-red-100">
                        This booking request has been cancelled.
                      </div>
                    ) : (
                      <div className="relative border-l-2 border-gray-100 pl-6 ml-3 space-y-8">
                        {timelineSteps.map((step, idx) => {
                          const isDone = idx <= currentStatusIndex;
                          const isCurrent = idx === currentStatusIndex;

                          return (
                            <div key={idx} className="relative">
                              <span className={`absolute -left-9.5 top-0.5 rounded-full h-5 w-5 flex items-center justify-center border-2 ${
                                isDone 
                                  ? "bg-primary border-primary text-white" 
                                  : "bg-white border-gray-200 text-gray-300"
                              }`}>
                                {isDone ? (
                                  <Check className="h-3 w-3 stroke-[3]" />
                                ) : (
                                  <span className="text-[10px] font-bold">{idx + 1}</span>
                                )}
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
                    )}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          )}

          {/* Navigation Buttons */}
          {currentStep <= 3 && (
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200/60">
              <button
                onClick={handlePrev}
                disabled={currentStep === 1 || isSubmitting}
                className={`flex items-center space-x-2 font-bold px-6 py-3 rounded-full transition-all cursor-pointer ${
                  currentStep === 1 || isSubmitting
                    ? "text-gray-300 cursor-not-allowed hover:bg-transparent"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center space-x-2 bg-gradient-to-r from-primary to-secondary text-white font-bold px-8 py-3 rounded-full shadow hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitBooking}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Booking Request</span>
                      <ShieldCheck className="h-5 w-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
