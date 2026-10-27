import React, { useMemo } from "react";
import { MapPin, Navigation, Clock, Fuel, Leaf, ExternalLink, Compass } from "lucide-react";
import { estimateRoadDistance, estimateTravelDuration, getCoordinates } from "@/utils/transit";

export default function RouteMap({ origin = "Chandigarh", destination = "New Delhi", transportMode = "Car", className = "" }) {
  const distanceKm = useMemo(() => estimateRoadDistance(origin, destination), [origin, destination]);
  const duration = useMemo(() => estimateTravelDuration(distanceKm, transportMode), [distanceKm, transportMode]);
  const originCoords = useMemo(() => getCoordinates(origin), [origin]);
  const destCoords = useMemo(() => getCoordinates(destination), [destination]);

  // Estimated CO2 avoided compared to single-occupant car
  const co2SavedKg = Math.max(1, Math.round(distanceKm * 0.13));

  // Direct Google Maps Route URL for live navigation
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl backdrop-blur-xl ${className}`}>
      {/* Route Header Metrics */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Navigation className="w-5 h-5 rotate-45" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Route Visualization</div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{origin.split(",")[0]}</span>
              <span className="text-slate-500">→</span>
              <span>{destination.split(",")[0]}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors border border-slate-700"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Interactive / Visual Map Section */}
      <div className="relative h-64 md:h-72 w-full bg-slate-950 overflow-hidden flex flex-col justify-between p-6">
        {googleMapsApiKey ? (
          <iframe
            title="Google Maps Route"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://www.google.com/maps/embed/v1/directions?key=${googleMapsApiKey}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=driving`}
            className="absolute inset-0 w-full h-full opacity-80"
          />
        ) : (
          /* High-Tech Vector Corridor Map Fallback */
          <div className="absolute inset-0 pointer-events-none">
            {/* Grid background */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />
            {/* Animated SVG Route Line */}
            <svg className="w-full h-full" viewBox="0 0 600 240" preserveAspectRatio="none">
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Waypoint curved highway */}
              <path
                d="M 80 180 C 220 80, 380 200, 520 80"
                fill="none"
                stroke="rgba(148, 163, 184, 0.15)"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M 80 180 C 220 80, 380 200, 520 80"
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="4"
                strokeDasharray="8 6"
                filter="url(#glow)"
                className="animate-pulse"
              />

              {/* Origin Node */}
              <circle cx="80" cy="180" r="10" fill="#10b981" fillOpacity="0.2" />
              <circle cx="80" cy="180" r="6" fill="#10b981" />
              <circle cx="80" cy="180" r="2" fill="#ffffff" />

              {/* Checkpoint Node */}
              <circle cx="300" cy="145" r="5" fill="#06b6d4" fillOpacity="0.4" />
              <circle cx="300" cy="145" r="3" fill="#06b6d4" />

              {/* Destination Node */}
              <circle cx="520" cy="80" r="10" fill="#3b82f6" fillOpacity="0.2" />
              <circle cx="520" cy="80" r="6" fill="#3b82f6" />
              <circle cx="520" cy="80" r="2" fill="#ffffff" />
            </svg>
          </div>
        )}

        {/* Map Overlay Markers */}
        <div className="relative z-10 flex justify-between items-start pointer-events-none">
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-xl px-3 py-2 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Origin</span>
            </div>
            <div className="text-white text-xs font-bold truncate max-w-[140px] mt-0.5">
              {origin.split(",")[0]}
            </div>
            {originCoords && (
              <div className="text-[10px] text-slate-400 font-mono">
                {originCoords.lat.toFixed(2)}°N, {originCoords.lng.toFixed(2)}°E
              </div>
            )}
          </div>

          <div className="bg-slate-900/90 border border-blue-500/40 rounded-xl px-3 py-2 shadow-lg backdrop-blur-md text-right">
            <div className="flex items-center justify-end gap-1.5 text-blue-400 text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              <span>Destination</span>
            </div>
            <div className="text-white text-xs font-bold truncate max-w-[140px] mt-0.5">
              {destination.split(",")[0]}
            </div>
            {destCoords && (
              <div className="text-[10px] text-slate-400 font-mono">
                {destCoords.lat.toFixed(2)}°N, {destCoords.lng.toFixed(2)}°E
              </div>
            )}
          </div>
        </div>

        {/* Highway Corridor Tag */}
        <div className="relative z-10 self-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-slate-300 text-xs shadow-md backdrop-blur-md">
            <Navigation className="w-3 h-3 text-cyan-400" />
            <span>Fastest Highway Corridor</span>
          </div>
        </div>
      </div>

      {/* Route Trip Analytics Footer */}
      <div className="p-4 bg-slate-950/80 border-t border-slate-800 grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1 mb-0.5">
            <Navigation className="w-3 h-3 text-cyan-400" />
            <span>Est. Distance</span>
          </div>
          <div className="text-base font-bold text-white">{distanceKm} km</div>
        </div>

        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1 mb-0.5">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>Est. Duration</span>
          </div>
          <div className="text-base font-bold text-emerald-400">{duration}</div>
        </div>

        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1 mb-0.5">
            <Leaf className="w-3 h-3 text-teal-400" />
            <span>CO₂ Saved</span>
          </div>
          <div className="text-base font-bold text-teal-400">~{co2SavedKg} kg</div>
        </div>
      </div>
    </div>
  );
}
