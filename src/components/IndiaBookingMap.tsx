"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  CircleMarker,
  Tooltip,
  ZoomControl,
  useMap,
} from "react-leaflet";
import type { Layer, PathOptions } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import {
  CityBookingPoint,
  aggregateStateBookings,
  getBookingColor,
  matchGeoStateName,
} from "@/lib/indiaMapData";

const GEO_URL =
  "https://cdn.jsdelivr.net/gh/Anujj1009/India-geojson@master/india_states.geojson";

const INDIA_CENTER: L.LatLngExpression = [22.5937, 78.9629];
const DEFAULT_ZOOM = 5;

interface IndiaBookingMapProps {
  cities: CityBookingPoint[];
}

function MapResetButton() {
  const map = useMap();
  return (
    <button
      type="button"
      onClick={() => map.setView(INDIA_CENTER, DEFAULT_ZOOM, { animate: true })}
      className="absolute bottom-4 right-4 z-[1000] bg-white border border-gray-200 shadow-md rounded-lg p-2 hover:bg-gray-50 transition-colors"
      title="Reset view"
    >
      <Maximize2 className="w-4 h-4 text-gray-600" />
    </button>
  );
}

function ZoomButtons() {
  const map = useMap();
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-1">
      <button
        type="button"
        onClick={() => map.zoomIn()}
        className="bg-white border border-gray-200 shadow-md rounded-lg p-2 hover:bg-purple-50 transition-colors"
        title="Zoom in"
      >
        <ZoomIn className="w-4 h-4 text-purple-700" />
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut()}
        className="bg-white border border-gray-200 shadow-md rounded-lg p-2 hover:bg-purple-50 transition-colors"
        title="Zoom out"
      >
        <ZoomOut className="w-4 h-4 text-purple-700" />
      </button>
    </div>
  );
}

export default function IndiaBookingMap({ cities }: IndiaBookingMapProps) {
  const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null);
  const [hoveredCity, setHoveredCity] = useState<CityBookingPoint | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  useEffect(() => {
    fetch(GEO_URL)
      .then((r) => r.json())
      .then(setGeoData)
      .catch(() => setGeoData(null));
  }, []);

  const stateBookings = useMemo(
    () => aggregateStateBookings(cities),
    [cities]
  );

  const maxStateBookings = useMemo(
    () => Math.max(...Object.values(stateBookings), 1),
    [stateBookings]
  );

  const maxCityBookings = useMemo(
    () => Math.max(...cities.map((c) => c.bookings), 1),
    [cities]
  );

  const geoJsonStyle = useCallback(
    (feature?: GeoJSON.Feature): PathOptions => {
      const rawName =
        (feature?.properties?.ST_NM as string) ||
        (feature?.properties?.st_nm as string) ||
        "";
      const stateName = matchGeoStateName(rawName);
      const bookings = stateBookings[stateName] || 0;
      const isHovered = hoveredState === stateName;

      return {
        fillColor: getBookingColor(bookings, maxStateBookings),
        weight: isHovered ? 2 : 1,
        opacity: 1,
        color: isHovered ? "#4338CA" : "#ffffff",
        fillOpacity: isHovered ? 0.95 : 0.82,
      };
    },
    [stateBookings, maxStateBookings, hoveredState]
  );

  const onEachState = useCallback(
    (feature: GeoJSON.Feature, layer: Layer) => {
      const rawName =
        (feature.properties?.ST_NM as string) ||
        (feature.properties?.st_nm as string) ||
        "";
      const stateName = matchGeoStateName(rawName);
      const bookings = stateBookings[stateName] || 0;

      layer.on({
        mouseover: () => setHoveredState(stateName),
        mouseout: () => setHoveredState(null),
      });

      layer.bindTooltip(
        `<div style="font-family:system-ui;font-size:12px;line-height:1.4">
          <strong>${stateName}</strong><br/>
          ${bookings} bookings
        </div>`,
        { sticky: false, direction: "top", opacity: 0.95 }
      );
    },
    [stateBookings]
  );

  const activeCity = hoveredCity ?? cities[0] ?? null;

  return (
    <div className="relative">
      {/* Floating city detail panel */}
      {activeCity && (
        <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg rounded-xl p-4 min-w-[200px] pointer-events-none">
          <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-1">
            📍 {hoveredCity ? "City Insight" : "Highest Demand"}
          </p>
          <p className="text-base font-bold text-gray-900">{activeCity.city}</p>
          <div className="mt-2 space-y-1 text-xs text-gray-600">
            <p>
              <span className="font-semibold text-gray-800">📊 Bookings:</span>{" "}
              {activeCity.bookings}
            </p>
            <p>
              <span className="font-semibold text-gray-800">📈 Growth:</span>{" "}
              <span
                className={
                  activeCity.growthPct >= 0
                    ? "text-emerald-600 font-bold"
                    : "text-red-500 font-bold"
                }
              >
                {activeCity.growthPct >= 0 ? "+" : ""}
                {activeCity.growthPct}%
              </span>
            </p>
            <p>
              <span className="font-semibold text-gray-800">🔁 Repeat:</span>{" "}
              {activeCity.repeatCustomers}
            </p>
            <p>
              <span className="font-semibold text-gray-800">⭐ Top Service:</span>{" "}
              {activeCity.topService}
            </p>
            <p>
              <span className="font-semibold text-gray-800">Density:</span>{" "}
              {activeCity.density}%
            </p>
          </div>
        </div>
      )}

      {/* Color legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm border border-gray-200 shadow-md rounded-lg px-3 py-2 pointer-events-none">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
          Booking Volume
        </p>
        <div className="flex items-center gap-2 text-[10px] text-gray-600 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm" style={{ background: "#DBEAFE" }} />
            Low
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm" style={{ background: "#818CF8" }} />
            Medium
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm" style={{ background: "#4338CA" }} />
            High
          </span>
        </div>
      </div>

      <div className="h-[420px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner bg-slate-50">
        <MapContainer
          center={INDIA_CENTER}
          zoom={DEFAULT_ZOOM}
          minZoom={4}
          maxZoom={10}
          scrollWheelZoom
          dragging
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          {geoData && (
            <GeoJSON
              key={JSON.stringify(stateBookings) + (hoveredState ?? "")}
              data={geoData}
              style={geoJsonStyle}
              onEachFeature={onEachState}
            />
          )}

          {cities.map((city) => {
            const radius = Math.max(8, Math.sqrt(city.bookings) * 2.2);
            const color = getBookingColor(city.bookings, maxCityBookings);

            return (
              <CircleMarker
                key={city.city}
                center={[city.lat, city.lng]}
                radius={radius}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: hoveredCity?.city === city.city ? 0.9 : 0.65,
                  color: "#4338CA",
                  weight: hoveredCity?.city === city.city ? 3 : 1.5,
                }}
                eventHandlers={{
                  mouseover: () => setHoveredCity(city),
                  mouseout: () => setHoveredCity(null),
                }}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -radius]}
                  opacity={1}
                  className="!bg-gray-900 !text-white !border-0 !rounded-lg !shadow-xl !px-3 !py-2"
                >
                  <div className="text-center min-w-[120px]">
                    <p className="font-bold text-sm">{city.city}</p>
                    <p className="text-xs mt-0.5">{city.bookings} Bookings</p>
                    <p
                      className={`text-xs font-bold ${
                        city.growthPct >= 0 ? "text-emerald-300" : "text-red-300"
                      }`}
                    >
                      {city.growthPct >= 0 ? "+" : ""}
                      {city.growthPct}%
                    </p>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}

          <ZoomControl position="bottomright" />
          <ZoomButtons />
          <MapResetButton />
        </MapContainer>
      </div>

      {/* City chips below map */}
      <div className="flex flex-wrap gap-2 mt-3">
        {cities.map((c) => (
          <button
            key={c.city}
            type="button"
            onMouseEnter={() => setHoveredCity(c)}
            onMouseLeave={() => setHoveredCity(null)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
              hoveredCity?.city === c.city
                ? "bg-purple-600 text-white border-purple-600 shadow-md"
                : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: getBookingColor(c.bookings, maxCityBookings),
              }}
            />
            {c.city}: {c.bookings}
            <span className={c.growthPct >= 0 ? "text-emerald-600" : "text-red-500"}>
              {c.growthPct >= 0 ? "+" : ""}
              {c.growthPct}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
