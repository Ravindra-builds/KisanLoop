"use client";

import React, { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

interface Hotspot {
  id: string;
  farmerName: string;
  village: string;
  latitude: number;
  longitude: number;
  areaAcres: number;
  crop: string;
  riskLevel: string;
  status: string;
}

export default function AgriculturalMap() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [MapComponents, setMapComponents] = useState<any>(null);

  useEffect(() => {
    // Dynamically import Leaflet components on client-side
    Promise.all([
      import("react-leaflet"),
      import("leaflet"),
    ]).then(([rl, L]) => {
      // Fix default marker icon issues in Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      setMapComponents({
        MapContainer: rl.MapContainer,
        TileLayer: rl.TileLayer,
        Marker: rl.Marker,
        Popup: rl.Popup,
        Circle: rl.Circle,
      });
    });

    fetch("/api/dashboard/map")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setHotspots(json.data);
      })
      .catch(console.error);
  }, []);

  if (!MapComponents) {
    return (
      <div className="h-[400px] w-full rounded-2xl bg-muted/40 border flex items-center justify-center text-xs text-muted-foreground animate-pulse">
        नक्शा लोड हो रहा है... (Loading Agricultural GIS Map...)
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, Circle } = MapComponents;

  // Center on Ranchi coordinates
  const ranchiCenter: [number, number] = [23.3441, 85.3096];

  return (
    <div className="h-[420px] w-full rounded-2xl overflow-hidden border border-border shadow-sm">
      <MapContainer
        center={ranchiCenter}
        zoom={11}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Rain Risk Alert Zone around Ranchi */}
        <Circle
          center={ranchiCenter}
          radius={8000}
          pathOptions={{
            color: "#f59e0b",
            fillColor: "#f59e0b",
            fillOpacity: 0.15,
            weight: 2,
            dashArray: "6, 6",
          }}
        />

        {hotspots.map((spot) => (
          <Marker key={spot.id} position={[spot.latitude, spot.longitude]}>
            <Popup>
              <div className="text-xs space-y-1">
                <div className="font-bold text-sm text-emerald-800">{spot.farmerName}</div>
                <div>Village: {spot.village}</div>
                <div>Plot: {spot.areaAcres} Acres ({spot.crop})</div>
                <div className="font-semibold text-amber-700">{spot.riskLevel}</div>
                <div className="text-muted-foreground">{spot.status}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
