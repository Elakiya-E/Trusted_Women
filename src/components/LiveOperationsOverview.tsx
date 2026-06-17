import React from "react";

const kpis = [
  { emoji: "👥", label: "Total Orders Today", value: "124" },
  { emoji: "👩‍⚕️", label: "Active Attendants", value: "58" },
  { emoji: "🟢", label: "Available For Service", value: "42" },
  { emoji: "🚗", label: "Ongoing Services", value: "15" },
  { emoji: "✅", label: "Completed Services Today", value: "67" },
  { emoji: "⭐", label: "Customer Satisfaction", value: "4.8 / 5" },
];

export default function LiveOperationsOverview() {
  return (
    <section className="py-14 bg-white" id="operations-overview">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 bg-purple-100 text-primary rounded-full text-xs font-semibold tracking-wide uppercase mb-3">
            Live Operations
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Live Operations Overview</h2>
          <p className="text-gray-500 text-sm mt-2">Real-time service metrics across all cities</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {kpis.map((kpi, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow"
            >
              <span className="text-3xl">{kpi.emoji}</span>
              <div>
                <p className="text-xs font-medium text-gray-500 leading-tight">{kpi.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{kpi.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
