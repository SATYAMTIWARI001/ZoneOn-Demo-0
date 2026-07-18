export interface Incident {
  id: string;
  type: 'medical' | 'lost_found' | 'security' | 'sustainability';
  title: string;
  description: string;
  zone: string;
  status: 'active' | 'resolved';
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

export interface TransportStatus {
  line: string;
  mode: 'metro' | 'bus' | 'shuttle';
  status: 'normal' | 'delayed' | 'crowded';
  minutesToArrival: number;
  destination: string;
}

export type AgentRole = 'fan' | 'organizer' | 'volunteer' | 'security' | 'emergency' | 'sustainability';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Announcement {
  id: string;
  event: string;
  timestamp: string;
  category: 'safety' | 'crowd' | 'event' | 'transport';
  languages: {
    [lang: string]: string;
  };
  types: {
    led: string;
    voice: string;
    social: string;
  };
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  details: string;
  timestamp: string;
  traceId?: string;
}

export interface WeatherData {
  temperature: number;
  windspeed: number;
  condition: string;
  isDay: boolean;
  location: string;
  timestamp: string;
}

