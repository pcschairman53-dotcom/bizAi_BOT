export type Language = 'en' | 'bn' | 'hi';

export type Role = 'user' | 'assistant';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

export type ConsultingMode = 
  | 'AI Smart Assistant'
  | 'Growth Strategy'
  | 'Marketing Engine'
  | 'Client Acquisition System'
  | 'Sales AI'
  | 'CRM AI'
  | 'Support AI'
  | 'Analytics AI'
  | 'Admin Control Center';

export interface ConsultingSession {
  mode: ConsultingMode;
  messages: Message[];
}

export interface BusinessGoal {
  id: string;
  title: string;
  description: string;
  category: ConsultingMode;
  status: 'pending' | 'active' | 'completed';
}

export interface ActivityLog {
  id: string;
  type: 'lead' | 'whatsapp' | 'email' | 'crm' | 'system';
  message: string;
  timestamp: Date;
  status?: string;
}

export type LeadStatus = 'NEW' | 'CONTACTED' | 'FOLLOW-UP' | 'CONVERTED' | 'CLOSED';

export interface Lead {
  date: string;
  name: string;
  phone: string;
  service: string;
  budget: string | number;
  status: LeadStatus;
  revenue: string | number;
}

export interface DashboardStats {
  totalLeads: number;
  hotLeads: number;
  mediumLeads: number;
  coldLeads: number;
  revenueEstimate: number;
  conversionRate: number;
  automationStatus: string;
  heatmap: number[];
  pipeline: {
    new: number;
    contacted: number;
    followup: number;
    converted: number;
    closed: number;
  };
}
