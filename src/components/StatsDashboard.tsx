import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Trash2, 
  Compass, 
  CheckCircle2, 
  AlertOctagon, 
  Sparkles, 
  Loader2, 
  Bus, 
  ArrowRight,
  Shield,
  FileText,
  Bookmark,
  TrendingUp,
  CloudLightning
} from 'lucide-react';
import { Incident, TransportStatus } from '../types';

interface StatsDashboardProps {
  incidents: Incident[];
  onIncidentResolved: () => void;
  selectedZone: string;
}

export default function StatsDashboard({
  incidents,
  onIncidentResolved,
  selectedZone
}: StatsDashboardProps) {
  // Global states
  const [metrics, setMetrics] = useState({
    attendance: 74850,
    capacity: 80000,
    activeStaff: 340,
    activeVolunteers: 650,
    sustainabilityScore: 88,
    totalWasteRecycledKg: 4320,
    totalWaterSavedLiters: 12450
  });

  const [transports, setTransports] = useState<TransportStatus[]>([]);
  const [isCompilingSummary, setIsCompilingSummary] = useState(false);
  const [operationsSummary, setOperationsSummary] = useState<string | null>(null);
  const [editingTransportIndex, setEditingTransportIndex] = useState<number | null>(null);
  const [tempMins, setTempMins] = useState<number>(0);
  const [tempStatus, setTempStatus] = useState<'normal' | 'delayed' | 'crowded'>('normal');

  // Load and refresh state values
  useEffect(() => {
    fetchMetrics();
    fetchTransports();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error("Error loading metrics:", err);
    }
  };

  const fetchTransports = async () => {
    try {
      const res = await fetch('/api/transport');
      if (res.ok) {
        const data = await res.json();
        setTransports(data);
      }
    } catch (err) {
      console.error("Error loading transports:", err);
    }
  };

  const handleResolveIncident = async (id: string) => {
    try {
      const res = await fetch(`/api/incidents/${id}/resolve`, {
        method: 'POST'
      });
      if (res.ok) {
        onIncidentResolved();
      }
    } catch (err) {
      console.error("Failed to resolve incident:", err);
    }
  };

  const handleUpdateTransport = async (idx: number) => {
    try {
      const res = await fetch('/api/transport/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          index: idx,
          status: tempStatus,
          minutesToArrival: tempMins
        })
      });
      if (res.ok) {
        setEditingTransportIndex(null);
        fetchTransports();
      }
    } catch (err) {
      console.error("Failed to update transit line:", err);
    }
  };

  const handleGenerateSummary = async () => {
    setIsCompilingSummary(true);
    setOperationsSummary(null);
    try {
      const res = await fetch('/api/generate-summary', {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setOperationsSummary(data.report);
      }
    } catch (err) {
      console.error("Failed to compile operations report:", err);
      setOperationsSummary("Failed to communicate with operations intelligence engine.");
    } finally {
      setIsCompilingSummary(false);
    }
  };

  // Custom light-weight markdown parser to avoid external library conflicts and render beautifully
  const renderSummaryMarkdown = (md: string) => {
    if (!md) return null;
    const lines = md.split('\n');
    return (
      <div className="space-y-2.5 font-sans leading-relaxed text-slate-300 text-xs text-justify">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('## ')) {
            return (
              <h4 key={idx} className="text-xs font-display font-bold text-blue-400 mt-4 mb-2 tracking-wider flex items-center gap-1.5 uppercase font-mono border-b border-slate-900 pb-1">
                <Shield size={13} className="text-blue-500" /> {trimmed.replace('## ', '')}
              </h4>
            );
          }
          if (trimmed.startsWith('### ')) {
            return (
              <h5 key={idx} className="text-[11px] font-semibold text-slate-200 mt-3 mb-1 flex items-center gap-1">
                <Bookmark size={11} className="text-indigo-400" /> {trimmed.replace('### ', '')}
              </h5>
            );
          }
          if (trimmed.startsWith('|') || trimmed.startsWith('+-')) {
            // Very simple table matching indicator
            return (
              <div key={idx} className="font-mono text-[10px] bg-slate-950/80 px-2 py-1.5 rounded text-indigo-300 leading-tight border border-slate-900/60 my-1 overflow-x-auto whitespace-pre">
                {trimmed}
              </div>
            );
          }
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const rawContent = trimmed.replace(/^[-*]\s+/, '');
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-3.5 my-1 text-[11px]">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-1.5 shrink-0" />
                <span>{rawContent.split('**').map((chunk, i) => i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{chunk}</strong> : chunk)}</span>
              </div>
            );
          }
          if (!trimmed) return <div key={idx} className="h-1" />;
          return (
            <p key={idx} className="text-[11px] leading-relaxed pl-1 text-slate-400">
              {trimmed.split('**').map((chunk, i) => i % 2 === 1 ? <strong key={i} className="text-indigo-300 font-semibold">{chunk}</strong> : chunk)}
            </p>
          );
        })}
      </div>
    );
  };

  // Filter incidents based on selectedZone
  const filteredIncidents = selectedZone 
    ? incidents.filter(i => i.zone.includes(selectedZone))
    : incidents;

  return (
    <div className="space-y-5">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Attendance widget */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden">
          <div className="z-10">
            <span className="text-[9px] font-mono tracking-wider text-white/50 uppercase block mb-1">TOTAL ATTENDANCE</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-display font-bold text-white">{metrics.attendance.toLocaleString()}</span>
              <span className="text-white/40 text-[10px]">/ {metrics.capacity.toLocaleString()}</span>
            </div>
            <div className="w-24 bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${(metrics.attendance / metrics.capacity) * 100}%` }}
              />
            </div>
          </div>
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
            <Users size={18} />
          </div>
        </div>

        {/* Staff Deployed */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden">
          <div className="z-10">
            <span className="text-[9px] font-mono tracking-wider text-white/50 uppercase block mb-1">DEPLAYED STAFF & VOLS</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-display font-bold text-white">{(metrics.activeStaff + metrics.activeVolunteers).toLocaleString()}</span>
              <span className="text-white/40 text-[10px]">Active</span>
            </div>
            <span className="text-[10px] text-white/55 block mt-2 font-mono">{metrics.activeVolunteers} Vols | {metrics.activeStaff} Staff</span>
          </div>
          <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
            <Compass size={18} />
          </div>
        </div>

        {/* Sustainability index */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden">
          <div className="z-10">
            <span className="text-[9px] font-mono tracking-wider text-white/50 uppercase block mb-1">GREEN SORTING INDEX</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-display font-bold text-emerald-400">{metrics.sustainabilityScore}%</span>
              <span className="text-white/40 text-[9px]">Eco KPI</span>
            </div>
            <span className="text-[10px] text-white/55 block mt-2 font-mono">{(metrics.totalWasteRecycledKg / 1000).toFixed(1)} Tons sorted</span>
          </div>
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Trash2 size={18} />
          </div>
        </div>

        {/* Total Active Incidents */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden">
          <div className="z-10">
            <span className="text-[9px] font-mono tracking-wider text-white/50 uppercase block mb-1">ACTIVE ASSISTS LOG</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-display font-bold text-red-400">
                {incidents.filter(i => i.status === 'active').length}
              </span>
              <span className="text-white/40 text-[10px]">Critical alerts</span>
            </div>
            <span className="text-[10px] text-white/55 block mt-2 font-mono">
              {incidents.filter(i => i.status === 'resolved').length} Assists resolved
            </span>
          </div>
          <div className="p-2.5 bg-red-500/10 rounded-xl text-red-400">
            <AlertOctagon size={18} />
          </div>
        </div>
      </div>

      {/* Main Split Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Side: Real-time Incidents Logs Board (7/12 width) */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5 shadow-2xl lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-blue-400 font-bold uppercase block">INCIDENT DISPATCH COORDINATOR</span>
                <h3 className="text-sm font-display font-bold text-white flex items-center gap-1.5">
                  Assists Log {selectedZone && <span className="bg-blue-500/20 text-blue-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-blue-400/30">Filtered: {selectedZone}</span>}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-white/40">{filteredIncidents.length} Event records</span>
            </div>

            {filteredIncidents.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                <CheckCircle2 className="text-emerald-400/80" size={32} />
                <p className="text-white/80 font-semibold text-sm">Zone Operating Securely</p>
                <p className="text-white/40 text-xs max-w-xs">All tasks, medical, and concession alerts are resolved. Monitor live map for queue sensors.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[310px] overflow-y-auto dark-scrollbar pr-1">
                {filteredIncidents.map((inc) => {
                  let badgeStyle = 'bg-white/5 text-white/50 border-white/10';
                  let severityBadge = 'bg-white/5 text-white/40 border-white/10';
                  
                  if (inc.type === 'medical') badgeStyle = 'bg-red-500/20 text-red-400 border-red-500/30';
                  if (inc.type === 'security') badgeStyle = 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
                  if (inc.type === 'sustainability') badgeStyle = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
                  if (inc.type === 'lost_found') badgeStyle = 'bg-amber-500/20 text-amber-400 border-amber-500/30';

                  if (inc.severity === 'high') severityBadge = 'bg-red-500/30 text-red-300 border border-red-500/40';
                  if (inc.severity === 'medium') severityBadge = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
                  if (inc.severity === 'low') severityBadge = 'bg-white/5 text-white/40 border border-white/10';

                  const isActive = inc.status === 'active';

                  return (
                    <div 
                      key={inc.id}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all ${
                        isActive 
                          ? 'bg-white/5 border-white/10 hover:border-white/20' 
                          : 'bg-white/5 border-transparent opacity-40'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full border font-mono font-bold uppercase ${badgeStyle}`}>
                            {inc.type.replace('_', ' ')}
                          </span>
                          <span className={`text-[8px] px-1.5 py-0.2 rounded font-mono ${severityBadge}`}>
                            {inc.severity.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-white/60 font-mono font-semibold">
                            {inc.zone}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-white font-sans">{inc.title}</h4>
                        <p className="text-white/60 text-[11px] leading-relaxed line-clamp-2">{inc.description}</p>
                        <span className="text-[9px] text-white/30 block font-mono">Reported: {new Date(inc.timestamp).toLocaleTimeString()}</span>
                      </div>

                      {isActive ? (
                        <button
                          onClick={() => handleResolveIncident(inc.id)}
                          className="px-2.5 py-1 text-[11px] font-mono rounded bg-blue-500 hover:bg-blue-400 text-white font-bold transition-all shrink-0"
                        >
                          Resolve Assist
                        </button>
                      ) : (
                        <span className="text-emerald-400 text-[10px] font-mono flex items-center gap-1">
                          ✓ Resolved
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Transportation simulation */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <span className="text-[9px] font-mono tracking-widest text-white/40 font-bold uppercase block mb-2">INTELLIGENT TRANSPORTATION LINK</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {transports.map((t, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-white/80 font-semibold block">{t.line}</span>
                    <span className="text-[9px] text-white/40 font-mono block">To: {t.destination}</span>
                    <div className="flex gap-1.5 items-center mt-1">
                      <span className={`text-[9px] font-mono px-1.5 rounded-full ${
                        t.status === 'normal' ? 'bg-emerald-500/20 text-emerald-400' :
                        t.status === 'crowded' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {t.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {editingTransportIndex === idx ? (
                    <div className="flex flex-col gap-1 items-end">
                      <select 
                        value={tempStatus} 
                        onChange={(e: any) => setTempStatus(e.target.value)}
                        className="bg-[#050B18] border border-white/10 text-[9px] text-white p-1 rounded focus:outline-none"
                      >
                        <option value="normal">Normal</option>
                        <option value="delayed">Delayed</option>
                        <option value="crowded">Crowded</option>
                      </select>
                      <input 
                        type="number" 
                        value={tempMins} 
                        onChange={(e) => setTempMins(Number(e.target.value))}
                        className="w-12 bg-[#050B18] border border-white/10 text-[9px] text-white p-0.5 text-center rounded mt-1"
                      />
                      <button 
                        onClick={() => handleUpdateTransport(idx)}
                        className="text-[9px] font-bold text-blue-400 hover:text-white mt-1 uppercase"
                      >
                        Apply
                      </button>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-white block">{t.minutesToArrival} min</span>
                      <button 
                        onClick={() => {
                          setEditingTransportIndex(idx);
                          setTempMins(t.minutesToArrival);
                          setTempStatus(t.status);
                        }}
                        className="text-[9px] font-mono text-white/40 hover:text-blue-400"
                      >
                        Adjust Link
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Operations Summary compiling card (5/12 width) */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5 shadow-2xl lg:col-span-5 flex flex-col h-full justify-between">
          <div className="space-y-4">
            <div className="pb-3 border-b border-white/10">
              <span className="text-[10px] font-mono tracking-widest text-blue-400 font-bold uppercase block">AI OPERATIONAL INTELLIGENCE</span>
              <h3 className="text-sm font-display font-bold text-white flex items-center gap-1.5">
                Executive Reports Engine
              </h3>
            </div>

            <p className="text-white/60 text-xs leading-relaxed">
              Synthesize real-time IoT gate sensors, volunteer dispatch logs, active medical incidents, and transit statuses into a full operations report. Uses <strong>Gemini 3.5 Flash</strong> to compile actionable safety dispatches.
            </p>

            {isCompilingSummary ? (
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-3.5">
                <Loader2 className="text-blue-500 animate-spin" size={32} />
                <div className="space-y-1">
                  <p className="text-white font-semibold text-xs font-mono">COMPILING COGNITIVE BLUEPRINT...</p>
                  <p className="text-white/40 text-[11px] max-w-xs leading-tight">Gathering incident timelines, predicting dispersing bottleneck rates, and drafting mitigation directives...</p>
                </div>
              </div>
            ) : operationsSummary ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 max-h-[320px] overflow-y-auto dark-scrollbar shadow-inner animate-fadeIn">
                {renderSummaryMarkdown(operationsSummary)}
              </div>
            ) : (
              <div className="border border-dashed border-white/10 rounded-xl p-10 text-center flex flex-col items-center justify-center space-y-3">
                <FileText className="text-white/30" size={36} />
                <div className="space-y-1">
                  <p className="text-white/60 text-xs font-medium">No active report generated</p>
                  <p className="text-[10px] text-white/40 max-w-xs leading-snug">Click below to parse live data arrays and generate the official executive operational report.</p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 mt-4">
            <button
              onClick={handleGenerateSummary}
              disabled={isCompilingSummary}
              className="w-full bg-blue-500 hover:bg-blue-400 text-white disabled:bg-white/5 disabled:text-white/20 font-bold text-xs py-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isCompilingSummary ? (
                <>
                  <Loader2 className="animate-spin" size={13} />
                  Generating Operations Report...
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  Compile Operations Intel Summary
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
