import React from "react";

type NotifType = "booking" | "assigned" | "emergency" | "completed" | "feedback";

const notifications: { id: number; type: NotifType; title: string; desc: string; time: string }[] = [
  { id: 1, type: "booking", title: "New Booking", desc: "Meena R. booked an Airport Escort for Jun 18, 09:00 AM", time: "2 min ago" },
  { id: 2, type: "assigned", title: "Service Assigned", desc: "Ananya M. has been assigned to BKG-005 in Bengaluru", time: "15 min ago" },
  { id: 3, type: "emergency", title: "Emergency Alert", desc: "Client Sunita L. needs immediate assistance at Manipal Hospital", time: "32 min ago" },
  { id: 4, type: "completed", title: "Service Completed", desc: "BKG-098 completed successfully by Divya S. in Chennai", time: "1 hr ago" },
  { id: 5, type: "feedback", title: "Customer Feedback", desc: "Kavitha M. rated her experience 5⭐ — 'Excellent service!'", time: "2 hr ago" },
];

const typeStyles: Record<NotifType, { dot: string; bg: string; icon: string }> = {
  booking:   { dot: "bg-purple-500", bg: "bg-purple-50 border-purple-100", icon: "🔔" },
  assigned:  { dot: "bg-blue-500",   bg: "bg-blue-50 border-blue-100",     icon: "🔔" },
  emergency: { dot: "bg-red-500",    bg: "bg-red-50 border-red-100",       icon: "🚨" },
  completed: { dot: "bg-green-500",  bg: "bg-green-50 border-green-100",   icon: "✅" },
  feedback:  { dot: "bg-yellow-500", bg: "bg-yellow-50 border-yellow-100", icon: "⭐" },
};

export default function NotificationPanel() {
  return (
    <section className="py-14 bg-gray-50" id="notification-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 bg-purple-100 text-primary rounded-full text-xs font-semibold tracking-wide uppercase mb-3">
            Notifications
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Notification Center</h2>
          <p className="text-gray-500 text-sm mt-2">Recent alerts and activity updates across operations</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {notifications.map((n) => {
            const style = typeStyles[n.type];
            return (
              <div
                key={n.id}
                className={`flex items-start space-x-4 px-5 py-4 rounded-2xl border ${style.bg} transition-all hover:shadow-sm`}
              >
                <span className="text-xl mt-0.5">{style.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-0.5">
                    <span className={`inline-block w-2 h-2 rounded-full ${style.dot}`}></span>
                    <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{n.desc}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap pt-0.5">{n.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
