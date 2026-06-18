"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import {
  enrichCityStatsFromApi,
  applyMapFilters,
  DEFAULT_TOP_LOCATIONS,
} from "@/lib/indiaMapData";

const IndiaBookingMap = dynamic(
  () => import("@/components/IndiaBookingMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[420px] w-full rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 animate-pulse flex items-center justify-center border border-gray-200">
        <span className="text-sm text-gray-400 font-medium">Loading India map…</span>
      </div>
    ),
  }
);
import {
  ShoppingCart,
  Users,
  UserCheck,
  CheckCircle,
  Star,
  TrendingUp,
  Clock,
  ExternalLink,
  RefreshCw,
  MapPin,
  Train,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

// ─── Interfaces ──────────────────────────────────────────────────────────────
interface Service { title: string; }
interface Attendant { id: string; name: string; }
interface Booking {
  id: string; name: string; phone: string; city: string;
  date: string; time: string; requirement: string; status: string;
  createdAt: string; service: Service; attendant: Attendant | null;
}

interface AnalyticsData {
  kpis: {
    totalBookings: number;
    totalCustomers: number;
    repeatCustomers: number;
    activeAttendants: number;
    growthPct: number;
    avgRating: string;
  };
  cityStats: { city: string; bookings: number }[];
  topLocations: { rank: number; name: string; bookings: number; pct: number; trend: string }[];
  repeatData: { name: string; value: number }[];
  retentionPct: number;
  serviceDemand: { name: string; value: number; count: number }[];
  peakHours: { slot: string; bookings: number }[];
  railwayStations: { station: string; city: string; bookings: number; growth: string }[];
}

// ─── Status Styles ────────────────────────────────────────────────────────────
const statusStyles: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  "Under Review": "bg-amber-100 text-amber-800",
  Assigned: "bg-blue-100 text-blue-800",
  Accepted: "bg-teal-100 text-teal-800",
  "In Progress": "bg-indigo-100 text-indigo-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-700",
};

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#ec4899", "#14b8a6"];

// ─── Page Component ───────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [filterPeriod, setFilterPeriod]   = useState("This Month");
  const [filterCity, setFilterCity]       = useState("All Cities");
  const [filterService, setFilterService] = useState("All Services");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, analyticsRes] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/admin/analytics"),
      ]);
      if (bookingsRes.ok) setBookings(await bookingsRes.json());
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Derived values ──
  const kpis = analytics?.kpis;
  const cityStats      = analytics?.cityStats ?? [];
  const topLocations   =
    analytics?.topLocations && analytics.topLocations.length > 0
      ? analytics.topLocations
      : DEFAULT_TOP_LOCATIONS;

  const mapCityData = useMemo(() => {
    const enriched = enrichCityStatsFromApi(cityStats);
    return applyMapFilters(enriched, filterPeriod, filterCity, filterService);
  }, [cityStats, filterPeriod, filterCity, filterService]);

  const filteredCityStats = useMemo(
    () => mapCityData.map((c) => ({ city: c.city, bookings: c.bookings })),
    [mapCityData]
  );
  const repeatData     = analytics?.repeatData ?? [];
  const retentionPct   = analytics?.retentionPct ?? 0;
  const serviceDemand  = analytics?.serviceDemand ?? [];
  const peakHours      = analytics?.peakHours ?? [];
  const railwayStations = analytics?.railwayStations ?? [];

  const maxPeak = Math.max(...peakHours.map(p => p.bookings), 1);

  // KPI card definitions — all driven by real API data
  const kpiCards = [
    { label: "Total Bookings",        value: kpis?.totalBookings   ?? 0, icon: ShoppingCart, color: "bg-purple-100 text-purple-700"  },
    { label: "Total Customers",       value: kpis?.totalCustomers  ?? 0, icon: Users,        color: "bg-indigo-100 text-indigo-700"  },
    { label: "Repeat Customers",      value: kpis?.repeatCustomers ?? 0, icon: RefreshCw,    color: "bg-teal-100 text-teal-700"      },
    { label: "Active Attendants",     value: kpis?.activeAttendants ?? 0, icon: UserCheck,   color: "bg-blue-100 text-blue-700"      },
    { label: "Booking Growth %",      value: `${kpis?.growthPct ?? 0}%`, icon: TrendingUp,  color: "bg-emerald-100 text-emerald-700" },
    { label: "Customer Satisfaction", value: kpis?.avgRating ?? "N/A",   icon: Star,        color: "bg-yellow-100 text-yellow-700"   },
  ];

  // Medals for top locations
  const medals = ["🥇", "🥈", "🥉"];

  // Activity log from real bookings
  const getRecentActivity = () => {
    const logs: { text: string; time: string }[] = [];
    bookings.slice(0, 5).forEach(b => {
      const t = new Date(b.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (b.status === "Pending")
        logs.push({ text: `New booking from ${b.name} (${b.service.title})`, time: `${t} today` });
      else if (b.status === "Assigned")
        logs.push({ text: `Attendant assigned to ${b.name} for ${b.service.title}`, time: `${t} today` });
      else if (b.status === "Accepted")
        logs.push({ text: `${b.attendant?.name || "Attendant"} accepted ${b.name}'s request`, time: `${t} today` });
      else
        logs.push({ text: `${b.name} status → ${b.status}`, time: `${t} today` });
    });
    return logs.length ? logs : [{ text: "No activity recorded yet.", time: "—" }];
  };

  const recentActivity     = getRecentActivity();
  const recentBookingsList = bookings.slice(0, 5);

  // Unique cities and services for filter dropdowns (from real data)
  const uniqueCities   = Array.from(
    new Set([
      ...bookings.map(b => b.city.trim()),
      "Chennai", "Bengaluru", "Hyderabad", "Coimbatore", "Madurai", "Mumbai", "Delhi",
    ])
  ).sort();
  const uniqueServices = Array.from(
    new Set([
      ...bookings.map(b => b.service?.title).filter(Boolean),
      "Hospital Attendant", "Airport Pickup", "Elderly Care", "Railway Pickup",
      "Home Support", "Women Driver",
    ])
  ).sort();

  const GrowthBadge = ({ g }: { g: string }) =>
    g === "up"   ? <span className="text-emerald-600 font-bold text-xs">▲ Up</span>
    : g === "down" ? <span className="text-red-500 font-bold text-xs">▼ Down</span>
    : <span className="text-gray-400 text-xs">— Stable</span>;

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10">

        {/* ── HEADER + FILTERS ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-sm text-gray-500 mt-0.5">Executive analytics — real-time operations intelligence</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {["Today", "This Week", "This Month", "This Year"].map(p => (
              <button
                key={p}
                onClick={() => setFilterPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  filterPeriod === p
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-purple-400"
                }`}
              >
                {p}
              </button>
            ))}
            <select
              value={filterCity}
              onChange={e => setFilterCity(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option>All Cities</option>
              {uniqueCities.map(c => <option key={c}>{c}</option>)}
            </select>
            <select
              value={filterService}
              onChange={e => setFilterService(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option>All Services</option>
              {uniqueServices.map(s => <option key={s}>{s}</option>)}
            </select>
            <button
              onClick={fetchData}
              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold transition-all"
            >
              ↻ Sync
            </button>
          </div>
        </div>

        {/* ── SECTION 1 – KPI CARDS ──────────────────────────────── */}
        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 ${loading ? "opacity-50 animate-pulse pointer-events-none" : ""}`}>
          {kpiCards.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div key={idx} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${kpi.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-2xl font-extrabold text-gray-900">{kpi.value}</p>
                <p className="text-[11px] font-medium text-gray-500 leading-tight">{kpi.label}</p>
              </div>
            );
          })}
        </div>

        {/* ── SECTION 2 + 3 – INDIA MAP & TOP LOCATIONS ──────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* India Booking Map — interactive Leaflet choropleth */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-600" />
                <h2 className="font-bold text-gray-900">India Booking Map</h2>
              </div>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Pan · Zoom · Hover
              </span>
            </div>
            <IndiaBookingMap cities={mapCityData} />
          </div>

          {/* Section 3 – Top 3 Locations */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <h2 className="font-bold text-gray-900">Top 3 Locations</h2>
            </div>
            <div className="space-y-4 flex-1">
              {topLocations.map((loc, i) => (
                <div key={loc.rank} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-purple-50 transition-colors">
                  <span className="text-2xl">{medals[i] || `#${loc.rank}`}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{loc.name}</p>
                    <p className="text-xs text-gray-500">{loc.bookings} bookings · {loc.pct}% of total</p>
                  </div>
                  <GrowthBadge g={loc.trend} />
                </div>
              ))}
            </div>
            {filteredCityStats.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2 font-medium">City Distribution</p>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={filteredCityStats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="city" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* ── SECTION 4 + 7 – REPEAT CUSTOMERS & SERVICE DEMAND ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Section 4 – Repeat Customer Donut */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw className="h-4 w-4 text-teal-600" />
              <h2 className="font-bold text-gray-900">Repeat Customer Analytics</h2>
            </div>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie data={repeatData} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={3} startAngle={90} endAngle={-270}>
                    {repeatData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-3">
                {repeatData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i] }} />
                    <div>
                      <p className="text-xs font-semibold text-gray-700">{d.name}</p>
                      <p className="text-lg font-bold text-gray-900">{d.value}</p>
                    </div>
                  </div>
                ))}
                <div className="mt-1 p-2 bg-teal-50 rounded-lg">
                  <p className="text-xs text-teal-700 font-semibold">Retention Rate</p>
                  <p className="text-xl font-extrabold text-teal-800">{retentionPct}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 7 – Service Demand */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <h2 className="font-bold text-gray-900">Service Demand</h2>
            </div>
            {serviceDemand.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No service data yet.</p>
            ) : (
              <div className="flex items-start gap-4">
                <ResponsiveContainer width="55%" height={200}>
                  <PieChart>
                    <Pie data={serviceDemand} dataKey="value" outerRadius={85} paddingAngle={2}>
                      {serviceDemand.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 flex-1">
                  {serviceDemand.map((s, i) => (
                    <div key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-xs text-gray-600 truncate max-w-[120px]">{s.name}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-800">{s.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── SECTION 5 – RAILWAY STATIONS ─────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <Train className="h-4 w-4 text-purple-600" />
            <h2 className="font-bold text-gray-900">Top Booking Stations</h2>
          </div>
          {railwayStations.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No station data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Station</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">City</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Bookings</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {railwayStations.map((s, i) => (
                    <tr key={s.station} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 text-xs text-gray-400 font-mono">{i + 1}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-gray-900">{s.station}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{s.city}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 rounded-full bg-indigo-200 w-20 overflow-hidden">
                            <div
                              className="h-2 rounded-full bg-indigo-500"
                              style={{ width: `${(s.bookings / Math.max(...railwayStations.map(r => r.bookings), 1)) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-gray-900">{s.bookings}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3"><GrowthBadge g={s.growth} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── SECTION 6 – PEAK HOURS HEATMAP ──────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="h-4 w-4 text-purple-600" />
            <h2 className="font-bold text-gray-900">Peak Booking Hours</h2>
            <span className="ml-auto text-xs text-gray-400">Busiest slot highlighted</span>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {peakHours.map(slot => {
              const intensity = maxPeak > 0 ? slot.bookings / maxPeak : 0;
              const isBusiest = slot.bookings === maxPeak && slot.bookings > 0;
              return (
                <div
                  key={slot.slot}
                  className={`relative rounded-xl p-4 text-center border-2 transition-all ${
                    isBusiest
                      ? "border-purple-500 bg-purple-600 text-white shadow-lg shadow-purple-200"
                      : "border-gray-100 text-gray-700"
                  }`}
                  style={!isBusiest ? { backgroundColor: `rgba(79, 70, 229, ${intensity * 0.15 + 0.04})` } : {}}
                >
                  {isBusiest && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-[9px] font-bold px-2 py-0.5 rounded-full">
                      PEAK
                    </span>
                  )}
                  <p className={`text-xs font-semibold mb-1 ${isBusiest ? "text-purple-100" : "text-gray-500"}`}>{slot.slot}</p>
                  <p className={`text-2xl font-extrabold ${isBusiest ? "text-white" : "text-gray-900"}`}>{slot.bookings}</p>
                  <p className={`text-[10px] mt-0.5 ${isBusiest ? "text-purple-200" : "text-gray-400"}`}>bookings</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── EXISTING: Recent Bookings + Activity Feed ──────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="font-bold text-gray-900">Recent Booking Requests</h2>
              <Link href="/manage-bookings" className="text-xs text-purple-600 font-semibold hover:underline flex items-center gap-1">
                <span>Manage All</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <span className="animate-spin rounded-full h-6 w-6 border-t-2 border-purple-500" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50/20 border-b border-gray-50">
                      {["ID", "Customer", "Service", "Scheduled", "Status"].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentBookingsList.map(b => (
                      <tr key={b.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-5 py-3.5 text-xs font-mono text-gray-400">{b.id.substring(0, 8)}</td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">
                          <div>{b.name}</div>
                          <span className="text-[10px] text-gray-400 font-mono font-normal">{b.phone}</span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-700">
                          <div>{b.service?.title}</div>
                          <span className="text-[10px] text-gray-400">{b.city}</span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-600">{b.date} · {b.time}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusStyles[b.status] || "bg-gray-100"}`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {recentBookingsList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">
                          No service bookings requested yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-bold text-gray-900">Recent Operations Log</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {recentActivity.map((a, idx) => (
                <div key={idx} className="px-5 py-4 flex items-start space-x-3">
                  <div className="mt-0.5 p-1.5 bg-slate-50 rounded-lg flex-shrink-0 border border-slate-100">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-700 leading-snug break-words">{a.text}</p>
                    <p className="text-xs text-gray-400 mt-1">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
