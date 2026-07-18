import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Megaphone, 
  MessageSquare, 
  Database, 
  Map, 
  Clock, 
  Activity, 
  Wifi, 
  Sparkles,
  Accessibility,
  ExternalLink,
  X
} from 'lucide-react';
import StadiumMap from './components/StadiumMap';
import AgentPanel from './components/AgentPanel';
import StatsDashboard from './components/StatsDashboard';
import AnnouncementPanel from './components/AnnouncementPanel';
import { Incident, AgentRole } from './types';

export default function App() {
  const [activeRole, setActiveRole] = useState<AgentRole>('fan');
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [time, setTime] = useState<string>(new Date().toLocaleTimeString());
  const [accessibilityMode, setAccessibilityMode] = useState<boolean>(false);
  const [isCookieBlocked, setIsCookieBlocked] = useState<boolean>(false);
  
  // Custom screen/view states for responsive and clean toggling
  const [leftView, setLeftView] = useState<'map' | 'announcements'>('map');
  const [rightView, setRightView] = useState<'chat' | 'dashboard'>('chat');

  const fetchIncidents = async (retries = 3, delay = 1000) => {
    try {
      const res = await fetch('/api/incidents');
      if (res.ok) {
        const text = await res.text();
        if (text.trim().startsWith('<!doctype') || text.trim().startsWith('<html') || text.trim().startsWith('<')) {
          console.warn("Detected cookie protection check or HTML response instead of JSON. Setting iframe cookie warning.");
          setIsCookieBlocked(true);
          return;
        }
        try {
          const data = JSON.parse(text);
          setIncidents(data);
          setIsCookieBlocked(false);
        } catch (jsonErr) {
          console.warn("Error parsing incidents JSON:", jsonErr, "Raw response content:", text);
        }
      } else {
        console.warn("Failed to fetch incidents. Status:", res.status);
        if (retries > 0) {
          setTimeout(() => fetchIncidents(retries - 1, delay * 2), delay);
        }
      }
    } catch (err) {
      console.warn("Error fetching incidents (underlying fetch/cookie block):", err);
      setIsCookieBlocked(true);
      if (retries > 0) {
        console.log(`Retrying fetch incidents... (${retries} retries left)`);
        setTimeout(() => fetchIncidents(retries - 1, delay * 2), delay);
      }
    }
  };

  useEffect(() => {
    // Keep clock updated
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    // Initial incidents fetch
    fetchIncidents();

    // Auto-refresh incidents list every 12 seconds for real-time synchronization simulation
    const refreshTimer = setInterval(() => {
      fetchIncidents();
    }, 12000);

    return () => {
      clearInterval(timer);
      clearInterval(refreshTimer);
    };
  }, []);

  const handleIncidentResolved = () => {
    fetchIncidents();
  };

  const handleNewIncidentReported = () => {
    fetchIncidents();
    // Automatically switch view to dashboard to see the incident listed
    setRightView('dashboard');
  };

  const activeIncidentCount = incidents.filter(i => i.status === 'active').length;

  return (
    <div className="min-h-screen bg-[#050B18] text-white font-sans antialiased flex flex-col selection:bg-blue-600/30 relative overflow-hidden">
      
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#1E3A8A]/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#10B981]/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-[#F59E0B]/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Top Universal Navbar */}
      <header className="border-b border-white/10 backdrop-blur-md bg-white/5 sticky top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-400 text-white font-display font-black text-lg shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              Z
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-display font-bold tracking-tight text-white">ZoneOn AI</h1>
                <span className="bg-blue-500/20 text-blue-300 text-[10px] font-mono px-2 py-0.5 rounded-md border border-blue-400/30 font-bold uppercase">FIFA WC 2026</span>
              </div>
              <p className="text-xs text-white/50 font-mono">The GenAI Command Center for Stadium Operations</p>
            </div>
          </div>

          {/* Real-time Telemetry Indicators */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-white/70 font-mono">
            
            {/* Live Clock */}
            <div className="flex items-center gap-1.5 backdrop-blur-md bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
              <Clock size={13} className="text-white/40" />
              <span>STADIUM CLOCK: <strong className="text-white font-semibold">{time}</strong> (UTC-7)</span>
            </div>

            {/* IoT Connectivity indicator */}
            <div className="flex items-center gap-1.5 backdrop-blur-md bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
              <Wifi size={13} className="text-emerald-400 animate-pulse" />
              <span>STADIUM IoT: <strong className="text-emerald-400 font-bold">ONLINE</strong></span>
            </div>

            {/* Active dispatches telemetry */}
            <div className="flex items-center gap-1.5 backdrop-blur-md bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
              <Activity size={13} className="text-red-400" />
              <span>DISPATCHES: <strong className="text-white font-bold">{activeIncidentCount}</strong> active</span>
            </div>

            {/* Global Accessibility Mode Toggle */}
            <button 
              id="accessibility-mode-toggle"
              onClick={() => setAccessibilityMode(!accessibilityMode)}
              aria-label="Toggle Accessibility Assistive Routing"
              className={`flex items-center gap-1.5 backdrop-blur-md border px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                accessibilityMode 
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70 hover:text-white'
              }`}
            >
              <Accessibility size={13} className={accessibilityMode ? 'text-emerald-400 animate-pulse' : 'text-white/40'} />
              <span>ACCESSIBILITY: <strong className={accessibilityMode ? 'text-emerald-400' : 'text-white/80'}>{accessibilityMode ? 'ACTIVE' : 'OFF'}</strong></span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col gap-5 z-10">
        
        {/* Iframe Cookie Protection Banner */}
        {isCookieBlocked && (
          <div className="backdrop-blur-md bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-full bg-amber-500/5 blur-3xl pointer-events-none"></div>
            
            <div className="z-10 flex items-start gap-3">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg mt-0.5">
                <ShieldAlert size={18} />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-amber-400">Browser Cookie Restriction Detected</h3>
                <p className="text-[11px] text-white/80 leading-relaxed max-w-2xl">
                  Your browser is blocking secure storage cookies inside this embedded iframe. This prevents live API synchronization with the stadium backend. Please click to open the application in a new tab for full real-time capabilities.
                </p>
              </div>
            </div>

            <div className="flex gap-2 items-center shrink-0 z-10">
              <a 
                href={window.location.href} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-mono font-bold py-1.5 px-3 rounded-xl text-[11px] transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 border border-emerald-400/30"
              >
                <ExternalLink size={12} /> Open App in New Tab
              </a>
              <button 
                onClick={() => setIsCookieBlocked(false)}
                className="text-white/40 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all"
                aria-label="Dismiss banner"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Mode Switcher Bar */}
        <div id="dynamic-mode-switcher-bar" className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-full bg-blue-500/5 blur-3xl pointer-events-none"></div>
          
          <div className="z-10 space-y-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="text-blue-400" size={15} />
              <span className="text-[11px] font-mono tracking-widest text-blue-400 font-bold uppercase">FIFA World Cup 2026 Operating State</span>
            </div>
            <h2 className="text-base font-display font-bold text-white leading-tight">
              Every Zone. One AI.
            </h2>
            <p className="text-[11px] text-white/60 font-sans max-w-xl">
              ZoneOn bridges fans, operations coordinators, and security guards under a single unified intelligence hub. Choose your view mode on the widgets below to test different roles.
            </p>
          </div>

          <div className="flex gap-2 flex-wrap z-10">
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-1 flex gap-1">
              <button
                id="left-view-map-btn"
                onClick={() => setLeftView('map')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 transition-all ${
                  leftView === 'map' 
                    ? 'bg-blue-500 text-white font-bold border border-blue-400 shadow-sm' 
                    : 'text-white/50 border border-transparent hover:text-white'
                }`}
              >
                <Map size={13} /> Interactive Map
              </button>
              <button
                id="left-view-announcements-btn"
                onClick={() => setLeftView('announcements')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 transition-all ${
                  leftView === 'announcements' 
                    ? 'bg-blue-500 text-white font-bold border border-blue-400 shadow-sm' 
                    : 'text-white/50 border border-transparent hover:text-white'
                }`}
              >
                <Megaphone size={13} /> Broadcaster Panel
              </button>
            </div>

            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-1 flex gap-1">
              <button
                id="right-view-chat-btn"
                onClick={() => setRightView('chat')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 transition-all ${
                  rightView === 'chat' 
                    ? 'bg-blue-500 text-white font-bold border border-blue-400 shadow-sm' 
                    : 'text-white/50 border border-transparent hover:text-white'
                }`}
              >
                <MessageSquare size={13} /> Conversational Agent
              </button>
              <button
                id="right-view-dashboard-btn"
                onClick={() => setRightView('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 transition-all ${
                  rightView === 'dashboard' 
                    ? 'bg-blue-500 text-white font-bold border border-blue-400 shadow-sm' 
                    : 'text-white/50 border border-transparent hover:text-white'
                }`}
              >
                <Database size={13} /> Command Operations
              </button>
            </div>
          </div>

        </div>

        {/* Split Dynamic Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Left Block (Interactive Map or Broadcaster Panel - 6/12 width) */}
          <div className="lg:col-span-6 flex flex-col h-full">
            {leftView === 'map' ? (
              <StadiumMap 
                activeRole={activeRole} 
                selectedZone={selectedZone}
                setSelectedZone={setSelectedZone}
                crowdLevel="high"
                activeIncidents={incidents}
                accessibilityMode={accessibilityMode}
              />
            ) : (
              <AnnouncementPanel onCookieBlocked={() => setIsCookieBlocked(true)} />
            )}
          </div>

          {/* Right Block (Conversational Chat Agents or Dashboard Table - 6/12 width) */}
          <div className="lg:col-span-6 flex flex-col h-full">
            {rightView === 'chat' ? (
              <AgentPanel 
                activeRole={activeRole}
                setActiveRole={setActiveRole}
                selectedZone={selectedZone}
                onNewIncidentReported={handleNewIncidentReported}
                accessibilityMode={accessibilityMode}
                setAccessibilityMode={setAccessibilityMode}
                onCookieBlocked={() => setIsCookieBlocked(true)}
              />
            ) : (
              <StatsDashboard 
                incidents={incidents}
                onIncidentResolved={handleIncidentResolved}
                selectedZone={selectedZone}
                onCookieBlocked={() => setIsCookieBlocked(true)}
              />
            )}
          </div>

        </div>

      </main>

      {/* Simple Footer Context Bar */}
      <footer className="border-t border-white/10 backdrop-blur-md bg-white/5 py-3 px-8 text-[10px] text-white/40 uppercase tracking-widest z-10 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <span>Session: WC26-STA-MET-09</span>
            <span>Latency: 24ms</span>
            <span>Cloud: Google Vertex AI</span>
            <span className="text-blue-400 font-bold border-l border-white/15 pl-4 tracking-wider">Made by SATYAM</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All Systems Operational • Luas Stadium OS</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
