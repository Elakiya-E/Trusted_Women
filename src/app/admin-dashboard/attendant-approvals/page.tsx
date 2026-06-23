"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle, XCircle, Eye, MapPin, Phone, 
  Calendar, Award, FileText, AlertCircle, Clock 
} from "lucide-react";

export default function AttendantApprovalsPage() {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const fetchPending = async () => {
    try {
      const res = await fetch("/api/attendants/pending");
      const data = await res.json();
      setPending(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/attendants/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setSelectedProfile(null);
        fetchPending();
      } else {
        alert("Failed to approve");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch("/api/attendants/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, reason: rejectReason }),
      });
      if (res.ok) {
        setSelectedProfile(null);
        setShowRejectInput(false);
        setRejectReason("");
        fetchPending();
      } else {
        alert("Failed to reject");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendant Approvals</h1>
          <p className="text-sm text-gray-500 mt-1">Review and verify new attendant registrations.</p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium">
          {pending.length} Pending
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : pending.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800">All Caught Up!</h3>
          <p className="text-gray-500 mt-2">There are no pending attendant registrations to review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pending.map((attendant) => (
            <div key={attendant.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    {attendant.profilePhotoBase64 ? (
                      <img src={attendant.profilePhotoBase64} alt={attendant.fullName} className="h-14 w-14 rounded-full object-cover border-2 border-gray-100" />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                        {attendant.fullName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900">{attendant.fullName}</h3>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" /> {attendant.city}, {attendant.state}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    {attendant.mobileNumber}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Award className="h-4 w-4 mr-2 text-gray-400" />
                    {attendant.yearsOfExperience} years exp.
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    Applied: {new Date(attendant.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {attendant.selectedServices.slice(0, 2).map((s: string) => (
                    <span key={s} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                      {s}
                    </span>
                  ))}
                  {attendant.selectedServices.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                      +{attendant.selectedServices.length - 2} more
                    </span>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                <button 
                  onClick={() => setSelectedProfile(attendant)}
                  className="w-full flex items-center justify-center space-x-2 text-primary font-medium hover:text-primary/80 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span>Review Profile</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <ShieldCheck className="h-5 w-5 text-primary mr-2" />
                Profile Verification
              </h2>
              <button 
                onClick={() => { setSelectedProfile(null); setShowRejectInput(false); }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Left Column: Basic Info */}
                <div className="col-span-1 space-y-6">
                  <div className="text-center">
                    {selectedProfile.profilePhotoBase64 ? (
                      <img src={selectedProfile.profilePhotoBase64} alt={selectedProfile.fullName} className="h-32 w-32 rounded-full object-cover border-4 border-gray-100 mx-auto shadow-sm" />
                    ) : (
                      <div className="h-32 w-32 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-4xl mx-auto shadow-sm">
                        {selectedProfile.fullName.charAt(0)}
                      </div>
                    )}
                    <h3 className="mt-4 text-xl font-bold text-gray-900">{selectedProfile.fullName}</h3>
                    <p className="text-gray-500">{selectedProfile.age} years old</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                    <h4 className="font-semibold text-gray-700 mb-2 border-b border-gray-200 pb-2">Contact</h4>
                    <div className="flex items-start text-sm">
                      <Phone className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                      <span className="text-gray-700">{selectedProfile.mobileNumber}</span>
                    </div>
                    <div className="flex items-start text-sm">
                      <AlertCircle className="h-4 w-4 mr-2 text-red-400 mt-0.5" />
                      <span className="text-gray-700">{selectedProfile.emergencyContact} (Emergency)</span>
                    </div>
                    <div className="flex items-start text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                      <span className="text-gray-700">{selectedProfile.address}, {selectedProfile.city}, {selectedProfile.state} - {selectedProfile.pinCode}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Details & Docs */}
                <div className="col-span-2 space-y-6">
                  
                  {/* Services & Experience */}
                  <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                      <Award className="h-5 w-5 mr-2 text-primary" />
                      Professional Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-xs text-gray-500 font-medium">Experience</span>
                        <span className="text-gray-800 font-medium">{selectedProfile.yearsOfExperience} Years</span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500 font-medium">Languages</span>
                        <span className="text-gray-800 font-medium">{selectedProfile.languagesKnown.join(", ") || "N/A"}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-xs text-gray-500 font-medium mb-1">Requested Services</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedProfile.selectedServices.map((s: string) => (
                            <span key={s} className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-md border border-primary/20">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-primary" />
                      Verification Documents
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { label: "Aadhaar Card", data: selectedProfile.aadhaarBase64 },
                        { label: "PAN Card", data: selectedProfile.panCardBase64 },
                        { label: "Driving License", data: selectedProfile.drivingLicenseBase64 },
                        { label: "Police Verification", data: selectedProfile.policeVerifBase64 },
                      ].map((doc, idx) => (
                        doc.data ? (
                          <div key={idx} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">{doc.label}</span>
                            <a href={doc.data} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs font-medium flex items-center">
                              <Eye className="h-3 w-3 mr-1" /> View
                            </a>
                          </div>
                        ) : null
                      ))}
                    </div>
                  </div>

                  {/* Reject Reason Input */}
                  {showRejectInput && (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl animate-in fade-in zoom-in duration-200">
                      <label className="block text-sm font-medium text-red-800 mb-2">Reason for Rejection</label>
                      <textarea 
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full px-3 py-2 border border-red-200 rounded-md focus:ring-red-500 focus:border-red-500"
                        rows={2}
                        placeholder="e.g. Documents unclear, Background check failed..."
                      ></textarea>
                      <div className="mt-3 flex justify-end space-x-2">
                        <button 
                          onClick={() => setShowRejectInput(false)}
                          className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-md"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleReject(selectedProfile.id)}
                          disabled={actionLoading}
                          className="px-4 py-1.5 text-sm bg-red-600 text-white font-medium rounded-md hover:bg-red-700"
                        >
                          {actionLoading ? "Processing..." : "Confirm Reject"}
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Modal Footer */}
            {!showRejectInput && (
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-4">
                <button 
                  onClick={() => setShowRejectInput(true)}
                  disabled={actionLoading}
                  className="px-6 py-2.5 border-2 border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 hover:border-red-300 transition-colors flex items-center"
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  Reject Application
                </button>
                <button 
                  onClick={() => handleApprove(selectedProfile.id)}
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 shadow-md shadow-green-600/20 transition-colors flex items-center"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {actionLoading ? "Approving..." : "Approve & Create Account"}
                </button>
              </div>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
}

// Ensure the icon is imported for the header
import { ShieldCheck } from "lucide-react";
