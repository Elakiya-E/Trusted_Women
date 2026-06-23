"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { UserCheck, Search, FileText, CheckCircle, XCircle, Clock, Eye, X } from "lucide-react";
import { format } from "date-fns";

export default function ManageCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/customers");
      if (res.ok) {
        setCustomers(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationStatus: status }),
      });
      if (res.ok) {
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-primary" />
              Customer Verifications
            </h1>
            <p className="text-sm text-gray-500 mt-1">Review and verify customer ID documents.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none w-full sm:w-64"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Bookings</th>
                    <th className="px-6 py-4">Document</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Verified At</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No customers found.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{customer.name}</div>
                          {customer.email && <div className="text-xs text-gray-500">{customer.email}</div>}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{customer.phone}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center bg-purple-100 text-purple-700 font-bold h-6 w-6 rounded-full text-xs">
                            {customer.totalBookings}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {customer.idDocumentBase64 ? (
                            <button
                              onClick={() => setPreviewDoc(customer.idDocumentBase64)}
                              className="inline-flex items-center gap-1.5 text-primary hover:text-purple-800 font-medium bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                              View {customer.idDocumentType}
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs italic">No document</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {customer.verificationStatus === "VERIFIED" && (
                            <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                              <CheckCircle className="h-3.5 w-3.5" /> Verified
                            </span>
                          )}
                          {customer.verificationStatus === "PENDING" && (
                            <span className="inline-flex items-center gap-1 text-yellow-700 bg-yellow-50 border border-yellow-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                              <Clock className="h-3.5 w-3.5" /> Pending
                            </span>
                          )}
                          {customer.verificationStatus === "REJECTED" && (
                            <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                              <XCircle className="h-3.5 w-3.5" /> Rejected
                            </span>
                          )}
                          {customer.verificationStatus === "NEW" && (
                            <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                              New
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {customer.verificationDate ? format(new Date(customer.verificationDate), 'PPpp') : '—'}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => updateStatus(customer.id, "VERIFIED")}
                            disabled={customer.verificationStatus === "VERIFIED"}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(customer.id, "REJECTED")}
                            disabled={customer.verificationStatus === "REJECTED"}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Document Preview Modal */}
        {previewDoc && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Document Preview
                </h3>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex justify-center bg-gray-100">
                {previewDoc.startsWith("data:application/pdf") ? (
                  <iframe src={previewDoc} className="w-full h-[60vh] border-0 rounded-lg" />
                ) : (
                  <img src={previewDoc} alt="Document Preview" className="max-w-full h-auto max-h-[60vh] object-contain rounded-lg shadow-sm border border-gray-200" />
                )}
              </div>
              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
