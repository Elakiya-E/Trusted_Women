"use client";

import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapComponentProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  defaultCity?: string;
}

// Sub-component to handle map clicks
function LocationSelector({ setMarkerPosition, updateLocationDetails }: { setMarkerPosition: any, updateLocationDetails: any }) {
  useMapEvents({
    click(e) {
      setMarkerPosition(e.latlng);
      updateLocationDetails(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Sub-component to re-center map if needed
function MapController({ center }: { center: L.LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapComponent({ onLocationSelect, defaultCity = "Bengaluru" }: MapComponentProps) {
  const [markerPosition, setMarkerPosition] = useState<L.LatLng | null>(null);
  const [mapCenter, setMapCenter] = useState<L.LatLngExpression>([12.9716, 77.5946]); // default Bengaluru
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Initialize center based on defaultCity using geocoding
  useEffect(() => {
    if (defaultCity && !markerPosition) {
      searchAddress(defaultCity);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCity]);

  const updateLocationDetails = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      const address = data.display_name || "Unknown Location";
      onLocationSelect(lat, lng, address);
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      onLocationSelect(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const searchAddress = async (query: string) => {
    if (!query) return;
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        
        setMapCenter([newLat, newLng]);
        setMarkerPosition(new L.LatLng(newLat, newLng));
        onLocationSelect(newLat, newLng, display_name);
      }
    } catch (error) {
      console.error("Error geocoding:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const markerRef = useRef<any>(null);

  return (
    <div className="w-full flex flex-col space-y-3 relative z-10">
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchAddress(searchQuery))}
          placeholder="Search for an address or landmark..."
          className="flex-1 w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
        />
        <button
          type="button"
          onClick={() => searchAddress(searchQuery)}
          disabled={isSearching}
          className="px-4 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isSearching ? "Searching..." : "Search"}
        </button>
      </div>

      <div className="h-64 w-full rounded-xl overflow-hidden border border-gray-200 z-0">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationSelector setMarkerPosition={setMarkerPosition} updateLocationDetails={updateLocationDetails} />
          <MapController center={mapCenter} />
          
          {markerPosition && (
            <Marker
              draggable={true}
              eventHandlers={{
                dragend() {
                  const marker = markerRef.current;
                  if (marker != null) {
                    const position = marker.getLatLng();
                    setMarkerPosition(position);
                    updateLocationDetails(position.lat, position.lng);
                  }
                },
              }}
              position={markerPosition}
              ref={markerRef}
            />
          )}
        </MapContainer>
      </div>
      <p className="text-xs text-gray-500 italic">Click anywhere on the map or drag the marker to pin your exact location.</p>
    </div>
  );
}
