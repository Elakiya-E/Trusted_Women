import React from "react";

const cities = [
  { name: "Bengaluru", count: 12 },
  { name: "Chennai", count: 8 },
  { name: "Coimbatore", count: 6 },
  { name: "Hyderabad", count: 10 },
];

export default function AttendantAvailability() {
  return (
    <section className="py-14 bg-white" id="attendant-availability">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold tracking-wide uppercase mb-3">
            Availability
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Available Attendants</h2>
          <p className="text-gray-500 text-sm mt-2">Attendants currently available across service cities</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {cities.map((city, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-2 mb-3">
                <span className="block w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Available</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{city.count}</p>
              <p className="text-sm font-medium text-gray-600 mt-1">{city.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
