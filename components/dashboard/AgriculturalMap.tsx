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
    Promise.all([
      import("react-leaflet"),
      import("leaflet"),
    ]).then(([rl, L]) => {
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
        Polygon: rl.Polygon,
        Tooltip: rl.Tooltip,
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
      <div className="h-[420px] w-full rounded-2xl bg-muted/40 border flex items-center justify-center text-xs text-muted-foreground animate-pulse">
        नक्शा लोड हो रहा है... (Loading Agricultural GIS Map...)
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, Tooltip } = MapComponents;

  // Center on Ranchi coordinates
  const ranchiCenter: [number, number] = [23.3641, 85.3396];

  // Block boundary approximate polygons in Ranchi district
  const namkumBlock: [number, number][] = [
    [23.3200, 85.3000],
    [23.3600, 85.3000],
    [23.3600, 85.3600],
    [23.3200, 85.3600],
  ];

  const kankeBlock: [number, number][] = [
    [23.4000, 85.2900],
    [23.4500, 85.2900],
    [23.4500, 85.3600],
    [23.4000, 85.3600],
  ];

  const ormanjhiBlock: [number, number][] = [
    [23.4500, 85.4200],
    [23.5100, 85.4200],
    [23.5100, 85.5000],
    [23.4500, 85.5000],
  ];

  return (
    <div className="h-[420px] w-full rounded-2xl overflow-hidden border border-[#d2ded5] dark:border-white/10 shadow-sm relative">
      <MapContainer
        center={ranchiCenter}
        zoom={11}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Namkum Block: Leaf Blast Hotspot Polygon (Red/Amber) */}
        <Polygon
          positions={namkumBlock}
          pathOptions={{
            color: "#dc2626",
            fillColor: "#ef4444",
            fillOpacity: 0.25,
            weight: 2,
          }}
        >
          <Tooltip direction="center" permanent className="font-bold text-xs">
            Namkum Block (Blast Hotspot - 68% AAR)
          </Tooltip>
        </Polygon>

        {/* Kanke Block Polygon (Green) */}
        <Polygon
          positions={kankeBlock}
          pathOptions={{
            color: "#16a34a",
            fillColor: "#22c55e",
            fillOpacity: 0.18,
            weight: 2,
          }}
        >
          <Tooltip direction="center" permanent className="font-bold text-xs">
            Kanke Block (Safe - 72.1% AAR)
          </Tooltip>
        </Polygon>

        {/* Ormanjhi Block Polygon (Blue) */}
        <Polygon
          positions={ormanjhiBlock}
          pathOptions={{
            color: "#0284c7",
            fillColor: "#38bdf8",
            fillOpacity: 0.20,
            weight: 2,
          }}
        >
          <Tooltip direction="center" permanent className="font-bold text-xs">
            Ormanjhi Block (Optimal - 76.8% AAR)
          </Tooltip>
        </Polygon>

        {/* IMD Rainfall Alert Zone Circle */}
        <Circle
          center={[23.3441, 85.3096]}
          radius={6500}
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
              <div className="text-xs space-y-1 p-1">
                <div className="font-bold text-sm text-emerald-800 dark:text-emerald-400">{spot.farmerName}</div>
                <div><strong>Village:</strong> {spot.village}</div>
                <div><strong>Plot:</strong> {spot.areaAcres} Acres ({spot.crop})</div>
                <div className="font-semibold text-amber-700 dark:text-amber-400">Risk: {spot.riskLevel}</div>
                <div className="text-muted-foreground">{spot.status}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Legend */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-white/95 dark:bg-zinc-900/95 backdrop-blur p-2.5 rounded-xl border border-border text-[11px] space-y-1 shadow-sm hidden sm:block">
        <div className="font-bold text-xs mb-1 text-foreground">Spatial Cadastre Legend</div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-red-500/50 border border-red-600"></span>
          <span>Namkum (Leaf Blast Epidemic Cluster)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-green-500/50 border border-green-600"></span>
          <span>Kanke (Fall Armyworm Surveillance)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-sky-500/50 border border-sky-600"></span>
          <span>Ormanjhi (High Adoption Zone)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border-2 border-amber-500 border-dashed"></span>
          <span>IMD 38mm Radar Warning Zone</span>
        </div>
      </div>
    </div>
  );
}

