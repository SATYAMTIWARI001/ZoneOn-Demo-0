import React, { useState, useEffect } from 'react';
import { 
  MapPin, Info, ArrowRight, Accessibility, AlertTriangle, Eye, ShieldAlert, HeartPulse, Flame,
  ZoomIn, ZoomOut, RefreshCw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Sliders
} from 'lucide-react';

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
  const [showApiHeatmap, setShowApiHeatmap] = useState<boolean>(true); // Active crowd level heatmap layer from API incidents
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoomSensitivity, setZoomSensitivity] = useState<number>(1.0); // range 0.2 to 2.0

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25 * zoomSensitivity, 4));
  };

  const handleZoomOut = () => {
    setZoom(prev => {
      const next = Math.max(prev - 0.25 * zoomSensitivity, 1);
      if (next === 1) {
        setPan({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handlePan = (direction: 'up' | 'down' | 'left' | 'right') => {
    const step = 40;
    setPan(prev => {
      const updated = { ...prev };
      if (direction === 'up') updated.y += step;
      if (direction === 'down') updated.y -= step;
      if (direction === 'left') updated.x += step;
      if (direction === 'right') updated.x -= step;
      return updated;
    });
  };

  // Mouse drag to pan handlers
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Touch handlers for responsive mobile dragging
  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setPan({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Smooth mouse-wheel zooming
  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const zoomIntensity = 0.08 * zoomSensitivity;
    const delta = -e.deltaY;
    setZoom(prev => {
      const next = Math.min(Math.max(prev + (delta > 0 ? zoomIntensity : -zoomIntensity), 1), 4);
      if (next === 1) {
        setPan({ x: 0, y: 0 });
      }
      return parseFloat(next.toFixed(2));
    });
  };

  const focusOnZone = (zone: 'A' | 'B' | 'C' | 'D' | 'Full') => {
    if (zone === 'Full') {
      handleResetZoom();
    } else if (zone === 'A') {
      setZoom(1.8);
      setPan({ x: -180, y: 0 });
      setSelectedZone('Zone A');
    } else if (zone === 'B') {
      setZoom(1.8);
      setPan({ x: 0, y: 180 });
      setSelectedZone('Zone B');
    } else if (zone === 'C') {
      setZoom(1.8);
      setPan({ x: 0, y: -180 });
      setSelectedZone('Zone C');
    } else if (zone === 'D') {
      setZoom(1.8);
      setPan({ x: 180, y: 0 });
      setSelectedZone('Zone D');
    }
  };

  // Calculate dynamic crowd level and heat score for each zone based on active incidents from API
  const getZoneCrowdStats = (zoneId: string) => {
    const zoneIncidents = (activeIncidents || []).filter(inc => 
      inc.status === 'active' && 
      inc.zone && 
      inc.zone.toLowerCase().includes(zoneId.toLowerCase())
    );

    let score = 0;
    let hasCrowdKeyword = false;

    zoneIncidents.forEach(inc => {
      // Base score by severity
      if (inc.severity === 'high') score += 4;
      else if (inc.severity === 'medium') score += 2;
      else score += 1;

      // Check keywords
      const textToSearch = `${inc.title} ${inc.description}`.toLowerCase();
      const crowdKeywords = ['crowd', 'congestion', 'congested', 'bottleneck', 'slowdown', 'backing up', 'queue', 'delay', 'traffic', 'lines', 'gate', 'overcrowded', 'blocked'];
      const matchesKeyword = crowdKeywords.some(keyword => textToSearch.includes(keyword));
      
      if (matchesKeyword) {
        score += 3;
        hasCrowdKeyword = true;
      }
    });

    // Determine crowd density level and color profile
    let level: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let label = 'Low Density';
    let color = '#10b981'; // green

    if (score > 6) {
      level = 'critical';
      label = 'Critical Congestion';
      color = '#ef4444'; // red
    } else if (score >= 3) {
      level = 'high';
      label = 'Heavy Crowd';
      color = '#f97316'; // orange
    } else if (score > 0) {
      level = 'medium';
      label = 'Moderate Flow';
      color = '#eab308'; // yellow
    }

    return {
      score,
      level,
      label,
      color,
      incidentsCount: zoneIncidents.length,
      hasCrowdKeyword
    };
  };

  const zoneAStats = getZoneCrowdStats('Zone A');
  const zoneBStats = getZoneCrowdStats('Zone B');
  const zoneCStats = getZoneCrowdStats('Zone C');
  const zoneDStats = getZoneCrowdStats('Zone D');

  // Helper to query active emergency incidents in a given zone
  const getZoneEmergencyIncidents = (zoneId: string) => {
    return (activeIncidents || []).filter(inc => {
      const isZoneMatch = inc.zone && inc.zone.toLowerCase().includes(zoneId.toLowerCase());
      const isActive = inc.status === 'active';
      // Emergency is defined as high severity, or medical/security types
      const isEmergency = inc.severity === 'high' || inc.type === 'medical' || inc.type === 'security';
      return isZoneMatch && isActive && isEmergency;
    });
  };

  const zoneAEmergencies = getZoneEmergencyIncidents('Zone A');
  const zoneBEmergencies = getZoneEmergencyIncidents('Zone B');
  const zoneCEmergencies = getZoneEmergencyIncidents('Zone C');
  const zoneDEmergencies = getZoneEmergencyIncidents('Zone D');

  const allActiveEmergencies = (activeIncidents || []).filter(inc => {
    const isActive = inc.status === 'active';
    const isEmergency = inc.severity === 'high' || inc.type === 'medical' || inc.type === 'security';
    return isActive && isEmergency;
  });

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
          <button 
            onClick={() => setShowApiHeatmap(!showApiHeatmap)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
              showApiHeatmap 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.1)] font-semibold' 
                : 'bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10'
            }`}
          >
            <Flame size={13} className={showApiHeatmap ? "text-amber-400 animate-pulse" : "text-white/40"} /> Heatmap Layer
          </button>
        </div>
      </div>
 
      {/* SVG Interactive Map */}
      <div className="flex-1 flex items-center justify-center relative min-h-[340px] md:min-h-[420px] bg-white/5 rounded-xl border border-white/10 p-2 overflow-hidden">
        <svg 
          viewBox="0 0 500 500" 
          className={`w-full max-w-[440px] h-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] select-none transition-shadow duration-300 ${
            zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
          }`}
          style={{ transform: 'translate3d(0,0,0)', touchAction: 'none' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
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

            {/* API Crowd Heatmap Gradients */}
            <radialGradient id="api-green-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="api-yellow-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="api-orange-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="api-red-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.65" />
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

          {/* Zoomable & Pannable Stadium Wrapper */}
          <g 
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '250px 250px',
              transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >

          {/* Outer Ring road / Outer wall */}
          <circle cx="250" cy="250" r="235" fill="none" stroke="#1e293b" strokeWidth="2" strokeDasharray="6,4" />
          <circle cx="250" cy="250" r="225" fill="none" stroke="#334155" strokeWidth="1" />

          {/* Stadium Inner Concourse Ring */}
          <circle cx="250" cy="250" r="175" fill="none" stroke="#1e293b" strokeWidth="2" />
          
          {/* Interactive Sectors/Zones (divided into 4 arcs) */}
          {/* East Sector: Zone A */}
          <path 
            d="M 250,250 L 373,127 A 175,175 0 0,1 373,373 Z" 
            fill={zoneAEmergencies.length > 0 ? 'rgba(239, 68, 68, 0.25)' : (selectedZone === 'Zone A' ? 'rgba(245, 158, 11, 0.12)' : 'transparent')} 
            stroke={zoneAEmergencies.length > 0 ? '#ef4444' : (selectedZone === 'Zone A' ? '#f59e0b' : '#334155')} 
            strokeWidth={zoneAEmergencies.length > 0 ? (selectedZone === 'Zone A' ? 3.5 : 2.5) : (selectedZone === 'Zone A' ? 2.5 : 1)}
            onClick={() => handleZoneClick('Zone A')}
            tabIndex={0}
            role="button"
            aria-label={`Zone A - East Stand. ${zoneAEmergencies.length > 0 ? 'WARNING: ACTIVE EMERGENCY!' : ''} Click or press Enter to filter incident dispatch list by Zone A.`}
            aria-pressed={selectedZone === 'Zone A'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleZoneClick('Zone A');
              }
            }}
            className={`cursor-pointer transition-all duration-300 focus:outline-none focus:stroke-white focus:stroke-[2.5] ${
              zoneAEmergencies.length > 0 ? 'emergency-active fill-red-500/20 stroke-red-500' : 'hover:fill-amber-500/5'
            }`}
          />
          
          {/* North Sector: Zone B */}
          <path 
            d="M 250,250 L 127,127 A 175,175 0 0,1 373,127 Z" 
            fill={zoneBEmergencies.length > 0 ? 'rgba(239, 68, 68, 0.25)' : (selectedZone === 'Zone B' ? 'rgba(139, 92, 246, 0.12)' : 'transparent')} 
            stroke={zoneBEmergencies.length > 0 ? '#ef4444' : (selectedZone === 'Zone B' ? '#8b5cf6' : '#334155')} 
            strokeWidth={zoneBEmergencies.length > 0 ? (selectedZone === 'Zone B' ? 3.5 : 2.5) : (selectedZone === 'Zone B' ? 2.5 : 1)}
            onClick={() => handleZoneClick('Zone B')}
            tabIndex={0}
            role="button"
            aria-label={`Zone B - North Stand. ${zoneBEmergencies.length > 0 ? 'WARNING: ACTIVE EMERGENCY!' : ''} Click or press Enter to filter incident dispatch list by Zone B.`}
            aria-pressed={selectedZone === 'Zone B'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleZoneClick('Zone B');
              }
            }}
            className={`cursor-pointer transition-all duration-300 focus:outline-none focus:stroke-white focus:stroke-[2.5] ${
              zoneBEmergencies.length > 0 ? 'emergency-active fill-red-500/20 stroke-red-500' : 'hover:fill-purple-500/5'
            }`}
          />
 
          {/* South Sector: Zone C */}
          <path 
            d="M 250,250 L 373,373 A 175,175 0 0,1 127,373 Z" 
            fill={zoneCEmergencies.length > 0 ? 'rgba(239, 68, 68, 0.25)' : (selectedZone === 'Zone C' ? 'rgba(59, 130, 246, 0.12)' : 'transparent')} 
            stroke={zoneCEmergencies.length > 0 ? '#ef4444' : (selectedZone === 'Zone C' ? '#3b82f6' : '#334155')} 
            strokeWidth={zoneCEmergencies.length > 0 ? (selectedZone === 'Zone C' ? 3.5 : 2.5) : (selectedZone === 'Zone C' ? 2.5 : 1)}
            onClick={() => handleZoneClick('Zone C')}
            tabIndex={0}
            role="button"
            aria-label={`Zone C - South Stand. ${zoneCEmergencies.length > 0 ? 'WARNING: ACTIVE EMERGENCY!' : ''} Click or press Enter to filter incident dispatch list by Zone C.`}
            aria-pressed={selectedZone === 'Zone C'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleZoneClick('Zone C');
              }
            }}
            className={`cursor-pointer transition-all duration-300 focus:outline-none focus:stroke-white focus:stroke-[2.5] ${
              zoneCEmergencies.length > 0 ? 'emergency-active fill-red-500/20 stroke-red-500' : 'hover:fill-blue-500/5'
            }`}
          />
 
          {/* West Sector: Zone D */}
          <path 
            d="M 250,250 L 127,373 A 175,175 0 0,1 127,127 Z" 
            fill={zoneDEmergencies.length > 0 ? 'rgba(239, 68, 68, 0.25)' : (selectedZone === 'Zone D' ? 'rgba(16, 185, 129, 0.12)' : 'transparent')} 
            stroke={zoneDEmergencies.length > 0 ? '#ef4444' : (selectedZone === 'Zone D' ? '#10b981' : '#334155')} 
            strokeWidth={zoneDEmergencies.length > 0 ? (selectedZone === 'Zone D' ? 3.5 : 2.5) : (selectedZone === 'Zone D' ? 2.5 : 1)}
            onClick={() => handleZoneClick('Zone D')}
            tabIndex={0}
            role="button"
            aria-label={`Zone D - West Stand. ${zoneDEmergencies.length > 0 ? 'WARNING: ACTIVE EMERGENCY!' : ''} Click or press Enter to filter incident dispatch list by Zone D.`}
            aria-pressed={selectedZone === 'Zone D'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleZoneClick('Zone D');
              }
            }}
            className={`cursor-pointer transition-all duration-300 focus:outline-none focus:stroke-white focus:stroke-[2.5] ${
              zoneDEmergencies.length > 0 ? 'emergency-active fill-red-500/20 stroke-red-500' : 'hover:fill-emerald-500/5'
            }`}
          />
 
          {/* Emergency overlay highlight layer */}
          <g id="emergency-zone-highlights" pointerEvents="none">
            {zoneAEmergencies.length > 0 && (
              <>
                <circle cx="360" cy="250" r="85" fill="url(#api-red-glow)" />
                <circle cx="360" cy="250" r="25" fill="none" stroke="#ef4444" strokeWidth="2.5" className="animate-ping" style={{ transformOrigin: '360px 250px' }} />
              </>
            )}
            {zoneBEmergencies.length > 0 && (
              <>
                <circle cx="250" cy="120" r="85" fill="url(#api-red-glow)" />
                <circle cx="250" cy="120" r="25" fill="none" stroke="#ef4444" strokeWidth="2.5" className="animate-ping" style={{ transformOrigin: '250px 120px' }} />
              </>
            )}
            {zoneCEmergencies.length > 0 && (
              <>
                <circle cx="250" cy="380" r="85" fill="url(#api-red-glow)" />
                <circle cx="250" cy="380" r="25" fill="none" stroke="#ef4444" strokeWidth="2.5" className="animate-ping" style={{ transformOrigin: '250px 380px' }} />
              </>
            )}
            {zoneDEmergencies.length > 0 && (
              <>
                <circle cx="140" cy="250" r="85" fill="url(#api-red-glow)" />
                <circle cx="140" cy="250" r="25" fill="none" stroke="#ef4444" strokeWidth="2.5" className="animate-ping" style={{ transformOrigin: '140px 250px' }} />
              </>
            )}
          </g>

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

          {/* Dynamic API Incidents Crowd Heatmap Layer */}
          {showApiHeatmap && (
            <g id="api-crowd-heatmap-layer">
              {/* Zone A Glow */}
              {zoneAStats.score > 0 && (
                <>
                  <circle cx="360" cy="250" r={45 + zoneAStats.score * 5} fill={`url(#api-${zoneAStats.level === 'critical' ? 'red' : zoneAStats.level === 'high' ? 'orange' : 'yellow'}-glow)`} pointerEvents="none" />
                  {zoneAStats.level === 'critical' && (
                    <circle cx="360" cy="250" r="20" fill="none" stroke="#ef4444" strokeWidth="2" className="animate-ping" style={{ transformOrigin: '360px 250px' }} />
                  )}
                </>
              )}
              {/* Zone B Glow */}
              {zoneBStats.score > 0 && (
                <>
                  <circle cx="250" cy="120" r={45 + zoneBStats.score * 5} fill={`url(#api-${zoneBStats.level === 'critical' ? 'red' : zoneBStats.level === 'high' ? 'orange' : 'yellow'}-glow)`} pointerEvents="none" />
                  {zoneBStats.level === 'critical' && (
                    <circle cx="250" cy="120" r="20" fill="none" stroke="#ef4444" strokeWidth="2" className="animate-ping" style={{ transformOrigin: '250px 120px' }} />
                  )}
                </>
              )}
              {/* Zone C Glow */}
              {zoneCStats.score > 0 && (
                <>
                  <circle cx="250" cy="380" r={45 + zoneCStats.score * 5} fill={`url(#api-${zoneCStats.level === 'critical' ? 'red' : zoneCStats.level === 'high' ? 'orange' : 'yellow'}-glow)`} pointerEvents="none" />
                  {zoneCStats.level === 'critical' && (
                    <circle cx="250" cy="380" r="20" fill="none" stroke="#ef4444" strokeWidth="2" className="animate-ping" style={{ transformOrigin: '250px 380px' }} />
                  )}
                </>
              )}
              {/* Zone D Glow */}
              {zoneDStats.score > 0 && (
                <>
                  <circle cx="140" cy="250" r={45 + zoneDStats.score * 5} fill={`url(#api-${zoneDStats.level === 'critical' ? 'red' : zoneDStats.level === 'high' ? 'orange' : 'yellow'}-glow)`} pointerEvents="none" />
                  {zoneDStats.level === 'critical' && (
                    <circle cx="140" cy="250" r="20" fill="none" stroke="#ef4444" strokeWidth="2" className="animate-ping" style={{ transformOrigin: '140px 250px' }} />
                  )}
                </>
              )}
            </g>
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
                tabIndex={0}
                role="button"
                aria-label={`${poi.label}: ${poi.info}. Press Enter to select corresponding zone.`}
                className="cursor-pointer group focus:outline-none"
                onClick={() => {
                  setHoveredElement(poi.label + " | " + poi.info);
                  if (poi.id === 'gate3') setSelectedZone('Zone B');
                  if (poi.id === 'gate1') setSelectedZone('Zone A');
                  if (poi.id === 'gate5') setSelectedZone('Zone C');
                  if (poi.id === 'gate7') setSelectedZone('Zone D');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setHoveredElement(poi.label + " | " + poi.info);
                    if (poi.id === 'gate3') setSelectedZone('Zone B');
                    if (poi.id === 'gate1') setSelectedZone('Zone A');
                    if (poi.id === 'gate5') setSelectedZone('Zone C');
                    if (poi.id === 'gate7') setSelectedZone('Zone D');
                  }
                }}
                onMouseEnter={() => setHoveredElement(poi.label + " - " + poi.info)}
                onMouseLeave={() => setHoveredElement(null)}
                onFocus={() => setHoveredElement(poi.label + " - " + poi.info)}
                onBlur={() => setHoveredElement(null)}
              >
                {/* Outer hover ring */}
                <circle 
                  cx={poi.x} 
                  cy={poi.y} 
                  r="11" 
                  fill="none" 
                  stroke={pColor} 
                  strokeWidth="1.5" 
                  className="opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-300 transform scale-125" 
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

          {/* Labels for Zones with Dynamic Crowd Level Indicators */}
          <g>
            <text x="375" y="250" fill="#ffffff" opacity={showApiHeatmap && zoneAStats.score > 0 ? "0.85" : "0.25"} fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">ZONE A</text>
            {showApiHeatmap && zoneAStats.score > 0 && (
              <text x="375" y="265" fill={zoneAStats.color} fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace" className="animate-pulse">{zoneAStats.label.toUpperCase()}</text>
            )}
          </g>
          <g>
            <text x="250" y="110" fill="#ffffff" opacity={showApiHeatmap && zoneBStats.score > 0 ? "0.85" : "0.25"} fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">ZONE B</text>
            {showApiHeatmap && zoneBStats.score > 0 && (
              <text x="250" y="125" fill={zoneBStats.color} fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace" className="animate-pulse">{zoneBStats.label.toUpperCase()}</text>
            )}
          </g>
          <g>
            <text x="250" y="395" fill="#ffffff" opacity={showApiHeatmap && zoneCStats.score > 0 ? "0.85" : "0.25"} fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">ZONE C</text>
            {showApiHeatmap && zoneCStats.score > 0 && (
              <text x="250" y="410" fill={zoneCStats.color} fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace" className="animate-pulse">{zoneCStats.label.toUpperCase()}</text>
            )}
          </g>
          <g>
            <text x="125" y="250" fill="#ffffff" opacity={showApiHeatmap && zoneDStats.score > 0 ? "0.85" : "0.25"} fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">ZONE D</text>
            {showApiHeatmap && zoneDStats.score > 0 && (
              <text x="125" y="265" fill={zoneDStats.color} fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace" className="animate-pulse">{zoneDStats.label.toUpperCase()}</text>
            )}
          </g>
          </g>
        </svg>

        {/* Dynamic API Crowd Heatmap Legend */}
        {showApiHeatmap && (
          <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md border border-white/10 rounded-xl p-2.5 shadow-xl text-[10px] text-slate-300 z-20 flex flex-col gap-1.5 font-mono">
            <span className="font-bold text-white uppercase text-[9px] tracking-wider mb-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              API Heat Legend
            </span>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] border border-white/20"></div>
              <span>Critical Congestion</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#f97316] border border-white/20"></div>
              <span>Heavy Crowd</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#eab308] border border-white/20"></div>
              <span>Moderate Flow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] border border-white/20"></div>
              <span>Low Density</span>
            </div>
          </div>
        )}

        {/* Zoom & Pan Control Floating HUD */}
        <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-md border border-white/10 rounded-xl p-2.5 shadow-xl flex flex-col gap-2.5 z-20 w-40 sm:w-44 select-none text-slate-300">
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-white uppercase text-[9px] tracking-wider font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              View Controls
            </span>
            <div className="h-px bg-white/10 my-0.5"></div>
          </div>

          {/* Zoom Actions & Slider */}
          <div className="flex flex-col gap-1.5 bg-white/5 border border-white/5 rounded-lg p-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[7.5px] font-mono text-slate-400 uppercase tracking-wider font-bold">Zoom Scale</span>
              <span className="text-[10px] font-mono font-bold text-blue-400">
                {zoom.toFixed(2)}x
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 1}
                className="p-1 rounded bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={11} />
              </button>
              <input
                type="range"
                min="1"
                max="4"
                step="0.05"
                value={zoom}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setZoom(val);
                  if (val === 1) {
                    setPan({ x: 0, y: 0 });
                  }
                }}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
                style={{ background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(zoom - 1) / 3 * 100}%, #334155 ${(zoom - 1) / 3 * 100}%, #334155 100%)` }}
              />
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 4}
                className="p-1 rounded bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={11} />
              </button>
            </div>
            <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 border-t border-white/5 pt-1 mt-0.5">
              <span>Min: 1x</span>
              <button
                onClick={handleResetZoom}
                className="px-1 py-0.2 rounded bg-white/10 border border-white/10 text-white hover:bg-white/20 active:bg-white/30 transition-all text-[8px]"
                title="Reset view back to 1.0x scale"
              >
                Reset
              </button>
              <span>Max: 4x</span>
            </div>
          </div>

          {/* Zoom Sensitivity Slider */}
          <div className="flex flex-col gap-1.5 bg-white/5 border border-white/5 rounded-lg p-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[7.5px] font-mono text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1">
                <Sliders size={8} className="text-blue-400" /> Sensitivity
              </span>
              <span className="text-[10px] font-mono font-bold text-blue-400">
                {zoomSensitivity.toFixed(1)}x
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                id="zoom-sensitivity-slider"
                type="range"
                min="0.2"
                max="2.0"
                step="0.1"
                value={zoomSensitivity}
                onChange={(e) => setZoomSensitivity(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
                style={{ background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(zoomSensitivity - 0.2) / 1.8 * 100}%, #334155 ${(zoomSensitivity - 0.2) / 1.8 * 100}%, #334155 100%)` }}
              />
            </div>
            <div className="flex items-center justify-between text-[7px] font-mono text-slate-400 border-t border-white/5 pt-1 mt-0.5">
              <span>Fine (0.2x)</span>
              <button
                onClick={() => setZoomSensitivity(1.0)}
                className="px-1 py-0.2 rounded bg-white/10 border border-white/10 text-white hover:bg-white/20 active:bg-white/30 transition-all text-[7px]"
                title="Reset sensitivity to 1.0x default"
              >
                Reset
              </button>
              <span>Coarse (2.0x)</span>
            </div>
          </div>

          {/* Pan Navigation D-Pad */}
          <div className="flex flex-col items-center gap-1 bg-white/5 border border-white/5 rounded-lg p-1">
            <span className="text-[7px] font-mono text-slate-400 uppercase tracking-widest">Manual Pan</span>
            <div className="relative w-16 h-16 flex items-center justify-center">
              {/* Up */}
              <button
                onClick={() => handlePan('up')}
                className="absolute top-0 p-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
                title="Pan Up"
              >
                <ChevronUp size={11} />
              </button>
              {/* Left */}
              <button
                onClick={() => handlePan('left')}
                className="absolute left-0 p-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
                title="Pan Left"
              >
                <ChevronLeft size={11} />
              </button>
              {/* Reset inside Center */}
              <button
                onClick={handleResetZoom}
                className="p-0.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 hover:text-blue-300 transition-all text-[8px] font-mono font-bold"
                title="Reset View"
              >
                RST
              </button>
              {/* Right */}
              <button
                onClick={() => handlePan('right')}
                className="absolute right-0 p-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
                title="Pan Right"
              >
                <ChevronRight size={11} />
              </button>
              {/* Down */}
              <button
                onClick={() => handlePan('down')}
                className="absolute bottom-0 p-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
                title="Pan Down"
              >
                <ChevronDown size={11} />
              </button>
            </div>
          </div>

          {/* Quick Focus Sectors */}
          <div className="flex flex-col gap-1">
            <span className="text-[7px] font-mono text-slate-400 uppercase tracking-widest text-center">Focus Area</span>
            <div className="grid grid-cols-5 gap-0.5">
              {['A', 'B', 'C', 'D'].map(z => (
                <button
                  key={z}
                  onClick={() => focusOnZone(z as 'A' | 'B' | 'C' | 'D')}
                  className={`py-0.5 rounded text-[9px] font-mono border transition-all cursor-pointer ${
                    selectedZone === `Zone ${z}` && zoom > 1
                      ? 'bg-blue-500 text-white font-bold border-blue-400 shadow-sm shadow-blue-500/20'
                      : 'bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {z}
                </button>
              ))}
              <button
                onClick={() => focusOnZone('Full')}
                className={`py-0.5 rounded text-[8px] font-mono border transition-all cursor-pointer ${
                  zoom === 1
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border-emerald-500/30'
                    : 'bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10'
                }`}
                title="Full Stadium View"
              >
                ALL
              </button>
            </div>
          </div>
        </div>

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

        {/* Active Emergency Notifications Overlay */}
        {allActiveEmergencies.length > 0 && (
          <div className="absolute top-16 left-3 right-3 sm:right-auto sm:w-72 md:w-80 bg-red-950/85 backdrop-blur-md border border-red-500/30 rounded-xl p-2.5 shadow-2xl z-20 flex flex-col gap-2 max-h-[220px] overflow-hidden">
            <div className="flex items-center justify-between border-b border-red-500/20 pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="font-bold text-white text-[10px] uppercase font-mono tracking-wider">
                  ⚠️ Zone Emergencies ({allActiveEmergencies.length})
                </span>
              </div>
              <span className="text-[8px] font-mono bg-red-500/20 text-red-300 px-1 py-0.2 rounded font-bold uppercase tracking-widest border border-red-500/20 animate-pulse">
                Critical Alert
              </span>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-red-500/20">
              {allActiveEmergencies.map(inc => {
                const zoneCode = inc.zone?.toUpperCase().includes('ZONE A') ? 'A' : 
                                 inc.zone?.toUpperCase().includes('ZONE B') ? 'B' : 
                                 inc.zone?.toUpperCase().includes('ZONE C') ? 'C' : 
                                 inc.zone?.toUpperCase().includes('ZONE D') ? 'D' : '';
                return (
                  <div key={inc.id} className="bg-red-500/5 border border-red-500/10 rounded-lg p-2 flex flex-col gap-1 hover:bg-red-500/10 transition-all">
                    <div className="flex items-start justify-between gap-1.5">
                      <div>
                        <h4 className="font-semibold text-white text-xs leading-tight font-sans flex items-center gap-1">
                          {inc.type === 'medical' ? '🚑' : '🚨'} {inc.title}
                        </h4>
                        <span className="text-[9px] font-mono text-red-400 font-bold block mt-0.5">
                          {inc.zone}
                        </span>
                      </div>
                      <span className="text-[8px] font-mono bg-red-900/30 text-red-300 border border-red-500/20 px-1 py-0.2 rounded uppercase shrink-0 font-bold">
                        {inc.severity}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[10px] leading-snug line-clamp-2 mt-0.5">
                      {inc.description}
                    </p>
                    {zoneCode && (
                      <button
                        onClick={() => {
                          focusOnZone(zoneCode as 'A' | 'B' | 'C' | 'D');
                        }}
                        className="mt-1.5 py-1 px-2 rounded bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-mono font-bold text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm border border-red-400/20"
                      >
                        <ShieldAlert size={10} /> Focus Sector {zoneCode}
                      </button>
                    )}
                  </div>
                );
              })}
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
        @keyframes emergency-pulse {
          0% {
            fill: rgba(239, 68, 68, 0.15);
            stroke: #ef4444;
            stroke-width: 2.5px;
          }
          50% {
            fill: rgba(239, 68, 68, 0.35);
            stroke: #dc2626;
            stroke-width: 4px;
          }
          100% {
            fill: rgba(239, 68, 68, 0.15);
            stroke: #ef4444;
            stroke-width: 2.5px;
          }
        }
        .emergency-active {
          animation: emergency-pulse 1.6s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
