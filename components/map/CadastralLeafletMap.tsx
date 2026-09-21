"use client";

import React, { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

interface CadastralLeafletMapProps {
  selectedZone: "A" | "B" | "C";
  onSelectZone: (zone: "A" | "B" | "C") => void;
  lang?: "en" | "hi";
}

export default function CadastralLeafletMap({
  selectedZone,
  onSelectZone,
  lang = "en",
}: CadastralLeafletMapProps) {
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
        Polygon: rl.Polygon,
        Polyline: rl.Polyline,
        Popup: rl.Popup,
        Tooltip: rl.Tooltip,
        Marker: rl.Marker,
      });
    });
  }, []);

  if (!MapComponents) {
    return (
      <div className="h-80 w-full rounded-2xl bg-emerald-950/5 border-2 border-dashed border-emerald-800/20 flex items-center justify-center text-xs text-muted-foreground animate-pulse">
        <span>{lang === "hi" ? "कैडस्ट्रल नक्शा लोड हो रहा है..." : "Loading Cadastral GIS Field Map..."}</span>
      </div>
    );
  }

  const { MapContainer, TileLayer, Polygon, Polyline, Tooltip, Marker, Popup } = MapComponents;

  // Center of Ravi's Farm in Namkum, Ranchi
  const farmCenter: [number, number] = [23.3440, 85.3102];

  // Cadastral Plot 2 Zones Coordinates
  const zoneACoords: [number, number][] = [
    [23.3435, 85.3085],
    [23.3445, 85.3085],
    [23.3445, 85.3095],
    [23.3435, 85.3095],
  ];

  const zoneBCoords: [number, number][] = [
    [23.3435, 85.3095],
    [23.3445, 85.3095],
    [23.3445, 85.3110],
    [23.3435, 85.3110],
  ];

  const zoneCCoords: [number, number][] = [
    [23.3435, 85.3110],
    [23.3445, 85.3110],
    [23.3445, 85.3120],
    [23.3435, 85.3120],
  ];

  const canalSluiceCoords: [number, number][] = [
    [23.3432, 85.3110],
    [23.3448, 85.3110],
  ];

  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-[#d2ded5] dark:border-white/10 shadow-sm">
      <MapContainer
        center={farmCenter}
        zoom={17}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Zone A Polygon (Upper Plot - Healthy) */}
        <Polygon
          positions={zoneACoords}
          eventHandlers={{
            click: () => onSelectZone("A"),
          }}
          pathOptions={{
            color: "#10b981",
            fillColor: "#10b981",
            fillOpacity: selectedZone === "A" ? 0.65 : 0.35,
            weight: selectedZone === "A" ? 3 : 1.5,
            dashArray: selectedZone === "A" ? undefined : "3, 3",
          }}
        >
          <Tooltip direction="center" permanent className="font-bold text-xs">
            Zone A (0.5 ac) • 88%
          </Tooltip>
        </Polygon>

        {/* Zone B Polygon (Mid-slope Target - Attention / Blast Alert) */}
        <Polygon
          positions={zoneBCoords}
          eventHandlers={{
            click: () => onSelectZone("B"),
          }}
          pathOptions={{
            color: "#d97706",
            fillColor: "#f59e0b",
            fillOpacity: selectedZone === "B" ? 0.70 : 0.40,
            weight: selectedZone === "B" ? 3.5 : 2,
          }}
        >
          <Tooltip direction="center" permanent className="font-black text-xs text-amber-900">
            ⚠️ Zone B (0.4 ac) • ATTENTION
          </Tooltip>
        </Polygon>

        {/* Zone C Polygon (Drainage Basin - Saturated) */}
        <Polygon
          positions={zoneCCoords}
          eventHandlers={{
            click: () => onSelectZone("C"),
          }}
          pathOptions={{
            color: "#0891b2",
            fillColor: "#06b6d4",
            fillOpacity: selectedZone === "C" ? 0.65 : 0.35,
            weight: selectedZone === "C" ? 3 : 1.5,
            dashArray: selectedZone === "C" ? undefined : "3, 3",
          }}
        >
          <Tooltip direction="center" permanent className="font-bold text-xs">
            Zone C (0.3 ac) • Saturated
          </Tooltip>
        </Polygon>

        {/* Canal Sluice Polyline */}
        <Polyline
          positions={canalSluiceCoords}
          pathOptions={{
            color: "#0284c7",
            weight: 4,
            dashArray: "6, 6",
          }}
        >
          <Tooltip direction="top">Canal Sluice Trench</Tooltip>
        </Polyline>

        {/* Target Alert Marker on Zone B */}
        <Marker position={[23.3440, 85.3102]}>
          <Popup>
            <div className="text-xs space-y-1 p-1">
              <div className="font-bold text-amber-700">Zone B • Alert Triggered</div>
              <div>Moisture: 78.5% (High)</div>
              <div>Disease Risk: Early Leaf Blast</div>
              <div className="font-semibold text-emerald-800">Action: Hold irrigation</div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Floating Interactive Badge */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 dark:bg-zinc-900/95 backdrop-blur px-3 py-1.5 rounded-xl border border-border shadow-xs text-xs flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        <span className="font-bold text-slate-800 dark:text-zinc-200">
          {lang === "hi" ? "सक्रिय जोन:" : "Active Zone:"}{" "}
          <span className="text-emerald-700 dark:text-emerald-400 uppercase font-black">
            Zone {selectedZone}
          </span>
        </span>
        <span className="text-muted-foreground text-[11px] hidden sm:inline">
          ({lang === "hi" ? "बदलने के लिए जोन पर क्लिक करें" : "Click zone on map to toggle"})
        </span>
      </div>

      {/* Legend overlay */}
      <div className="absolute bottom-2.5 right-2.5 z-[1000] bg-white/90 dark:bg-zinc-900/90 backdrop-blur p-2 rounded-xl border border-border text-[10px] space-y-1 shadow-xs hidden sm:block">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
          <span>Zone A (Healthy)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
          <span>Zone B (Moisture &amp; Blast Risk)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500"></span>
          <span>Zone C (Lowland Basin)</span>
        </div>
      </div>
    </div>
  );
}
