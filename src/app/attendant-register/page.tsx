"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, MapPin, Phone, Mail, Calendar, UploadCloud, 
  CheckCircle, ChevronRight, ChevronLeft, Briefcase, 
  Clock, Shield, Car, HeartPulse, Stethoscope, Palmtree, Users
} from "lucide-react";

const steps = [
  { id: 1, title: "Personal Details" },
  { id: 2, title: "Service Selection" },
  { id: 3, title: "Documents" },
  { id: 4, title: "Availability" },
];

const availableServices = [
  { id: "Women Driver", icon: Car },
  { id: "Hospital Attendant", icon: Stethoscope },
  { id: "Elderly Care", icon: HeartPulse },
  { id: "Home Support", icon: User },
  { id: "Travel Buddy", icon: Palmtree },
  { id: "Airport Pickup", icon: Car },
  { id: "Railway Pickup", icon: Car },
  { id: "Event Support", icon: Users },
];

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function AttendantRegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    age: "",
    mobileNumber: "",
    email: "",
    password: "",
    address: "",
    city: "",
    state: "Tamil Nadu",
    pinCode: "",
    emergencyContact: "",
    
    // Services
    selectedServices: [] as string[],
    
    // Skills
    yearsOfExperience: "0",
    languagesKnown: [] as string[],
    
    // Files Base64
    profilePhotoBase64: "",
    aadhaarBase64: "",
    panCardBase64: "",
    drivingLicenseBase64: "",
    professionalCertBase64: "",
    policeVerifBase64: "",
    
    // Availability
    workingDays: [] as string[],
    preferredTimeSlots: [] as string[],
    preferredCities: [] as string[],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedServices.includes(serviceId);
      return {
        ...prev,
        selectedServices: isSelected 
          ? prev.selectedServices.filter((s) => s !== serviceId)
          : [...prev.selectedServices, serviceId]
      };
    });
  };

  const handleDayToggle = (day: string) => {
    setFormData((prev) => {
      const isSelected = prev.workingDays.includes(day);
      return {
        ...prev,
        workingDays: isSelected 
          ? prev.workingDays.filter((d) => d !== day)
          : [...prev.workingDays, day]
      };
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, [fieldName]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const nextStep = () => setCurrentStep((p) => Math.min(p + 1, steps.length));
  const prevStep = () => setCurrentStep((p) => Math.max(p - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== steps.length) return nextStep();
    
    setLoading(true);
    try {
      const res = await fetch("/api/attendants/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
      } else {
        alert(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center"
        >
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Submitted</h2>
          <p className="text-gray-600 mb-6">
            Your profile has been sent to Admin for verification. We will notify you once your account is approved.
          </p>
          <button 
            onClick={() => window.location.href = "/"}
            className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            Return to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            Join WithYours as an Attendant
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Complete your profile to become a verified partner and start offering your services.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex justify-between relative">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full -z-10"></div>
            <div 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-primary rounded-full transition-all duration-300 ease-in-out -z-10"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
            
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-4 font-bold transition-colors duration-300 ${
                    currentStep >= step.id 
                      ? "bg-primary border-primary/20 text-white shadow-md" 
                      : "bg-white border-gray-200 text-gray-400"
                  }`}
                >
                  {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
                </div>
                <span className={`text-xs mt-2 font-medium hidden sm:block ${
                  currentStep >= step.id ? "text-primary" : "text-gray-400"
                }`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 sm:p-10">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Step 1: Personal Details */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Personal Information</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                          <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                          <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                          <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                          <input type="tel" name="mobileNumber" required value={formData.mobileNumber} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                          <input type="date" name="dateOfBirth" required value={formData.dateOfBirth} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                          <input type="number" name="age" required value={formData.age} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact *</label>
                          <input type="tel" name="emergencyContact" required value={formData.emergencyContact} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
                          <textarea name="address" rows={2} required value={formData.address} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"></textarea>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                          <input type="text" name="city" required value={formData.city} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code *</label>
                          <input type="text" name="pinCode" required value={formData.pinCode} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Services */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Select Services</h2>
                      <p className="text-gray-500">Choose the services you are trained to provide.</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {availableServices.map((service) => {
                          const isSelected = formData.selectedServices.includes(service.id);
                          const Icon = service.icon;
                          return (
                            <div 
                              key={service.id}
                              onClick={() => handleServiceToggle(service.id)}
                              className={`cursor-pointer border-2 rounded-xl p-4 flex items-center space-x-4 transition-all ${
                                isSelected 
                                  ? "border-primary bg-primary/5 shadow-md" 
                                  : "border-gray-200 hover:border-primary/50"
                              }`}
                            >
                              <div className={`p-2 rounded-full ${isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 font-medium text-gray-800">{service.id}</div>
                              {isSelected && <CheckCircle className="w-5 h-5 text-primary" />}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="mt-8 pt-6 border-t border-gray-100">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                        <input type="number" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleInputChange} className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Documents */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Document Upload</h2>
                      <p className="text-gray-500">Upload clear images or PDFs of your documents for verification.</p>
                      
                      <div className="space-y-4">
                        {[
                          { id: 'profilePhotoBase64', label: 'Profile Photo', required: true },
                          { id: 'aadhaarBase64', label: 'Aadhaar Card', required: true },
                          { id: 'panCardBase64', label: 'PAN Card', required: true },
                          { id: 'drivingLicenseBase64', label: 'Driving License (If driving service selected)', required: false },
                          { id: 'policeVerifBase64', label: 'Police Verification', required: true }
                        ].map((doc) => (
                          <div key={doc.id} className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center space-x-3">
                              <Shield className="w-6 h-6 text-gray-400" />
                              <div>
                                <h4 className="font-medium text-gray-800">{doc.label} {doc.required && <span className="text-red-500">*</span>}</h4>
                                <p className="text-xs text-gray-500">PNG, JPG or PDF up to 5MB</p>
                              </div>
                            </div>
                            <div className="flex-shrink-0 w-full sm:w-auto">
                              <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2">
                                <UploadCloud className="w-4 h-4" />
                                <span>{formData[doc.id as keyof typeof formData] ? "Replace File" : "Upload"}</span>
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept=".jpg,.jpeg,.png,.pdf" 
                                  onChange={(e) => handleFileUpload(e, doc.id)}
                                />
                              </label>
                            </div>
                            {formData[doc.id as keyof typeof formData] && (
                              <div className="text-green-500 flex items-center text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-1" /> Uploaded
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 4: Availability */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Availability Setup</h2>
                      
                      <div>
                        <h3 className="font-medium text-gray-800 mb-3 flex items-center"><Calendar className="w-5 h-5 mr-2 text-primary" /> Working Days</h3>
                        <div className="flex flex-wrap gap-2">
                          {daysOfWeek.map(day => (
                            <div 
                              key={day}
                              onClick={() => handleDayToggle(day)}
                              className={`cursor-pointer px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                                formData.workingDays.includes(day)
                                  ? "bg-primary text-white border-primary shadow-sm"
                                  : "bg-white text-gray-600 border-gray-300 hover:border-primary/50"
                              }`}
                            >
                              {day}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <label className="block font-medium text-gray-800 mb-2 flex items-center"><MapPin className="w-5 h-5 mr-2 text-primary" /> Preferred Work Cities (Comma separated)</label>
                        <input 
                          type="text" 
                          name="preferredCities" 
                          placeholder="e.g. Chennai, Coimbatore, Madurai"
                          value={formData.preferredCities.join(", ")} 
                          onChange={(e) => setFormData(prev => ({...prev, preferredCities: e.target.value.split(",").map(s => s.trim())}))} 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" 
                        />
                      </div>
                      
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

            </div>
            
            {/* Form Footer */}
            <div className="bg-gray-50 px-6 py-4 sm:px-10 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1 || loading}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentStep === 1 ? "text-gray-400 cursor-not-allowed opacity-50" : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                <ChevronLeft className="w-5 h-5 mr-1" /> Back
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    {currentStep === steps.length ? "Submit Registration" : "Next Step"}
                    {currentStep < steps.length && <ChevronRight className="w-5 h-5 ml-1" />}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
