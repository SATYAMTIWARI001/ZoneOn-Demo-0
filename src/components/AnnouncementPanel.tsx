import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Sparkles, 
  Languages, 
  Volume2, 
  Copy, 
  Share2, 
  Check, 
  Terminal, 
  Clock, 
  MonitorPlay,
  MessageSquareCode,
  ArrowRight
} from 'lucide-react';
import { Announcement } from '../types';

export default function AnnouncementPanel() {
  const [eventInput, setEventInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeOutputTab, setActiveOutputTab] = useState<'lang' | 'led' | 'voice' | 'social'>('lang');
  
  // Interactive UI states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeVoicePlaying, setActiveVoicePlaying] = useState<boolean>(false);
  const [announcementIndex, setAnnouncementIndex] = useState<number>(0);

  const languages = [
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'pt', label: 'Portuguese' },
    { code: 'ar', label: 'Arabic' },
    { code: 'hi', label: 'Hindi' },
    { code: 'de', label: 'German' },
    { code: 'ja', label: 'Japanese' },
    { code: 'zh', label: 'Chinese' },
    { code: 'it', label: 'Italian' }
  ];

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements');
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (err) {
      console.error("Failed to load announcements:", err);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventInput.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/announcement/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventDescription: eventInput,
          additionalLang: languages.find(l => l.code === selectedLanguage)?.label
        })
      });

      if (res.ok) {
        setEventInput('');
        await fetchAnnouncements();
        setAnnouncementIndex(0); // Show newest
      }
    } catch (err) {
      console.error("Failed to generate announcement:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = (text: string, elementId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(elementId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Speaks aloud the voice announcer script
  const handleVoicePlayback = (text: string) => {
    if ('speechSynthesis' in window) {
      if (activeVoicePlaying) {
        window.speechSynthesis.cancel();
        setActiveVoicePlaying(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95; // professional, clear cadence
        utterance.onend = () => setActiveVoicePlaying(false);
        window.speechSynthesis.speak(utterance);
        setActiveVoicePlaying(true);
      }
    } else {
      alert("Voice playback is not supported in this browser version.");
    }
  };

  const currentAnn = announcements[announcementIndex];

  return (
    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col h-full">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

      {/* Panel Header */}
      <div className="pb-3 border-b border-white/10 mb-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-blue-400 font-bold uppercase block">MULTILINGUAL PUBLIC BROADCASTER</span>
          <h3 className="text-sm font-display font-bold text-white flex items-center gap-1.5">
            <Megaphone size={16} className="text-blue-400" /> Smart Announcement Generator
          </h3>
        </div>
      </div>

      {/* Split section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Side Form (5/12 width) */}
        <div className="lg:col-span-5 space-y-4">
          <p className="text-white/60 text-xs leading-relaxed">
            FIFA mandates synchronized announcements across English, Spanish, and French. Type an event description to draft instant audio announcements, LED scrolls, and official social media updates.
          </p>

          <form onSubmit={handleGenerate} className="space-y-3 bg-white/5 border border-white/10 rounded-xl p-4">
            <div>
              <label className="block text-[10px] font-mono text-white/50 uppercase mb-1.5">Event or Directive Situation</label>
              <textarea
                placeholder="e.g. Shuttle Bus A is delayed 10 minutes. Advise fans to wait inside stadium corridors near West Concourse..."
                required
                rows={4}
                value={eventInput}
                onChange={(e) => setEventInput(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none font-sans"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-white/50 uppercase mb-1.5">Select Additional Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {languages.map(l => (
                  <option key={l.code} value={l.code} className="bg-[#050B18]">{l.label}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isGenerating || !eventInput.trim()}
              className="w-full bg-blue-500 hover:bg-blue-400 disabled:bg-white/5 disabled:text-white/25 text-white font-bold text-xs py-2 rounded-lg transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isGenerating ? 'Compiling Broadcaster Array...' : 'Generate & Translate Broadcasting Package'}
            </button>
          </form>

          {/* Past Announcements Timeline */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-white/40 tracking-wider uppercase block">TRANSMISSION ARCHIVE</span>
            <div className="space-y-1.5 max-h-[150px] overflow-y-auto dark-scrollbar pr-1">
              {announcements.map((ann, idx) => (
                <button
                  key={ann.id}
                  onClick={() => {
                    setAnnouncementIndex(idx);
                    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                    setActiveVoicePlaying(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg border transition-all text-xs flex justify-between items-center ${
                    idx === announcementIndex 
                      ? 'bg-blue-500 border-blue-400 text-white font-semibold' 
                      : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="truncate pr-3 space-y-0.5">
                    <span className="font-semibold block truncate">{ann.event}</span>
                    <span className={`text-[9px] font-mono flex items-center gap-1 ${idx === announcementIndex ? 'text-white/80' : 'text-white/40'}`}>
                      <Clock size={10} /> {new Date(ann.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <ArrowRight size={12} className={`shrink-0 ${idx === announcementIndex ? 'text-white/90' : 'text-white/30'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side Outputs Preview (7/12 width) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          
          {isGenerating ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-10 h-full flex flex-col items-center justify-center text-center space-y-3 animate-pulse">
              <Sparkles className="text-blue-500 animate-bounce" size={32} />
              <div className="space-y-1">
                <p className="text-white/80 font-semibold text-xs font-mono uppercase">COGNITIVE BROADCAST SYNTHESIS IN PROGRESS...</p>
                <p className="text-white/50 text-[11px] max-w-sm">Generating translations, formulating voice announcer cadences, and tailoring LED tickers...</p>
              </div>
            </div>
          ) : currentAnn ? (
            <div className="space-y-3.5 flex flex-col h-full">
              
              {/* Tab Selector */}
              <div className="flex border-b border-white/10 bg-white/5 rounded-lg p-1.5 gap-1">
                <button
                  onClick={() => setActiveOutputTab('lang')}
                  className={`flex-1 py-1 px-2 text-[11px] font-medium font-mono rounded transition-all ${activeOutputTab === 'lang' ? 'bg-blue-500 border border-blue-400 text-white font-bold' : 'text-white/50 hover:text-white'}`}
                >
                  <Languages size={12} className="inline mr-1" /> Translations
                </button>
                <button
                  onClick={() => setActiveOutputTab('led')}
                  className={`flex-1 py-1 px-2 text-[11px] font-medium font-mono rounded transition-all ${activeOutputTab === 'led' ? 'bg-blue-500 border border-blue-400 text-white font-bold' : 'text-white/50 hover:text-white'}`}
                >
                  <MonitorPlay size={12} className="inline mr-1" /> LED Display
                </button>
                <button
                  onClick={() => setActiveOutputTab('voice')}
                  className={`flex-1 py-1 px-2 text-[11px] font-medium font-mono rounded transition-all ${activeOutputTab === 'voice' ? 'bg-blue-500 border border-blue-400 text-white font-bold' : 'text-white/50 hover:text-white'}`}
                >
                  <Volume2 size={12} className="inline mr-1" /> PA Script
                </button>
                <button
                  onClick={() => setActiveOutputTab('social')}
                  className={`flex-1 py-1 px-2 text-[11px] font-medium font-mono rounded transition-all ${activeOutputTab === 'social' ? 'bg-blue-500 border border-blue-400 text-white font-bold' : 'text-white/50 hover:text-white'}`}
                >
                  <Share2 size={12} className="inline mr-1" /> Social media
                </button>
              </div>

              {/* Tab Content Display */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex-1">
                
                {/* 1. Translations Tab */}
                {activeOutputTab === 'lang' && (
                  <div className="space-y-3.5 animate-fadeIn">
                    <span className="text-[9px] font-mono text-white/40 tracking-wider block">SYNCHRONIZED MULTI-FLG BROADCAST DIRECTIVES</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {Object.entries(currentAnn.languages).map(([lang, text]) => (
                        <div key={lang} className="bg-white/5 border border-white/10 rounded-lg p-2.5 relative group">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] font-mono text-blue-400 font-bold uppercase">{lang === 'en' ? '🇬🇧 English' : lang === 'es' ? '🇪🇸 Spanish' : lang === 'fr' ? '🇫🇷 French' : '🌐 Custom Translation'}</span>
                            <button
                              onClick={() => handleCopyText(text as string, `lang-${lang}`)}
                              className="text-white/40 hover:text-white transition-all p-1"
                            >
                              {copiedId === `lang-${lang}` ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                            </button>
                          </div>
                          <p className="text-[11px] text-white/80 leading-normal font-sans italic">"{text}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. LED Scoreboard Marquee */}
                {activeOutputTab === 'led' && (
                  <div className="space-y-4 animate-fadeIn">
                    <span className="text-[9px] font-mono text-white/40 tracking-wider block">SCOREBOARD SCROLLING JUMBOTRON GRAPHIC</span>
                    
                    {/* Simulated LED Scrolling display */}
                    <div className="bg-black border border-amber-500/20 rounded p-4 font-mono text-amber-500 font-bold text-center tracking-widest uppercase overflow-hidden shadow-inner relative">
                      <div className="absolute inset-0 bg-radial-gradient from-transparent to-black pointer-events-none opacity-80" />
                      <div className="relative inline-block w-full overflow-hidden whitespace-nowrap">
                        <div className="inline-block px-4 py-1 text-xs md:text-sm animate-[marquee_15s_linear_infinite]">
                          ⚠️ {currentAnn.types.led} ⚠️
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex justify-between items-center text-xs">
                      <div>
                        <span className="text-white/40 text-[10px] block font-mono">BROADCAST PACKET STRING</span>
                        <p className="text-white/80 italic font-mono">"{currentAnn.types.led}"</p>
                      </div>
                      <button
                        onClick={() => handleCopyText(currentAnn.types.led, 'led')}
                        className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-white/60 hover:text-white transition-all shrink-0"
                      >
                        {copiedId === 'led' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>

                    {/* Scrolling marquee keyframe style inside tailwind v4 context */}
                    <style>{`
                      @keyframes marquee {
                        0% { transform: translate3d(100%, 0, 0); }
                        100% { transform: translate3d(-100%, 0, 0); }
                      }
                    `}</style>
                  </div>
                )}

                {/* 3. Voice PA Speakers Script */}
                {activeOutputTab === 'voice' && (
                  <div className="space-y-3.5 animate-fadeIn">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono text-white/40 tracking-wider block">ANNOUNCER BOOTH MICROPHONE PROMPT</span>
                      <button
                        onClick={() => handleVoicePlayback(currentAnn.types.voice)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded border transition-all flex items-center gap-1 ${
                          activeVoicePlaying 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70'
                        }`}
                      >
                        <Volume2 size={12} /> {activeVoicePlaying ? 'Stop Speaker Feed' : 'Broadcast to Stadium PA'}
                      </button>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-lg p-3.5 font-sans leading-relaxed text-white/80 text-xs italic">
                      "{currentAnn.types.voice}"
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => handleCopyText(currentAnn.types.voice, 'voice')}
                        className="text-[10px] font-mono text-white/40 hover:text-white flex items-center gap-1"
                      >
                        {copiedId === 'voice' ? '✓ Copied Voice Script' : 'Copy Announcer Text'}
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. Social Media Posting */}
                {activeOutputTab === 'social' && (
                  <div className="space-y-3.5 animate-fadeIn">
                    <span className="text-[9px] font-mono text-white/40 tracking-wider block">PROPOSED TOURNAMENT SOCIAL FEED UPDATE</span>
                    
                    {/* Simulated Social Card */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 relative shadow-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-display font-bold text-white text-[10px]">
                          ⚽
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-white block">FIFA World Cup Venue Ops</span>
                          <span className="text-[10px] text-white/40 font-mono">@FIFAWorldCupStadium • Live</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-white/80 leading-relaxed font-sans">{currentAnn.types.social}</p>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => handleCopyText(currentAnn.types.social, 'social')}
                        className="bg-blue-500 hover:bg-blue-400 text-white font-medium text-xs px-3 py-1.5 rounded-lg transition-all shadow flex items-center gap-1.5"
                      >
                        {copiedId === 'social' ? <Check size={12} /> : <Copy size={12} />}
                        {copiedId === 'social' ? 'Copied' : 'Copy Draft'}
                      </button>
                    </div>
                  </div>
                )}

              </div>
              
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[10px] text-white/40 font-mono flex items-center gap-2">
                <Terminal size={12} className="text-white/30" />
                <span>Broadcaster packet synced securely with stadium central announcements queue.</span>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center space-y-3">
              <Megaphone className="text-white/30 animate-pulse" size={40} />
              <div className="space-y-1">
                <p className="text-white/60 text-xs font-semibold">Broadcaster queue is empty</p>
                <p className="text-[10px] text-white/40 max-w-sm leading-snug">Generate stadium directives on the left. The output packages translations, LED ticker formats, speaker scripts, and social updates automatically.</p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
