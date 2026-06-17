import React from "react";

type RowStatus = "Pending" | "Assigned" | "In Progress" | "Completed";

const rows: {
  id: string;
  customer: string;
  type: string;
  attendant: string;
  location: string;
  time: string;
  status: RowStatus;
}[] = [
  { id: "BKG001", customer: "Meena R.", type: "Airport Escort", attendant: "Ananya M.", location: "Bengaluru", time: "10:00 AM", status: "Completed" },
  { id: "BKG002", customer: "Priya K.", type: "Medical Escort", attendant: "Divya S.", location: "Chennai", time: "11:30 AM", status: "In Progress" },
  { id: "BKG003", customer: "Sunita L.", type: "Home Nursing", attendant: "Rekha P.", location: "Coimbatore", time: "01:00 PM", status: "Assigned" },
  { id: "BKG004", customer: "Kavitha M.", type: "Elderly Care", attendant: "—", location: "Hyderabad", time: "03:30 PM", status: "Pending" },
  { id: "BKG005", customer: "Deepa S.", type: "Train Escort", attendant: "Latha R.", location: "Bengaluru", time: "05:00 PM", status: "Assigned" },
];

const statusStyles: Record<RowStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Assigned: "bg-blue-100 text-blue-800",
  "In Progress": "bg-indigo-100 text-indigo-800",
  Completed: "bg-green-100 text-green-800",
};

export default function ServiceActivityMonitor() {
  return (
    <section className="py-14 bg-gray-50" id="activity-monitor">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 bg-purple-100 text-primary rounded-full text-xs font-semibold tracking-wide uppercase mb-3">
            Service Activity
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Service Activity Monitor</h2>
          <p className="text-gray-500 text-sm mt-2">Live view of all ongoing and recent bookings</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking ID</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service Type</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendant</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-xs font-mono font-medium text-gray-500">{row.id}</td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">{row.customer}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{row.type}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{row.attendant}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{row.location}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{row.time}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[row.status]}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
