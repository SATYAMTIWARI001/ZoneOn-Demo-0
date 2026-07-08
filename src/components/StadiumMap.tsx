import React, { useState, useEffect } from 'react';
import { MapPin, Info, ArrowRight, Accessibility, AlertTriangle, Eye, ShieldAlert, HeartPulse } from 'lucide-react';

interface StadiumMapProps {
  activeRole: string;
  selectedZone: string;
  setSelectedZone: (zone: string) => void;
  crowdLevel: 'low' | 'medium' | 'high';
  activeIncidents: any[];
  accessibilityMode?: boolean;
}

export default function StadiumMap({
  activeRole,
  selectedZone,
  setSelectedZone,
  crowdLevel,
  activeIncidents,
  accessibilityMode
}: StadiumMapProps) {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [activeRoute, setActiveRoute] = useState<'none' | 'wheelchair' | 'concession' | 'emergency' | 'exit'>('none');

  useEffect(() => {
    if (accessibilityMode) {
      setActiveRoute('wheelchair');
    } else {
      setActiveRoute('none');
    }
  }, [accessibilityMode]);

  // Define nodes on our stadium grid
  const zones = [
    { id: 'Zone A', name: 'Zone A (East Stand)', color: 'from-amber-500/20 to-orange-500/10', stroke: '#f59e0b', gates: 'Gates 1 & 2', bg: 'rgba(245, 158, 11, 0.15)' },
    { id: 'Zone B', name: 'Zone B (North Stand)', color: 'from-purple-500/20 to-indigo-500/10', stroke: '#8b5cf6', gates: 'Gates 3 & 4', bg: 'rgba(139, 92, 246, 0.15)' },
    { id: 'Zone C', name: 'Zone C (South Stand)', color: 'from-blue-500/20 to-cyan-500/10', stroke: '#3b82f6', gates: 'Gates 5 & 6', bg: 'rgba(59, 130, 246, 0.15)' },
    { id: 'Zone D', name: 'Zone D (West Stand)', color: 'from-emerald-500/20 to-teal-500/10', stroke: '#10b981', gates: 'Gates 7 & 8', bg: 'rgba(16, 185, 129, 0.15)' }
  ];

  // Specific checkpoints of interest inside the stadium
  const pointsOfInterest = [
    { id: 'gate3', label: 'Gate 3 (Access Zone B)', x: 250, y: 35, type: 'gate', info: 'Active bottleneck - lanes 4 & 5 experiencing scanning issues.' },
    { id: 'gate1', label: 'Gate 1 (Access Zone A)', x: 440, y: 150, type: 'gate', info: 'Flow: fast. Wheelchair access fully clear.' },
    { id: 'gate5', label: 'Gate 5 (Access Zone C)', x: 250, y: 465, type: 'gate', info: 'Flow: standard. Ticket validation lines clear.' },
    { id: 'gate7', label: 'Gate 7 (Access Zone D)', x: 60, y: 250, type: 'gate', info: 'Flow: standard. Connected to park & ride shuttles.' },
    { id: 'medical-east', label: 'Medical Tent East', x: 380, y: 120, type: 'medical', info: 'Triage active. 2 medical carts standing by.' },
    { id: 'medical-west', label: 'Medical Tent West', x: 120, y: 380, type: 'medical', info: 'Primary trauma and heat-exhaustion station.' },
    { id: 'concession-b', label: 'Concession Stand North', x: 280, y: 100, type: 'concession', info: 'Tacos, beverages, World Cup merchandise.' },
    { id: 'concession-d', label: 'Concession Stand West', x: 100, y: 200, type: 'concession', info: 'Burgers, salads, and recycling return point.' },
    { id: 'sustain-hub', label: 'Recycling Station D', x: 150, y: 120, type: 'sustainability', info: 'Green Cup return bin. Plastic shredder active.' }
  ];

  const handleZoneClick = (zoneId: string) => {
    setSelectedZone(zoneId);
  };

  // Get coordinates for paths
  // Center is at 250, 250
  const routes = {
    wheelchair: {
      path: "M 440,150 L 380,150 L 320,180 L 270,220",
      color: "#10b981", // Emerald
      description: "Gate 1 (Amber Stand) to Level 1 Wheelchair Bays (Sectors 108-112). Ramp-only accessible corridor."
    },
    concession: {
      path: "M 60,250 L 100,200 L 170,180",
      color: "#f59e0b", // Amber
      description: "Gate 7 to West Concessions. High-throughput walkway, low wait times."
    },
    emergency: {
      path: "M 250,465 L 250,380 L 200,320 L 120,380",
      color: "#ef4444", // Red
      description: "Gate 5 Transit Path to Medical Tent West. Dedicated response route for golf carts."
    },
    exit: {
      path: "M 250,250 L 210,180 L 150,120 L 60,250",
      color: "#3b82f6", // Blue
      description: "Section 104 evacuation route via West Gate 7. Safe exit bypass corridor."
    }
  };

  return (
    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col h-full select-none">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 z-10">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-blue-400 font-bold uppercase block">STADIUM BLUEPRINT & LIVE SENSORS</span>
          <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
            Luas Stadium Command Center 
            {activeRole === 'security' && <span className="bg-red-500/20 text-red-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-red-500/30">LIVE HEATMAPS</span>}
            {activeRole === 'emergency' && <span className="bg-red-500/20 text-red-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-red-500/30">FIRST AID PATHS</span>}
            {activeRole === 'sustainability' && <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">RECYCLING HUBS</span>}
          </h3>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button 
            onClick={() => setActiveRoute(activeRoute === 'wheelchair' ? 'none' : 'wheelchair')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 transition-all ${
              activeRoute === 'wheelchair' 
                ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500/50 shadow-sm' 
                : 'bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10'
            }`}
          >
            <Accessibility size={13} /> Wheelchair Path
          </button>
          <button 
            onClick={() => setActiveRoute(activeRoute === 'emergency' ? 'none' : 'emergency')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 transition-all ${
              activeRoute === 'emergency' 
                ? 'bg-red-500/30 text-red-300 border-red-500/50 shadow-sm' 
                : 'bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10'
            }`}
          >
            <HeartPulse size={13} /> Emergency Path
          </button>
          <button 
            onClick={() => setActiveRoute(activeRoute === 'exit' ? 'none' : 'exit')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 transition-all ${
              activeRoute === 'exit' 
                ? 'bg-blue-500/30 text-blue-300 border-blue-500/50 shadow-sm' 
                : 'bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10'
            }`}
          >
            <ArrowRight size={13} /> Exit Route
          </button>
        </div>
      </div>
 
      {/* SVG Interactive Map */}
      <div className="flex-1 flex items-center justify-center relative min-h-[340px] md:min-h-[420px] bg-white/5 rounded-xl border border-white/10 p-2">
        <svg 
          viewBox="0 0 500 500" 
          className="w-full max-w-[440px] h-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
          style={{ transform: 'translate3d(0,0,0)' }}
        >
          {/* Defs for gradients, glowing effects, patterns */}
          <defs>
            <radialGradient id="stadium-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#020617" stopOpacity="1" />
            </radialGradient>
            
            {/* Sector Glowing Gradients */}
            <radialGradient id="amber-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="purple-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="blue-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="emerald-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
            
            {/* RED Bottleneck congestion glow */}
            <radialGradient id="bottleneck-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
              <stop offset="70%" stopColor="#ef4444" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>

            {/* Pattern for Grid */}
            <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.01)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Grid background */}
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />

          {/* Outer Ring road / Outer wall */}
          <circle cx="250" cy="250" r="235" fill="none" stroke="#1e293b" strokeWidth="2" strokeDasharray="6,4" />
          <circle cx="250" cy="250" r="225" fill="none" stroke="#334155" strokeWidth="1" />

          {/* Stadium Inner Concourse Ring */}
          <circle cx="250" cy="250" r="175" fill="none" stroke="#1e293b" strokeWidth="2" />
          
          {/* Interactive Sectors/Zones (divided into 4 arcs) */}
          {/* East Sector: Zone A */}
          <path 
            d="M 250,250 L 373,127 A 175,175 0 0,1 373,373 Z" 
            fill={selectedZone === 'Zone A' ? 'rgba(245, 158, 11, 0.12)' : 'transparent'} 
            stroke={selectedZone === 'Zone A' ? '#f59e0b' : '#334155'} 
            strokeWidth={selectedZone === 'Zone A' ? 2.5 : 1}
            onClick={() => handleZoneClick('Zone A')}
            className="cursor-pointer transition-all duration-300 hover:fill-amber-500/5"
          />
          
          {/* North Sector: Zone B */}
          <path 
            d="M 250,250 L 127,127 A 175,175 0 0,1 373,127 Z" 
            fill={selectedZone === 'Zone B' ? 'rgba(139, 92, 246, 0.12)' : 'transparent'} 
            stroke={selectedZone === 'Zone B' ? '#8b5cf6' : '#334155'} 
            strokeWidth={selectedZone === 'Zone B' ? 2.5 : 1}
            onClick={() => handleZoneClick('Zone B')}
            className="cursor-pointer transition-all duration-300 hover:fill-purple-500/5"
          />

          {/* South Sector: Zone C */}
          <path 
            d="M 250,250 L 373,373 A 175,175 0 0,1 127,373 Z" 
            fill={selectedZone === 'Zone C' ? 'rgba(59, 130, 246, 0.12)' : 'transparent'} 
            stroke={selectedZone === 'Zone C' ? '#3b82f6' : '#334155'} 
            strokeWidth={selectedZone === 'Zone C' ? 2.5 : 1}
            onClick={() => handleZoneClick('Zone C')}
            className="cursor-pointer transition-all duration-300 hover:fill-blue-500/5"
          />

          {/* West Sector: Zone D */}
          <path 
            d="M 250,250 L 127,373 A 175,175 0 0,1 127,127 Z" 
            fill={selectedZone === 'Zone D' ? 'rgba(16, 185, 129, 0.12)' : 'transparent'} 
            stroke={selectedZone === 'Zone D' ? '#10b981' : '#334155'} 
            strokeWidth={selectedZone === 'Zone D' ? 2.5 : 1}
            onClick={() => handleZoneClick('Zone D')}
            className="cursor-pointer transition-all duration-300 hover:fill-emerald-500/5"
          />

          {/* Crowd Heatmaps (Aura Glow Toggles based on Stakeholder requirements or Active Bottlenecks) */}
          {(activeRole === 'security' || activeRole === 'organizer') && (
            <>
              {/* Dynamic glowing overlays */}
              <circle cx="360" cy="250" r="60" fill="url(#amber-glow)" pointerEvents="none" />
              <circle cx="250" cy="120" r="50" fill="url(#purple-glow)" pointerEvents="none" />
              <circle cx="120" cy="250" r="50" fill="url(#emerald-glow)" pointerEvents="none" />
              {/* Active bottleneck in Gate 3 (Zone B North) */}
              <circle cx="250" cy="40" r="45" fill="url(#bottleneck-glow)" pointerEvents="none" />
              {/* Bottleneck alert pulsing circles */}
              <circle cx="250" cy="40" r="15" fill="none" stroke="#ef4444" strokeWidth="2" className="animate-ping" style={{ transformOrigin: '250px 40px' }} />
            </>
          )}

          {/* Evacuation / Medical Tents mapping highlights */}
          {activeRole === 'emergency' && (
            <>
              <circle cx="380" cy="120" r="20" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="120" cy="380" r="20" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
            </>
          )}

          {/* Football Field in Center */}
          <g transform="translate(180, 200)">
            <rect width="140" height="100" rx="4" fill="#14532d" stroke="#f8fafc" strokeWidth="1.5" opacity="0.9" />
            {/* Center line */}
            <line x1="70" y1="0" x2="70" y2="100" stroke="#f8fafc" strokeWidth="1.5" />
            {/* Center circle */}
            <circle cx="70" cy="50" r="20" fill="none" stroke="#f8fafc" strokeWidth="1.5" />
            <circle cx="70" cy="50" r="1.5" fill="#f8fafc" />
            {/* Penalty boxes */}
            <rect x="0" y="25" width="20" height="50" fill="none" stroke="#f8fafc" strokeWidth="1.5" />
            <rect x="120" y="25" width="20" height="50" fill="none" stroke="#f8fafc" strokeWidth="1.5" />
            {/* Corner Arcs */}
            <path d="M 0,5 A 5,5 0 0,0 5,0" fill="none" stroke="#f8fafc" strokeWidth="1" />
            <path d="M 140,5 A 5,5 0 0,1 135,0" fill="none" stroke="#f8fafc" strokeWidth="1" />
            <path d="M 0,95 A 5,5 0 0,1 5,100" fill="none" stroke="#f8fafc" strokeWidth="1" />
            <path d="M 140,95 A 5,5 0 0,0 135,100" fill="none" stroke="#f8fafc" strokeWidth="1" />
          </g>

          {/* Outer Boundary Stadium Gates Label Circles */}
          {/* Gate 1 & 2 (East) */}
          <circle cx="440" cy="150" r="12" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
          <text x="440" y="154" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">G1</text>
          
          <circle cx="440" cy="350" r="12" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
          <text x="440" y="354" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">G2</text>

          {/* Gate 3 & 4 (North) */}
          <circle cx="250" cy="35" r="12" fill="#ef4444" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
          <text x="250" y="39" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">G3</text>
          
          <circle cx="370" cy="45" r="12" fill="#1e293b" stroke="#8b5cf6" strokeWidth="2" />
          <text x="370" y="49" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">G4</text>

          {/* Gate 5 & 6 (South) */}
          <circle cx="250" cy="465" r="12" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
          <text x="250" y="469" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">G5</text>
          
          <circle cx="130" cy="455" r="12" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
          <text x="130" y="459" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">G6</text>

          {/* Gate 7 & 8 (West) */}
          <circle cx="60" cy="250" r="12" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
          <text x="60" y="254" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">G7</text>
          
          <circle cx="60" cy="150" r="12" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
          <text x="60" y="154" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">G8</text>

          {/* Render Flowing Connected Route Lines when selected */}
          {activeRoute !== 'none' && routes[activeRoute] && (
            <>
              {/* Route Glow Shadow */}
              <path 
                d={routes[activeRoute].path} 
                fill="none" 
                stroke={routes[activeRoute].color} 
                strokeWidth="8" 
                opacity="0.2" 
                strokeLinecap="round"
              />
              {/* Solid Route Line with flowing dash */}
              <path 
                d={routes[activeRoute].path} 
                fill="none" 
                stroke={routes[activeRoute].color} 
                strokeWidth="3.5" 
                strokeLinecap="round"
                strokeDasharray="8 6"
                className="animate-[dash_15s_linear_infinite]"
                style={{
                  animation: 'dash 1.5s linear infinite',
                  strokeDashoffset: 100
                }}
              />
            </>
          )}

          {/* Interactive checkpoints (Points of interest dots) */}
          {pointsOfInterest.map((poi) => {
            let pColor = '#ffffff';
            if (poi.type === 'gate') pColor = '#94a3b8';
            if (poi.type === 'medical') pColor = '#ef4444';
            if (poi.type === 'concession') pColor = '#f59e0b';
            if (poi.type === 'sustainability') pColor = '#10b981';

            return (
              <g 
                key={poi.id}
                className="cursor-pointer group"
                onClick={() => {
                  setHoveredElement(poi.label + " | " + poi.info);
                  if (poi.id === 'gate3') setSelectedZone('Zone B');
                  if (poi.id === 'gate1') setSelectedZone('Zone A');
                  if (poi.id === 'gate5') setSelectedZone('Zone C');
                  if (poi.id === 'gate7') setSelectedZone('Zone D');
                }}
                onMouseEnter={() => setHoveredElement(poi.label + " - " + poi.info)}
                onMouseLeave={() => setHoveredElement(null)}
              >
                {/* Outer hover ring */}
                <circle 
                  cx={poi.x} 
                  cy={poi.y} 
                  r="11" 
                  fill="none" 
                  stroke={pColor} 
                  strokeWidth="1" 
                  className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-125" 
                />
                {/* Core dot */}
                <circle 
                  cx={poi.x} 
                  cy={poi.y} 
                  r="6" 
                  fill={pColor} 
                  stroke="#020617" 
                  strokeWidth="1.5" 
                />
              </g>
            );
          })}

          {/* Labels for Zones */}
          <text x="375" y="250" fill="#ffffff" opacity="0.25" fontSize="15" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">ZONE A</text>
          <text x="250" y="110" fill="#ffffff" opacity="0.25" fontSize="15" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">ZONE B</text>
          <text x="250" y="395" fill="#ffffff" opacity="0.25" fontSize="15" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">ZONE C</text>
          <text x="125" y="250" fill="#ffffff" opacity="0.25" fontSize="15" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">ZONE D</text>
        </svg>

        {/* Floating Tooltip info on Hover/Click */}
        {hoveredElement && (
          <div className="absolute bottom-3 left-3 right-3 bg-slate-950/90 backdrop-blur-md border border-white/10 rounded-lg p-2.5 shadow-xl text-xs text-slate-300 z-20 flex items-start gap-2 animate-fadeIn animate-duration-200">
            <Info size={14} className="text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-white font-sans">{hoveredElement.split(" | ")[0] || hoveredElement.split(" - ")[0]}</p>
              <p className="text-slate-400 text-[11px] leading-snug mt-0.5">{hoveredElement.split(" | ")[1] || hoveredElement.split(" - ")[1] || "Live IoT node. Selecting handles local zone status."}</p>
            </div>
          </div>
        )}
      </div>

      {/* Map Footer Information */}
      <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-white/60 font-medium">Click zones to filter dispatches:</span>
          <div className="flex gap-2">
            {zones.map(z => (
              <button
                key={z.id}
                onClick={() => setSelectedZone(z.id)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-all ${
                  selectedZone === z.id 
                    ? 'bg-blue-500 text-white font-bold border-blue-400' 
                    : 'bg-white/5 text-white/40 border-white/10 hover:text-white hover:bg-white/10'
                }`}
              >
                {z.id}
              </button>
            ))}
          </div>
        </div>
        
        {activeRoute !== 'none' && routes[activeRoute] && (
          <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg max-w-sm">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-0.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: routes[activeRoute].color }} />
              <span className="capitalize">{activeRoute} Active Route</span>
            </div>
            <p className="text-white/60 text-[10px] leading-tight">{routes[activeRoute].description}</p>
          </div>
        )}
      </div>
      
      {/* Styles for dashed path animations in Tailwind v4 compatibility */}
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
