import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Terminal, Volume2, PlusCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { AgentRole, Message } from '../types';
import { safeSpeak, safeCancelSpeech } from '../lib/speech';

interface AgentPanelProps {
  activeRole: AgentRole;
  setActiveRole: (role: AgentRole) => void;
  selectedZone: string;
  onNewIncidentReported: () => void;
  accessibilityMode?: boolean;
  setAccessibilityMode?: (val: boolean) => void;
}

export default function AgentPanel({
  activeRole,
  setActiveRole,
  selectedZone,
  onNewIncidentReported,
  accessibilityMode = false,
  setAccessibilityMode
}: AgentPanelProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ [key in AgentRole]: Message[] }>({
    fan: [
      { role: 'assistant', content: "Welcome to ZoneOn AI, your FIFA World Cup 2026 concierge! Ask me anything about seat routing, concession menus, restrooms, lost & found, or transport schedules. What can I help you find today?", timestamp: new Date().toLocaleTimeString() }
    ],
    organizer: [
      { role: 'assistant', content: "Executive Operations Support active. Ready to provide real-time crowd modeling, incident triage blueprints, or write operational intelligence reports. You can ask for a full venue diagnostics summary.", timestamp: new Date().toLocaleTimeString() }
    ],
    volunteer: [
      { role: 'assistant', content: "Volunteer Intelligence Unit active. Ready to assist with instant medical response checklists, lost child search protocols, or multilingual translations. Select a protocol or enter custom scenarios.", timestamp: new Date().toLocaleTimeString() }
    ],
    security: [
      { role: 'assistant', content: "Security Operations Command active. Input crowd density thresholds, consult evacuation route optimization, or draft safety cordons for Gate 3 bottleneck mitigation.", timestamp: new Date().toLocaleTimeString() }
    ],
    emergency: [
      { role: 'assistant', content: "Emergency Triage and Dispatch System active. Report medical events to coordinate supervisor carts immediately. Specify trauma type or heat exhaustion symptoms for immediate instructions.", timestamp: new Date().toLocaleTimeString() }
    ],
    sustainability: [
      { role: 'assistant', content: "Stadium Sustainability Engine active. Green cup return points, carbon offset estimators, and waste collection dispatch recommendations ready. Ask how to maximize our World Cup recycling score!", timestamp: new Date().toLocaleTimeString() }
    ]
  });

  const [isLoading, setIsLoading] = useState(false);
  const [voiceSynthesis, setVoiceSynthesis] = useState(false);
  const [isFormingIncident, setIsFormingIncident] = useState(false);
  
  // Incident submission local state
  const [incType, setIncType] = useState<'medical' | 'lost_found' | 'security' | 'sustainability'>('lost_found');
  const [incTitle, setIncTitle] = useState('');
  const [incDesc, setIncDesc] = useState('');
  const [incZone, setIncZone] = useState('Zone A');
  const [incSeverity, setIncSeverity] = useState<'low' | 'medium' | 'high'>('medium');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages list changes or loading changes
  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeRole, isLoading]);

  // Sync selectedZone to incident reporting form if selected
  useEffect(() => {
    if (selectedZone) {
      setIncZone(selectedZone);
    }
  }, [selectedZone]);

  const roles = [
    { id: 'fan', label: 'Fan Assistant', desc: 'Concessions, restrooms, seating guidance', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { id: 'organizer', label: 'Organizer Intel', desc: 'Stadium diagnostics, reports, metrics', badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { id: 'volunteer', label: 'Volunteer Protocol', desc: 'Lost child protocols, multilingual aids', badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { id: 'security', label: 'Security Command', desc: 'Crowd analytics, Gate 3 bottleneck mitigation', badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20' },
    { id: 'emergency', label: 'Emergency Responder', desc: 'First-aid triage dispatches, cart routes', badgeColor: 'bg-rose-600/10 text-rose-400 border-rose-500/20' },
    { id: 'sustainability', label: 'Eco Coordinator', desc: 'Carbon offsets, bin tracking, recycling trivia', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
  ];

  // Pre-set sample questions based on the active role
  const samplePrompts = {
    fan: [
      "Where is the nearest concession stand with vegetarian food?",
      "How do I navigate from Gate 1 to Section 212?",
      "Where is the lost and found recovery point?"
    ],
    organizer: [
      "Generate an executive stadium intelligence report.",
      "Summarize active incidents and staff deployment recommendation.",
      "Analyze Gate 3 bottleneck and suggest dispatches."
    ],
    volunteer: [
      "What is the safety protocol if a parent reports a lost child?",
      "Translate: 'Please keep your digital ticket ready' into Spanish and French.",
      "What is the first aid procedure for sudden heat exhaustion?"
    ],
    security: [
      "Establish Gate 3 queue diversion route to Gate 4.",
      "Draft a security dispatch alert for bottleneck crowd control.",
      "Suggest evacuation bypass pathways for Zone B."
    ],
    emergency: [
      "Provide medical triage response protocol for heatstroke.",
      "What is the fastest cart pathway to Section 104 for paramedic crew?",
      "Provide dispatch directions for a volunteer responding to a cardiac emergency."
    ],
    sustainability: [
      "How do we optimize recycling dispatches for Section 218 bin overflow?",
      "Suggest 3 actionable methods to increase our World Cup sustainability score.",
      "How much carbon offset has been achieved with the Green Cup initiative?"
    ]
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString()
    };

    // Update messages locally
    setMessages(prev => ({
      ...prev,
      [activeRole]: [...prev[activeRole], userMessage]
    }));

    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: activeRole,
          message: textToSend,
          history: messages[activeRole],
          accessibilityMode: accessibilityMode
        })
      });

      let data: any = {};
      if (response.ok) {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch (jsonErr) {
          console.error("Error parsing agent API response JSON:", jsonErr, "Raw response content:", text);
        }
      } else {
        console.warn("Agent API returned non-ok status:", response.status);
      }
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply || "Sorry, I experienced an issue parsing the intelligence response.",
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => ({
        ...prev,
        [activeRole]: [...prev[activeRole], assistantMessage]
      }));

    } catch (err) {
      console.error("Failed to query API agent:", err);
      const errorMessage: Message = {
        role: 'assistant',
        content: "Error: Failed to reach ZoneOn AI brain. Check your network or server logs.",
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => ({
        ...prev,
        [activeRole]: [...prev[activeRole], errorMessage]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incTitle || !incDesc) return;

    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: incType,
          title: incTitle,
          description: incDesc,
          zone: incZone,
          severity: incSeverity
        })
      });

      if (response.ok) {
        // Clear local fields
        setIncTitle('');
        setIncDesc('');
        setIsFormingIncident(false);
        
        // Notify parent to refresh list
        onNewIncidentReported();

        // Add a helpful confirmation dialogue in active chat
        const reportAlert: Message = {
          role: 'assistant',
          content: `🚨 **SYSTEM DISPATCH CONFIRMED**: Successfully posted **[${incSeverity.toUpperCase()}] ${incType.replace('_', ' ').toUpperCase()}** incident: *"${incTitle}"* in **${incZone}**. General operations command, security officers, and volunteers have been notified in real time!`,
          timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => ({
          ...prev,
          [activeRole]: [...prev[activeRole], reportAlert]
        }));
      }
    } catch (err) {
      console.error("Failed to post incident:", err);
    }
  };

  // Simulate text-to-speech for accessible voice-reading
  const toggleVoiceSynthesis = (text: string) => {
    if (voiceSynthesis) {
      safeCancelSpeech();
      setVoiceSynthesis(false);
    } else {
      const spoke = safeSpeak(text, {
        onEnd: () => setVoiceSynthesis(false),
        onError: () => setVoiceSynthesis(false)
      });
      if (spoke) {
        setVoiceSynthesis(true);
      } else {
        console.warn("Speech synthesis was not initiated (possibly unsupported or blocked).");
        setVoiceSynthesis(false);
      }
    }
  };

  return (
    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl flex flex-col h-full shadow-2xl relative overflow-hidden">
      
      {/* Top Stakeholder Selector */}
      <div className="p-4 border-b border-white/10 bg-white/5">
        <span className="text-[10px] font-mono tracking-widest text-blue-400 font-bold uppercase block mb-2.5">ACTIVE COGNITIVE AGENT MODULE</span>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveRole(r.id as AgentRole)}
              className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-between h-[68px] ${
                activeRole === r.id
                  ? 'bg-blue-500 border-blue-400 text-white shadow-[0_0_12px_rgba(59,130,246,0.2)]'
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-xs font-display font-semibold line-clamp-1">{r.label}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono mt-1 ${
                activeRole === r.id ? 'bg-white/20 text-white border-white/20' : r.badgeColor
              }`}>
                {r.id.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Container - Chats & Forms */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between space-y-4 max-h-[500px] min-h-[300px]">
        {/* Incident Form vs Message log toggle */}
        {isFormingIncident ? (
          <form onSubmit={handleIncidentSubmit} className="bg-slate-950/80 border border-white/10 rounded-xl p-4 space-y-3.5 animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h4 className="font-display font-bold text-white text-sm flex items-center gap-1.5">
                <AlertCircle className="text-red-400" size={16} /> Report Operational Event
              </h4>
              <button 
                type="button" 
                onClick={() => setIsFormingIncident(false)}
                className="text-white/60 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">Category</label>
                <select 
                  value={incType} 
                  onChange={(e: any) => setIncType(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="lost_found" className="bg-[#050B18]">Lost & Found</option>
                  <option value="medical" className="bg-[#050B18]">Medical / First Aid</option>
                  <option value="security" className="bg-[#050B18]">Security Alert</option>
                  <option value="sustainability" className="bg-[#050B18]">Sustainability Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">Severity</label>
                <select 
                  value={incSeverity} 
                  onChange={(e: any) => setIncSeverity(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="low" className="bg-[#050B18]">Low Priority</option>
                  <option value="medium" className="bg-[#050B18]">Medium Priority</option>
                  <option value="high" className="bg-[#050B18]">Critical Severity</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">Target Zone</label>
                <select 
                  value={incZone} 
                  onChange={(e) => setIncZone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Zone A" className="bg-[#050B18]">Zone A (East Stand)</option>
                  <option value="Zone B" className="bg-[#050B18]">Zone B (North Stand)</option>
                  <option value="Zone C" className="bg-[#050B18]">Zone C (South Stand)</option>
                  <option value="Zone D" className="bg-[#050B18]">Zone D (West Stand)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">Event Title</label>
                <input 
                  type="text"
                  placeholder="e.g. Lost ID card Section 102"
                  value={incTitle}
                  onChange={(e) => setIncTitle(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">Detailed Description</label>
              <textarea 
                placeholder="Include Section numbers, physical descriptions, or specific assist items requested..."
                value={incDesc}
                onChange={(e) => setIncDesc(e.target.value)}
                required
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-400 text-white font-medium text-xs py-2 rounded-lg transition-all shadow-lg flex items-center justify-center gap-1.5"
            >
              <PlusCircle size={14} /> Log Operational Incident
            </button>
          </form>
        ) : (
          /* Messages Feed */
          <div 
            className="flex-1 space-y-3.5 overflow-y-auto pr-1 dark-scrollbar"
            aria-live="polite"
            aria-atomic="false"
            aria-relevant="additions text"
          >
            {messages[activeRole].map((m, idx) => {
              const isAssistant = m.role === 'assistant';
              return (
                <div 
                  key={idx} 
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'} animate-fadeIn`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[9px] font-mono text-white/40">
                      {isAssistant ? `${activeRole.toUpperCase()} AGENT` : 'TOURNAMENT USER'}
                    </span>
                    <span className="text-[8px] font-mono text-white/30">•</span>
                    <span className="text-[8px] font-mono text-white/30">{m.timestamp}</span>
                  </div>
                  
                  <div className={`rounded-2xl p-3 max-w-[85%] text-xs leading-relaxed border ${
                    isAssistant 
                      ? 'bg-white/10 border-white/10 text-white rounded-tl-none font-sans' 
                      : 'bg-blue-500 border-blue-400 text-white rounded-tr-none font-sans'
                  }`}>
                    {/* Render basic markdown text highlights */}
                    <p className="whitespace-pre-wrap">
                      {m.content.split('**').map((chunk, i) => {
                        return i % 2 === 1 ? <strong key={i} className="text-blue-300 font-semibold">{chunk}</strong> : chunk;
                      })}
                    </p>

                    {isAssistant && (
                      <div className="mt-2 pt-1.5 border-t border-white/10 flex justify-between items-center">
                        <button 
                          onClick={() => toggleVoiceSynthesis(m.content)}
                          className={`text-[9px] font-mono flex items-center gap-1 transition-all ${voiceSynthesis ? 'text-emerald-400 font-bold' : 'text-white/40 hover:text-white'}`}
                        >
                          <Volume2 size={11} /> {voiceSynthesis ? 'Speaking...' : 'Accessible Speech Output'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex flex-col items-start">
                <span className="text-[9px] font-mono text-white/40 mb-1">THINKING IN PROGRESS...</span>
                <div className="bg-white/10 border border-white/10 rounded-2xl rounded-tl-none p-3 text-xs text-white/70 flex items-center gap-2">
                  <Sparkles size={12} className="text-blue-400 animate-spin" />
                  <span>Analyzing live stadium sensors & computing routing recommendations...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Suggested Prompt Chips */}
        {!isFormingIncident && samplePrompts[activeRole] && (
          <div className="space-y-1.5">
            <span className="text-[9px] font-mono text-white/40 block">SUGGESTED DISPATCH QUERIES:</span>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts[activeRole].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p)}
                  className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white px-2.5 py-1 rounded-lg text-left transition-all max-w-full truncate"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Box and Action Bar */}
      <div className="p-3 border-t border-white/10 bg-white/5 flex items-center gap-2">
        <button
          onClick={() => setIsFormingIncident(!isFormingIncident)}
          className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 shrink-0 transition-all ${
            isFormingIncident 
              ? 'bg-red-500/20 text-red-400 border-red-500/30' 
              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <AlertCircle size={14} /> {isFormingIncident ? 'Show Chat Log' : 'Report Event'}
        </button>

        <div className="relative flex-1">
          <input
            type="text"
            placeholder={isFormingIncident ? 'Fill incident details above...' : `Query ZoneOn ${roles.find(r => r.id === activeRole)?.label}...`}
            disabled={isFormingIncident || isLoading}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-3 pr-10 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-40 transition-all font-sans"
          />
          <button
            onClick={() => handleSendMessage(input)}
            disabled={!input.trim() || isFormingIncident || isLoading}
            className="absolute right-1.5 top-1.5 p-1 rounded-lg bg-blue-500 hover:bg-blue-400 text-white disabled:bg-white/5 disabled:text-white/20 transition-all"
          >
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
