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
  | 'Client Acquisition System';

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
