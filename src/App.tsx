import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Briefcase, 
  TrendingUp, 
  Target, 
  Cpu, 
  DollarSign, 
  RefreshCcw,
  Sparkles,
  Bot,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare,
  BarChart3,
  Users,
  Headset,
  PieChart,
  Activity,
  Flame,
  LayoutDashboard,
  Filter,
  Mic,
  MicOff,
  Volume2,
  Shield,
  Settings,
  Database,
  AlertCircle,
  Terminal,
  Activity as ActivityIcon,
  Clock,
  CheckCircle2,
  ArrowRight,
  XCircle,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from './lib/utils';
import { Message, ConsultingMode, DashboardStats, ActivityLog, Lead, Language } from './types';
import { chatWithAssistant } from './services/geminiService';
import { fetchLiveLeads } from './services/crmService';

interface SidebarProps {
  currentMode: ConsultingMode;
  setMode: (mode: ConsultingMode) => void;
  isOpen: boolean;
  toggle: () => void;
}

const MODES: { mode: ConsultingMode; icon: any; color: string }[] = [
  { mode: 'AI Smart Assistant', icon: Cpu, color: 'text-violet-500' },
  { mode: 'Growth Strategy', icon: Briefcase, color: 'text-indigo-500' },
  { mode: 'Sales AI', icon: DollarSign, color: 'text-rose-500' },
  { mode: 'CRM AI', icon: Users, color: 'text-sky-500' },
  { mode: 'Marketing Engine', icon: TrendingUp, color: 'text-emerald-500' },
  { mode: 'Client Acquisition System', icon: Target, color: 'text-orange-500' },
  { mode: 'Support AI', icon: Headset, color: 'text-amber-500' },
  { mode: 'Analytics AI', icon: BarChart3, color: 'text-indigo-500' },
  { mode: 'Admin Control Center', icon: Shield, color: 'text-brand-emerald' },
];

const MODE_INSIGHTS: Record<ConsultingMode, { title: string; hint: string; tips: string[] }> = {
  'AI Smart Assistant': {
    title: 'AI Smart Assistant',
    hint: 'Integrate AI tools to automate workflows and enhance productivity.',
    tips: ['Workflow Automation', 'Chatbot Setup', 'AI Content Tools']
  },
  'Growth Strategy': {
    title: 'Growth Strategy',
    hint: 'Develop high-level scaling roadmaps and competitive advantages.',
    tips: ['Scaling Strategy', 'Market Exit', 'Pricing Models']
  },
  'Marketing Engine': {
    title: 'Marketing Engine',
    hint: 'SEO, Ads, and Branding strategies focused on ROI.',
    tips: ['SEO Authority', 'PPC Strategy', 'Content Engines']
  },
  'Client Acquisition System': {
    title: 'Client Acquisition',
    hint: 'Lead generation and sales funnels designed for conversions.',
    tips: ['Lead Magnets', 'Conversion Funnels', 'Sales Psychology']
  },
  'Sales AI': {
    title: 'Sales Intelligence',
    hint: 'High-conversion sales strategies and closing frameworks.',
    tips: ['Urgency Offers', 'Trust Proof', 'Fast Follow-up']
  },
  'CRM AI': {
    title: 'Relationship Management',
    hint: 'Organize leads and automate client lifetime value tracking.',
    tips: ['Lead Scoring', 'Stage Tracking', 'Automation']
  },
  'Support AI': {
    title: 'Support Excellence',
    hint: 'Customer support automation and satisfaction management.',
    tips: ['Auto-Replies', 'FAQ Engines', 'Ticket Flow']
  },
  'Analytics AI': {
    title: 'Business Analytics',
    hint: 'Track conversion, revenue estimation, and growth metrics.',
    tips: ['Conversion Tracking', 'Revenue Potential', 'ROI Analysis']
  },
  'Admin Control Center': {
    title: 'Admin Control Center',
    hint: 'Manage system-wide AI automation and lead infrastructure.',
    tips: ['Lead Distribution', 'Automation Health', 'Revenue Audits']
  }
};

interface AdminDashboardProps {
  stats: DashboardStats;
  leads: Lead[];
  activities: ActivityLog[];
  setMode: (mode: ConsultingMode) => void;
  onUpdateStatus: (leadId: string, newStatus: string) => void;
  isSyncing: boolean;
  setIsSyncing: (val: boolean) => void;
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string, color: string, icon: any }> = {
    'NEW': { label: 'New', color: 'bg-zinc-100 text-zinc-500 border-zinc-200', icon: Sparkles },
    'CONTACTED': { label: 'Contacted', color: 'bg-sky-500/10 text-sky-500 border-sky-500/20', icon: MessageSquare },
    'FOLLOW-UP': { label: 'Follow-Up', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock },
    'CONVERTED': { label: 'Converted', color: 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20', icon: CheckCircle2 },
    'CLOSED': { label: 'Closed', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20', icon: XCircle },
  };

  const config = configs[status?.toUpperCase()] || configs['NEW'];
  return (
    <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-tight", config.color)}>
      <config.icon size={10} />
      {config.label}
    </div>
  );
}

function LeadPipelineOverview({ stats }: { stats: DashboardStats }) {
  const steps = [
    { label: 'New Leads', count: stats.pipeline.new, color: 'text-zinc-500', bg: 'bg-zinc-50', icon: Sparkles },
    { label: 'Contacted', count: stats.pipeline.contacted, color: 'text-sky-500', bg: 'bg-sky-50', icon: MessageSquare },
    { label: 'Follow-Ups', count: stats.pipeline.followup, color: 'text-amber-500', bg: 'bg-amber-50', icon: Clock },
    { label: 'Converted', count: stats.pipeline.converted, color: 'text-brand-emerald', bg: 'bg-emerald-50', icon: CheckCircle2 },
    { label: 'Closed', count: stats.pipeline.closed, color: 'text-rose-500', bg: 'bg-rose-50', icon: XCircle },
  ];

  return (
    <div className="bg-zinc-950 border border-zinc-800 p-4 md:p-6 rounded-lg relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-indigo/5 to-transparent opacity-50" />
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h3 className="text-white font-bold tracking-tight flex items-center gap-2">
              <RefreshCcw size={18} className="text-brand-indigo" />
              Lead Pipeline Automation
            </h3>
            <p className="text-[10px] text-zinc-500 mt-1 uppercase font-mono">Live Stage Tracking & Channel Flow</p>
          </div>
          <div className="flex items-center gap-2">
             <div className="px-3 py-1 bg-brand-indigo/10 border border-brand-indigo/20 rounded text-[9px] font-bold text-brand-indigo uppercase">Pipeline Active</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {steps.map((step, i) => (
            <motion.div 
              key={step.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-zinc-900 border border-zinc-800 p-4 rounded hover:border-brand-indigo/50 transition-all group/card relative overflow-hidden"
            >
              <div className={cn("absolute top-0 right-0 p-2 opacity-5", step.color)}>
                <step.icon size={40} />
              </div>
              <div className="flex items-center gap-2 mb-3">
                 <div className={cn("w-6 h-6 rounded flex items-center justify-center", step.bg, step.color)}>
                    <step.icon size={12} />
                 </div>
                 <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{step.label}</span>
              </div>
              <div className="text-2xl font-mono font-bold text-white mb-2">{step.count}</div>
              <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(step.count / (stats.totalLeads || 1)) * 100}%` }}
                    className={cn("h-full", step.color.replace('text-', 'bg-'))} 
                 />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AiRecommendationEngine({ stats }: { stats: DashboardStats }) {
  const recommendations = [
    { 
      id: 1, 
      title: `${stats.pipeline.followup} Leads Need Urgent Follow-up`, 
      description: 'AI detected pending follow-up statuses. Re-engaging these leads now could boost conversion by 15%.',
      status: 'URGENT',
      icon: Clock,
      color: 'text-rose-500',
      glow: 'hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]'
    },
    { 
      id: 2, 
      title: 'Potential Revenue Opportunity Detected', 
      description: `Closing ${stats.pipeline.followup} active follow-ups could yield approximately ₹${(stats.pipeline.followup * 25000).toLocaleString()} in revenue.`,
      status: 'OPPORTUNITY',
      icon: Sparkles,
      color: 'text-brand-emerald',
      glow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]'
    },
    { 
      id: 3, 
      title: 'Conversion Rate Improving', 
      description: `Your conversion rate is reaching ${stats.conversionRate}%. Automation successfully marked ${stats.pipeline.new} leads as "NEW" today.`,
      status: 'ATTENTION',
      icon: TrendingUp,
      color: 'text-amber-500',
      glow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-zinc-200 p-6 rounded shadow-sm relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
         <Bot size={120} className="text-brand-indigo" />
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 bg-brand-indigo/30 rounded-full blur animate-pulse" />
            <div className="relative w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center text-brand-indigo">
               <Bot size={22} />
            </div>
          </div>
          <div>
            <h3 className="text-[11px] font-bold text-zinc-900 uppercase tracking-widest leading-none">🧠 AI Recommendation Engine</h3>
            <p className="text-[9px] text-zinc-500 mt-1.5 uppercase font-bold tracking-tighter">Real-time AI business insights</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 bg-brand-emerald rounded-full animate-pulse" />
           <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Live Engine Status</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map((rec) => (
          <motion.div 
            key={rec.id}
            whileHover={{ y: -4, scale: 1.02 }}
            className={cn(
              "p-5 rounded-lg border border-zinc-100 bg-zinc-50/30 relative group transition-all duration-300",
              rec.glow
            )}
          >
            <div className="flex items-center justify-between mb-4">
               <div className={cn("w-8 h-8 rounded-lg bg-white border border-zinc-100 flex items-center justify-center shadow-sm", rec.color)}>
                  <rec.icon size={16} />
               </div>
               <span className={cn(
                 "text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm",
                 rec.status === 'URGENT' ? "bg-rose-500 text-white" : 
                 rec.status === 'OPPORTUNITY' ? "bg-brand-emerald text-white" : 
                 "bg-amber-500 text-white"
               )}>
                 {rec.status}
               </span>
            </div>
            <h4 className="text-[12px] font-bold text-zinc-900 mb-2 leading-tight">{rec.title}</h4>
            <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">{rec.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function AdminDashboard({ stats, leads, activities, setMode, onUpdateStatus, isSyncing, setIsSyncing }: AdminDashboardProps) {
  return (
    <div className="space-y-6 pb-24">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
           <h2 className="text-xl font-serif italic font-bold text-zinc-900 leading-none">Admin Control Center</h2>
           <p className="text-[11px] text-zinc-500 mt-2 uppercase tracking-widest font-bold">System Command & Infrastructure Monitoring</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
              <span className="text-[9px] font-bold text-white uppercase tracking-widest">System Active</span>
           </div>
           <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded flex items-center gap-2">
              <RefreshCcw size={10} className={cn("text-brand-indigo", isSyncing && "animate-spin")} />
              <span className="text-[9px] font-bold text-white uppercase tracking-widest leading-none">
                {isSyncing ? "Syncing..." : "Data Stream Stable"}
              </span>
           </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
              { label: 'Total Leads', val: stats.totalLeads, icon: User, color: 'text-brand-indigo' },
              { label: 'Active Pipeline', val: stats.pipeline.new + stats.pipeline.contacted + stats.pipeline.followup, icon: ActivityIcon, color: 'text-amber-500' },
              { label: 'Converted', val: stats.pipeline.converted, icon: CheckCircle2, color: 'text-brand-emerald' },
              { label: 'Goal Progress', val: leads.length > 0 ? (stats.pipeline.converted / leads.length * 100).toFixed(0) + '%' : '0%', icon: Sparkles, color: 'text-brand-indigo' }
        ].map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-zinc-200 p-3 md:p-4 rounded shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{kpi.label}</span>
              <kpi.icon size={12} className={kpi.color} />
            </div>
            <div className="text-xl font-mono font-bold text-zinc-900">{kpi.val}</div>
            <div className="mt-3 h-1 bg-zinc-100 rounded-full overflow-hidden">
               <motion.div 
                initial={{ width: 0 }}
                animate={{ 
                  width: typeof kpi.val === 'number' 
                    ? `${Math.min(100, (kpi.val / (Math.max(1, stats.totalLeads))) * 100)}%` 
                    : (String(kpi.val).includes('%') ? kpi.val : '100%') 
                }}
                className={cn("h-full", kpi.color.replace('text-', 'bg-'))} 
               />
            </div>
          </motion.div>
        ))}
      </div>

      <LeadPipelineOverview stats={stats} />
      
      <AiRecommendationEngine stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Pipeline Status Breakdown */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 p-6 rounded shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[11px] font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
              <Users size={14} className="text-brand-indigo" />
              Pipeline Dynamics
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-[9px] text-zinc-400 font-mono">Real-time Stage Analysis</span>
              <div className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-4">
              {[
                { label: 'New', count: stats.pipeline.new, color: 'bg-zinc-100 text-zinc-500' },
                { label: 'Contacted', count: stats.pipeline.contacted, color: 'bg-sky-50 text-sky-500' },
                { label: 'Follow-Up', count: stats.pipeline.followup, color: 'bg-amber-50 text-amber-500' },
                { label: 'Converted', count: stats.pipeline.converted, color: 'bg-emerald-50 text-brand-emerald' },
                { label: 'Closed', count: stats.pipeline.closed, color: 'bg-rose-50 text-rose-500' },
              ].map((stage) => (
                <div key={stage.label} className="p-2 md:p-3 bg-zinc-50 border border-zinc-100 rounded text-center">
                  <div className="text-base md:text-lg font-mono font-bold text-zinc-900">{stage.count}</div>
                  <div className={cn("text-[7px] md:text-[8px] font-bold uppercase mt-1 px-1 py-0.5 rounded", stage.color)}>{stage.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-zinc-50 border border-zinc-100 p-4 rounded">
              <div className="flex items-center justify-between mb-4">
                 <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Global Lead Distribution</span>
              </div>
              <div className="flex h-4 w-full rounded-full overflow-hidden border border-zinc-200 shadow-inner">
                <div className="h-full bg-zinc-200" style={{ width: `${(stats.pipeline.new / (stats.totalLeads || 1)) * 100}%` }} />
                <div className="h-full bg-sky-400" style={{ width: `${(stats.pipeline.contacted / (stats.totalLeads || 1)) * 100}%` }} />
                <div className="h-full bg-amber-400" style={{ width: `${(stats.pipeline.followup / (stats.totalLeads || 1)) * 100}%` }} />
                <div className="h-full bg-brand-emerald" style={{ width: `${(stats.pipeline.converted / (stats.totalLeads || 1)) * 100}%` }} />
                <div className="h-full bg-rose-400" style={{ width: `${(stats.pipeline.closed / (stats.totalLeads || 1)) * 100}%` }} />
              </div>
              <div className="grid grid-cols-5 gap-2 mt-3 text-center">
                {['NEW', 'CONTACT', 'FOLLOW', 'CONVER', 'CLOSE'].map((l, i) => (
                  <span key={i} className="text-[7px] font-bold text-zinc-400 uppercase tracking-tighter">{l}</span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded text-white overflow-hidden relative group/ai">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <Target size={60} className="text-brand-indigo" />
                </div>
                <div className="relative z-10">
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-indigo mb-3">AI Automation Health</h4>
                   <div className="space-y-2">
                     <div className="flex justify-between text-[9px] font-bold">
                       <span className="text-zinc-400">PIPELINE ACCURACY</span>
                       <span className="text-brand-emerald">99.2%</span>
                     </div>
                     <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                       <div className="h-full bg-brand-indigo w-[99%]" />
                     </div>
                   </div>
                </div>
              </div>
              <div className="bg-zinc-50 border border-zinc-100 p-4 rounded flex items-center justify-between">
                <div>
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Conversion Velocity</h4>
                   <p className="text-lg font-mono font-bold text-zinc-900">2.4 days</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-brand-emerald/10 flex items-center justify-center text-brand-emerald">
                   <TrendingUp size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Table - Live Admin Actions */}
        <div className="bg-white border border-zinc-200 rounded shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest leading-none">Status Manager</h3>
            <Database size={12} className="text-zinc-400" />
          </div>
          <div className="flex-1 overflow-y-auto max-h-[460px] custom-scrollbar">
            {leads.length > 0 ? (
              leads.slice(0, 15).map((lead, i) => (
                <div key={i} className="p-4 border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50 transition-all group/lead">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-zinc-800">{lead.name}</span>
                      <span className="text-[9px] text-zinc-500 font-mono">{lead.service}</span>
                    </div>
                    <StatusBadge status={lead.status} />
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <select 
                      value={lead.status}
                      onChange={(e) => onUpdateStatus(lead.name, e.target.value)}
                      className="text-[9px] font-bold bg-white border border-zinc-200 rounded px-2 py-1 outline-none hover:border-brand-indigo transition-colors"
                    >
                      <option value="NEW">MARK NEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="FOLLOW-UP">FOLLOW-UP</option>
                      <option value="CONVERTED">CONVERTED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                    <button className="p-1 text-zinc-300 hover:text-brand-indigo transition-colors">
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                <Database size={24} className="text-zinc-200 mb-3" />
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Waiting for Cloud Stream...</span>
              </div>
            )}
          </div>
          <button className="p-3 bg-zinc-50 text-[9px] font-bold text-zinc-500 uppercase hover:text-brand-indigo border-t border-zinc-100 transition-colors">
            Analyze Full Portfolio
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[11px] font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
             <ActivityIcon size={14} className="text-brand-indigo" />
             Strategic Movement Log
          </h3>
          <button 
            onClick={() => setIsSyncing(true)}
            className="text-[9px] font-bold text-brand-indigo uppercase hover:underline"
          >
            Force Sync Now
          </button>
        </div>
        <div className="space-y-2">
          {activities.slice(0, 4).map((log) => (
            <div key={log.id} className="flex items-center justify-between p-3 bg-white border border-zinc-100 rounded hover:border-brand-indigo/30 transition-shadow">
               <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded shrink-0 flex items-center justify-center",
                    log.type === 'lead' ? "bg-brand-emerald/10 text-brand-emerald" : "bg-brand-indigo/10 text-brand-indigo"
                  )}>
                    {log.type === 'lead' ? <Users size={14} /> : <ActivityIcon size={14} />}
                  </div>
                  <div>
                     <p className="text-[11px] font-bold text-zinc-800">{log.message}</p>
                     <span className="text-[8px] text-zinc-400 font-mono uppercase">{log.timestamp.toLocaleTimeString()}</span>
                  </div>
               </div>
               {log.status && <StatusBadge status={log.status} />}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Management Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-24">
        {/* Source Analytics */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded relative overflow-hidden group">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-zinc-100 font-bold tracking-tight flex items-center gap-2">
              <Database size={18} className="text-brand-indigo" />
              Lead Source Analytics
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono text-center">Inbound Channel Performance</span>
          </div>
          <div className="space-y-4">
            {leads.length > 0 ? (
              // Group by service as a proxy for source
              Object.entries(
                leads.reduce((acc, lead) => {
                  const s = lead.service || 'Other';
                  acc[s] = (acc[s] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              )
              .sort((a, b) => b[1] - a[1])
              .slice(0, 4)
              .map(([label, count]) => {
                const percentage = Math.round((count / leads.length) * 100);
                return (
                  <div key={label} className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-zinc-400 truncate pr-2">{label}</span>
                      <span className="text-zinc-200">{percentage}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-brand-indigo" 
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              [...Array(4)].map((_, i) => (
                <div key={i} className="space-y-1.5 animate-pulse">
                  <div className="h-3 bg-zinc-800 rounded w-1/2" />
                  <div className="h-1.5 bg-zinc-800 rounded-full" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Client Management / Recent Contracts */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded relative overflow-hidden group">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-zinc-100 font-bold tracking-tight flex items-center gap-2">
              <Briefcase size={18} className="text-brand-indigo" />
              Client Portfolio
            </h3>
            <button className="text-[10px] text-brand-indigo font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {leads.filter(l => l.status === 'CONVERTED').length > 0 ? (
              leads.filter(l => l.status === 'CONVERTED').slice(0, 3).map((client, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-zinc-950/50 border border-zinc-800 hover:border-brand-indigo transition-colors group/client">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-brand-indigo/10 flex items-center justify-center text-brand-indigo text-xs font-bold">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-zinc-200 leading-none">{client.name}</p>
                      <p className="text-[9px] text-zinc-500 mt-1 uppercase font-mono">{client.service}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-brand-emerald">₹{Number(client.revenue).toLocaleString()}</p>
                    <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-tighter">Verified Client</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-zinc-950/20 border border-dashed border-zinc-800 rounded h-full">
                <Users size={24} className="text-zinc-700 mb-2" />
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">No clients converted yet</p>
                <p className="text-[9px] text-zinc-600 mt-1 uppercase">BizAI is nurturing {leads.length} leads</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "### 🚀 BizAI Multi-Agent System Ready\n\nWelcome to the next generation of business operating systems.\n\n**AVAILABLE AI AGENTS:**\n\n👉 **Sales AI** → type `/sales` \n👉 **CRM AI** → type `/crm` \n👉 **Support AI** → type `/support` \n👉 **Analytics AI** → type `/analytics` \n👉 **Marketing AI** → type `/marketing` \n👉 **Growth AI** → type `/growth` \n\n---\n\n**📊 LIVE DASHBOARD INTEGRATION:**\nTo connect your real-time Google Sheets data:\n1. [View instructions on Google Apps Script setup](https://wa.me/919330457995?text=I%20want%20to%20connect%20Google%20Sheets%20to%20BizAI)\n2. Metrics will automatically sync with your sheet entries.\n\n---\n\n**🚀 To get full business help:**\n\n1️⃣ **Fill this form:** [BizAI Onboarding Form](https://docs.google.com/forms/d/e/1FAIpQLSd8uRsyJVbqqPmR1u3AEvQLj6QXn7klQ9KYTHMTGI2-t9N9Hw/viewform?usp=header)\n\n2️⃣ **Then chat on WhatsApp:** [Connect on WhatsApp](https://wa.me/919330457995?text=Hi%20I%20submitted%20the%20form)\n\n⚡ *Fill the form + connect on WhatsApp to scale faster.*",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [currentMode, setCurrentMode] = useState<ConsultingMode | null>('AI Smart Assistant');
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [leads, setLeads] = useState<Lead[]>([]);
  
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    hotLeads: 0,
    mediumLeads: 0,
    coldLeads: 0,
    revenueEstimate: 0,
    conversionRate: 0,
    automationStatus: 'WAITING',
    heatmap: [0, 0, 0, 0, 0, 0, 0],
    pipeline: {
      new: 0,
      contacted: 0,
      followup: 0,
      converted: 0,
      closed: 0
    }
  });

  const [activities, setActivities] = useState<ActivityLog[]>([
    { id: '1', type: 'system', message: '📡 System Initializing - Setting up real-time lead monitoring...', timestamp: new Date() },
  ]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Voice AI Recognition Logic
  const startVoiceAssistant = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setVoiceError("Speech Recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError(null);
      setActivities(prev => [{
        id: 'voice-' + Date.now(),
        type: 'system' as const,
        message: '🎙 Voice AI Activated - Listening for business commands...',
        timestamp: new Date()
      }, ...prev].slice(0, 10));
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript.toLowerCase();
      handleVoiceCommand(speechToText);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setVoiceError("Voice access required to enable AI assistant.");
      } else {
        setVoiceError("Error occurred in speech recognition: " + event.error);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleVoiceCommand = (command: string) => {
    setActivities(prev => [{
      id: 'voice-cmd-' + Date.now(),
      type: 'system' as const,
      message: `🎙 Voice Input recognized: "${command}"`,
      timestamp: new Date()
    }, ...prev].slice(0, 10));

    if (command.includes('show leads') || command.includes('open leads')) {
      const el = document.getElementById('leads-table');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (command.includes('open crm')) {
      handleModeSelection('CRM AI');
    } else if (command.includes('show hot leads')) {
      handleModeSelection('CRM AI');
      // Additional logic to filter? For now just switch mode as per request
    } else if (command.includes('open marketing')) {
      handleModeSelection('Marketing Engine');
    } else if (command.includes('open sales')) {
      handleModeSelection('Sales AI');
    } else if (command.includes('show revenue')) {
      const el = document.getElementById('stats-grid');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (command.includes('client acquisition')) {
      handleModeSelection('Client Acquisition System');
    } else {
      // Fallback: search in business assistant
      handleSend(command);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Live Dashboard - Real Google Sheets data polling
  useEffect(() => {
    let lastLeadName = '';
    let isMounted = true;
    
    const updateDashboard = async () => {
      if (isSyncing) return;
      setIsSyncing(true);
      
      try {
        const liveLeads = await fetchLiveLeads();
        if (!isMounted) return;

        if (!liveLeads || liveLeads.length === 0) {
          setIsSyncing(false);
          setLastSyncTime(new Date());
          return;
        }

        setLeads(liveLeads);

        // Process Stats from Real Data
        const total = liveLeads.length;
        let hot = 0;
        let totalRevenueValue = 0;
        
        const pipe = { new: 0, contacted: 0, followup: 0, converted: 0, closed: 0 };

        liveLeads.forEach(lead => {
          // Normalizing status to new pipeline
          const rawStatus = (lead.status || '').toUpperCase();
          let status = rawStatus;
          
          if (!status || status === 'NEW' || status === 'HOT' || status === 'MEDIUM' || status === 'COLD') status = 'NEW';
          if (rawStatus.includes('CONTACTED')) status = 'CONTACTED';
          if (rawStatus.includes('FOLLOW-UP') || rawStatus.includes('FOLLOWUP')) status = 'FOLLOW-UP';
          if (rawStatus.includes('CONVERTED') || rawStatus.includes('CLIENT')) status = 'CONVERTED';
          if (rawStatus.includes('CLOSED') || rawStatus.includes('LOST')) status = 'CLOSED';

          const budget = Number(String(lead.budget).replace(/[^0-9.-]+/g, "")) || 0;
          const rev = Number(String(lead.revenue).replace(/[^0-9.-]+/g, "")) || 0;

          if (budget > 10000 || status === 'NEW') hot++;

          if (status === 'CONVERTED') {
            totalRevenueValue += (rev || 15000); 
          } else if (status === 'FOLLOW-UP') {
            totalRevenueValue += (budget * 0.4); 
          } else {
            totalRevenueValue += (budget * 0.1); 
          }

          if (status === 'CONVERTED') pipe.converted++;
          else if (status === 'FOLLOW-UP') pipe.followup++;
          else if (status === 'CONTACTED') pipe.contacted++;
          else if (status === 'CLOSED') pipe.closed++;
          else pipe.new++;
        });

        setStats(prev => ({
          ...prev,
          totalLeads: total,
          hotLeads: hot,
          revenueEstimate: totalRevenueValue || (hot * 18500),
          conversionRate: total > 0 ? parseFloat(((pipe.converted / total) * 100).toFixed(1)) : 0,
          automationStatus: 'OPERATIONAL',
          heatmap: [...prev.heatmap.slice(1), Math.min(100, (hot / (total || 1)) * 200)],
          pipeline: pipe
        }));

        // Activity Feed: New Lead detection
        const latestLead = liveLeads[0];
        if (latestLead && latestLead.name !== lastLeadName) {
          if (lastLeadName !== '') { // Only log if not first load
            setActivities(prev => [{
              id: Date.now().toString(),
              type: 'lead' as const,
              message: `Live Lead Detected: ${latestLead.name} (${latestLead.service})`,
              timestamp: new Date(),
              status: Number(String(latestLead.budget).replace(/[^0-9.-]+/g, "")) > 10000 ? 'HOT' : 'NEW'
            }, ...prev].slice(0, 10));
          } else {
            // Log sync success on first load
            setActivities(prev => [{
              id: 'initial-sync',
              type: 'system' as const,
              message: `📡 Sync Successful: ${liveLeads.length} leads retrieved from Google Sheets.`,
              timestamp: new Date()
            }, ...prev].slice(0, 10));
          }
          lastLeadName = latestLead.name;
        }

        setLastSyncTime(new Date());
      } catch (error) {
        console.error('Sync Error:', error);
        if (isMounted) {
          setActivities(prev => [{
            id: 'error-' + Date.now(),
            type: 'system' as const,
            message: `⚠️ Sync Failed: Connection to Google Script interrupted.`,
            timestamp: new Date()
          }, ...prev].slice(0, 10));
        }
      } finally {
        if (isMounted) {
          setIsSyncing(false);
        }
      }
    };

    updateDashboard(); // Initial fetch
    const pulse = setInterval(updateDashboard, 10000); // 10s refresh

    return () => {
      isMounted = false;
      clearInterval(pulse);
    };
  }, []);

  const handleUpdateLeadStatus = (leadName: string, newStatus: any) => {
    // Optimistic UI Update
    setLeads(prev => prev.map(l => l.name === leadName ? { ...l, status: newStatus } : l));
    
    setActivities(prev => [{
      id: 'update-' + Date.now(),
      type: 'crm' as const,
      message: `Manual Override: ${leadName} moved to ${newStatus}`,
      timestamp: new Date(),
      status: newStatus
    }, ...prev].slice(0, 10));
    
    // In a real app, this would trigger a PATCH to Google Sheets or Firestore
  };

  // Auto-close sidebar on mobile after selection
  const handleModeSelection = (mode: ConsultingMode) => {
    setCurrentMode(mode);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (overrideInput?: string) => {
    let textToSend = (overrideInput || input).trim();
    if (!textToSend || isLoading) return;

    // Command Detection
    const lowerText = textToSend.toLowerCase();
    let commandHandled = false;

    if (lowerText.startsWith('/')) {
      const command = lowerText.split(' ')[0];
      const modeMap: Record<string, ConsultingMode> = {
        '/growth': 'Growth Strategy',
        '/scaling': 'Growth Strategy',
        '/marketing': 'Marketing Engine',
        '/clients': 'Client Acquisition System',
        '/general': 'AI Smart Assistant',
        '/sales': 'Sales AI',
        '/crm': 'CRM AI',
        '/support': 'Support AI',
        '/analytics': 'Analytics AI'
      };

      if (modeMap[command]) {
        const newMode = modeMap[command];
        setCurrentMode(newMode);
        
        // System confirmation message local-only or sent to AI?
        // Let's add a visual confirmation and strip the command if there's more text
        commandHandled = true;
        const remainingText = textToSend.replace(command, '').trim();
        
        if (!remainingText) {
          let content = `✅ Switched to **${newMode}** mode. How can I help you in this vertical?`;
          
          if (command === '/clients') {
            content = `✅ Client Acquisition Mode Activated

Here’s a simple 3-step plan to get clients fast:

1. Facebook Group Posting (daily 10 groups)
2. Direct WhatsApp Outreach (local business)
3. Offer low-cost entry service (999/-  to  1999/- per Month)

🚀 Want a custom plan for your business?

👉 **Fill this quick form:**
[BizAI Onboarding Form](https://docs.google.com/forms/d/e/1FAIpQLSd8uRsyJVbqqPmR1u3AEvQLj6QXn7klQ9KYTHMTGI2-t9N9Hw/viewform?usp=header)

After submitting, message me on WhatsApp:
[Connect on WhatsApp](https://wa.me/919330457995?text=Hi%20I%20submitted%20the%20form)`;
          }

          if (command === '/marketing') {
            content = `✅ Marketing Engine Activated

Here’s a simple marketing plan for your business:

1. Google Business Profile optimization (local ranking)
2. Facebook + Instagram daily content posting
3. WhatsApp marketing (direct offers + follow-up)

🚀 Want a custom marketing plan for your business?

👉 **Fill this quick form:**
[BizAI Onboarding Form](https://docs.google.com/forms/d/e/1FAIpQLSd8uRsyJVbqqPmR1u3AEvQLj6QXn7klQ9KYTHMTGI2-t9N9Hw/viewform?usp=header)

After submitting, message me on WhatsApp:
[Connect on WhatsApp](https://wa.me/919330457995?text=Hi%20I%20submitted%20the%20form)`;
          }

          if (command === '/growth') {
            content = `✅ Growth Strategy Mode Activated

Here’s a simple business growth plan:

1. Define your offer (clear problem → clear solution)
2. Build online presence (Google + social media)
3. Daily lead generation (posting + outreach)

🚀 Want a custom growth plan for your business?

👉 **Fill this quick form:**
[BizAI Onboarding Form](https://docs.google.com/forms/d/e/1FAIpQLSd8uRsyJVbqqPmR1u3AEvQLj6QXn7klQ9KYTHMTGI2-t9N9Hw/viewform?usp=header)

After submitting, message me on WhatsApp:
[Connect on WhatsApp](https://wa.me/919330457995?text=Hi%20I%20submitted%20the%20form)

⚡ *Limited consulting slots available*`;
          }

          if (command === '/scaling') {
            content = `✅ Scaling Strategy Activated

Business scaling roadmap:

1. Increase lead flow
2. Automate follow-up
3. Build recurring revenue
4. Create premium offers
5. Expand using AI automation

🚀 Want a custom scaling roadmap?

👉 **Fill the growth form:**
[BizAI Onboarding Form](https://docs.google.com/forms/d/e/1FAIpQLSd8uRsyJVbqqPmR1u3AEvQLj6QXn7klQ9KYTHMTGI2-t9N9Hw/viewform?usp=header)

📲 **Connect on WhatsApp:**
[Connect on WhatsApp](https://wa.me/919330457995?text=Hi%20I%20submitted%20the%20form)`;
          }

          if (command === '/sales') {
            content = `✅ Sales AI Activated

Here’s a high-conversion sales strategy:

1. Use urgency-based offers
2. Offer low-risk starter package (₹1999)
3. Follow up within 5 minutes
4. Use WhatsApp for fast conversion
5. Build trust using proof/results

**Sales Closing Framework:**
✔ Identify pain point
✔ Offer solution
✔ Create urgency
✔ Close quickly

🚀 Want a custom sales funnel?

👉 **Fill this form:**
[BizAI Onboarding Form](https://docs.google.com/forms/d/e/1FAIpQLSd8uRsyJVbqqPmR1u3AEvQLj6QXn7klQ9KYTHMTGI2-t9N9Hw/viewform?usp=header)

📲 **WhatsApp:**
[Connect on WhatsApp](https://wa.me/919330457995)`;
          }

          if (command === '/crm') {
            content = `✅ CRM AI Activated

Current CRM strategy:

✔ Organize leads
✔ Track client stages
✔ Monitor conversions
✔ Assign lead scores
✔ Automate follow-ups

**Lead Categories:**
🟢 Hot Leads
🟡 Medium Leads
🔴 Cold Leads

🚀 Want a custom CRM setup?

👉 **Fill the onboarding form:**
[BizAI Onboarding Form](https://docs.google.com/forms/d/e/1FAIpQLSd8uRsyJVbqqPmR1u3AEvQLj6QXn7klQ9KYTHMTGI2-t9N9Hw/viewform?usp=header)

📲 **WhatsApp:**
[Connect on WhatsApp](https://wa.me/919330457995)`;
          }

          if (command === '/support') {
            content = `✅ Support AI Activated

Customer support automation strategy:

1. Instant response system
2. WhatsApp auto-replies
3. FAQ automation
4. Ticket management
5. Client follow-up reminders

**Support Goal:**
✔ Faster replies
✔ Better client satisfaction
✔ Automated communication

📲 **Need support setup help?**
[Connect on WhatsApp](https://wa.me/919330457995)`;
          }

          if (command === '/analytics') {
            content = `✅ Analytics AI Activated

Business analytics overview:

✔ Lead conversion tracking
✔ Revenue estimation
✔ Growth analytics
✔ Marketing performance
✔ Sales performance reports

**Today’s Metrics Example:**
📈 Leads: 24
💰 Revenue Potential: ₹45,000
🔥 Conversion Rate: 18%

🚀 Want advanced analytics setup?

👉 **Fill this form:**
[BizAI Onboarding Form](https://docs.google.com/forms/d/e/1FAIpQLSd8uRsyJVbqqPmR1u3AEvQLj6QXn7klQ9KYTHMTGI2-t9N9Hw/viewform?usp=header)

📲 **WhatsApp:**
[Connect on WhatsApp](https://wa.me/919330457995)`;
          }

          const systemMsg: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: content,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, { id: 'cmd-' + Date.now(), role: 'user', content: textToSend, timestamp: new Date() }, systemMsg]);
          setInput('');
          return;
        }
        
        // If there's remaining text, we treat it as a message after switching mode
        textToSend = remainingText;
      }
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: overrideInput || input, // Use full text including command for history if needed, or stripped? Let's use what the user typed.
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithAssistant([...messages, userMsg], currentMode, language);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: 'error',
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex bg-[#F0F1F4] text-zinc-900 font-sans selection:bg-brand-indigo/10 overflow-x-hidden min-h-screen w-full relative">
      {/* Mobile Sidebar Overlay Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Structural Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-72 md:w-80 bg-zinc-950 border-r border-zinc-800 flex flex-col z-50 fixed lg:sticky lg:top-0 lg:h-screen text-zinc-400 shadow-2xl lg:shadow-none"
          >
            <div className="p-6 md:p-8 pb-4 flex items-center justify-between border-b border-zinc-800/50 relative">
               {/* Close button for mobile sidebar */}
               <button 
                 onClick={() => setSidebarOpen(false)}
                 className="lg:hidden absolute top-4 right-4 p-2 text-zinc-500 hover:text-white"
               >
                 <XCircle size={20} />
               </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-indigo rounded flex items-center justify-center text-white shadow-lg shadow-brand-indigo/20">
                  <BarChart3 size={18} />
                </div>
                <div className="flex flex-col">
                  <h1 className="font-serif italic font-bold text-xl tracking-tight text-white leading-none">BizAI</h1>
                  <span className="text-[9px] font-bold text-brand-indigo uppercase tracking-widest mt-1">Growth Expert</span>
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" title="System Online" />
            </div>

            <nav className="flex-1 px-4 py-8 space-y-8 overflow-y-auto">
              <div>
                <div className="px-4 text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-4 h-[1px] bg-zinc-800" />
                  Growth Verticals
                </div>
                <div className="space-y-1">
                  {MODES.map(({ mode, icon: Icon, color }) => (
                    <button
                      key={mode}
                      onClick={() => handleModeSelection(mode)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-md text-xs font-medium transition-all group relative",
                        currentMode === mode 
                          ? "bg-zinc-800/50 text-white" 
                          : "hover:bg-zinc-900/50 hover:text-zinc-200"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={14} className={cn(currentMode === mode ? "text-brand-indigo" : "text-zinc-600 transition-colors group-hover:text-zinc-400")} />
                        {mode}
                      </div>
                      {currentMode === mode && (
                        <div className="w-1 h-3 bg-brand-indigo rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="px-4 text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-4 h-[1px] bg-zinc-800" />
                  System Stats
                </div>
                <div className="px-4 space-y-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px]">
                      <span>STRATEGY OPTIMIZATION</span>
                      <span className="text-brand-emerald">88%</span>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-emerald w-[88%]" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px]">
                      <span>REVENUE IMPACT</span>
                      <span className="text-brand-indigo">72%</span>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-indigo w-[72%]" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 border-t border-zinc-800 pt-3">
                    <div className="flex justify-between text-[10px]">
                      <span>TOTAL SCALED</span>
                      <span className="text-white font-mono">₹8,35,000</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="px-4 text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-4 h-[1px] bg-zinc-800" />
                  Language Support
                </div>
                <div className="px-4 space-y-2">
                  <div className="grid grid-cols-1 gap-1">
                    {[
                      { id: 'en', label: 'English', native: 'English', icon: '🌐' },
                      { id: 'bn', label: 'Bengali', native: 'বাংলা', icon: '🌐' },
                      { id: 'hi', label: 'Hindi', native: 'हिन्दी', icon: '🌐' }
                    ].map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => {
                          setLanguage(lang.id as Language);
                          setActivities(prev => [{
                            id: 'lang-' + Date.now(),
                            type: 'system' as const,
                            message: `Language updated to ${lang.native}`,
                            timestamp: new Date()
                          }, ...prev].slice(0, 10));
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded text-[10px] font-bold transition-all border",
                          language === lang.id 
                            ? "bg-brand-indigo/10 border-brand-indigo/30 text-white" 
                            : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span>{lang.icon}</span>
                          <span>{lang.native}</span>
                        </div>
                        {language === lang.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-indigo shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-4 px-1 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded">
                     <div className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse ml-2" />
                     <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter text-center">🌐 Multi-Language AI Support Enabled</span>
                  </div>
                </div>
              </div>
            </nav>

            <div className="p-4 border-t border-zinc-800/50 bg-zinc-900/20">
              <div className="p-4 rounded border border-zinc-800 bg-zinc-950">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={12} className="text-brand-indigo" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Tier Status</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed mb-3">Enterprise Access enabled for premium consulting.</p>
                <div className="relative group">
                  <motion.button 
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.open('https://wa.me/919330457995?text=Hi%20PCS%20Consultancy,%20I%20want%20to%20upgrade%20my%20AI%20automation%20system', '_blank')}
                    className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-brand-indigo/50 text-white rounded-md text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 relative overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                    title="Talk with PCS Consultancy"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-indigo/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <MessageSquare size={12} className="text-brand-indigo animate-pulse" />
                    <span className="relative z-10">Book Consultation</span>
                  </motion.button>
                  
                  {/* Premium Glow Effect */}
                  <div className="absolute -inset-0.5 bg-brand-indigo/20 rounded-md blur opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <div className="px-4 text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-4 h-[1px] bg-zinc-800" />
                  Management
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleModeSelection('Admin Control Center')}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-md text-xs font-medium transition-all group relative",
                      currentMode === 'Admin Control Center' 
                        ? "bg-zinc-800/50 text-white" 
                        : "hover:bg-zinc-900/50 hover:text-zinc-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Shield size={14} className={cn(
                        "transition-colors",
                        currentMode === 'Admin Control Center' ? "text-brand-emerald" : "text-zinc-600 group-hover:text-brand-emerald"
                      )} />
                      <span>Admin Control Center</span>
                    </div>
                    {currentMode === 'Admin Control Center' && (
                      <motion.div 
                        layoutId="active-nav"
                        className="absolute left-0 w-1 h-6 bg-brand-emerald rounded-r-full"
                      />
                    )}
                  </button>
                </div>
              </div>

              <p className="mt-4 text-[9px] text-center text-zinc-600 uppercase tracking-tighter">Powered by DeepMind Antigravity</p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Terminal View */}
      <main className="flex-1 flex flex-col min-w-0 bg-white relative overflow-hidden">
        {/* Technical Header */}
        <header className="h-14 border-b border-zinc-200 flex items-center justify-between px-3 md:px-6 bg-white/80 backdrop-blur-md z-30 shrink-0 sticky top-0">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-zinc-50 border border-zinc-100 rounded transition-colors"
            >
              <PanelLeftOpen size={16} className={cn("transition-transform", sidebarOpen && "rotate-180")} />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none hidden md:inline">Console</span>
                <span className="text-[11px] md:text-xs font-bold text-zinc-900 tracking-tight truncate max-w-[100px] xs:max-w-[150px] sm:max-w-none">
                  {currentMode || "Startup"}
                </span>
              </div>
              <span className="text-[7px] md:text-[8px] font-mono text-zinc-400 leading-none">0x921A-BIZ-NODE</span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-6">
             <div className="hidden lg:flex items-center gap-8">
              <div className="flex flex-col items-end">
                <span className="text-[8px] uppercase font-bold text-zinc-400 tracking-widest">Pipeline Health</span>
                <span className="text-[10px] font-mono text-brand-emerald">99.8%</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[8px] uppercase font-bold text-zinc-400 tracking-widest">Network Status</span>
                <span className={cn("text-[10px] font-mono", leads.length > 0 ? "text-brand-emerald" : "text-amber-500")}>
                  {leads.length > 0 ? "STABLE" : "SYNCING"}
                </span>
              </div>
             </div>
             <button 
              onClick={() => setMessages([messages[0]])}
              className="p-1.5 hover:bg-zinc-50 border border-zinc-100 rounded text-zinc-400 hover:text-zinc-600 transition-all"
              title="Reset System"
             >
                <RefreshCcw size={14} />
             </button>
             <div className="w-8 h-8 rounded border border-zinc-200 p-0.5 overflow-hidden group hover:border-brand-indigo transition-colors cursor-pointer shrink-0">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent("pcschair")}`} alt="User" className="w-full h-full object-cover" />
             </div>
          </div>
        </header>

        {/* Console Viewport */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 space-y-12 bg-[#fafafa]">
          <div className="max-w-7xl mx-auto space-y-12 pb-48">
            {currentMode === 'Admin Control Center' ? (
              <AdminDashboard 
                stats={stats} 
                leads={leads} 
                activities={activities} 
                setMode={handleModeSelection}
                onUpdateStatus={handleUpdateLeadStatus}
                isSyncing={isSyncing}
                setIsSyncing={setIsSyncing}
              />
            ) : (
              <>
                {/* Multi-Agent Dashboard */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-950 border border-zinc-800 p-6 rounded-sm shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <LayoutDashboard size={80} className="text-brand-indigo" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-indigo/10 rounded flex items-center justify-center text-brand-indigo">
                      <Activity size={20} />
                    </div>
                    <div>
                      <h2 className="text-white font-bold tracking-tight">BizAI Enterprise Dashboard</h2>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                        {isSyncing ? "Syncing with Sheets..." : `Live Sync: ${lastSyncTime ? lastSyncTime.toLocaleTimeString() : 'Ready'}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-white">
                     <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800">
                        <div className={cn("w-2 h-2 rounded-full", isSyncing ? "bg-brand-indigo animate-spin" : "bg-brand-emerald animate-pulse")} />
                        <span className="text-[10px] font-bold uppercase tracking-tight">
                          {isSyncing ? "Refreshing..." : "System Live"}
                        </span>
                     </div>
                  </div>
                </div>

                <div id="stats-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 relative">
                  {(stats.totalLeads === 0 && !isSyncing) && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-950/60 backdrop-blur-[4px] rounded border border-zinc-800/50">
                       <div className="text-center">
                          <Activity size={32} className="text-brand-indigo mx-auto mb-3 animate-bounce" />
                          <span className="text-xs font-bold text-white uppercase tracking-widest block mb-1">Authenticating Data Stream...</span>
                          <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-tighter block mb-4">Connect Google Sheet to unlock live metrics</span>
                          <button 
                            onClick={() => window.open('https://wa.me/919330457995', '_blank')}
                            className="px-4 py-2 bg-brand-indigo text-white text-[10px] font-bold uppercase rounded hover:bg-indigo-600 transition-all"
                          >
                            Get Setup Instructions
                          </button>
                       </div>
                    </div>
                  )}
                  {isSyncing && stats.totalLeads === 0 && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-950/40 backdrop-blur-[2px] rounded border border-zinc-800/50">
                       <div className="text-center">
                          <div className="w-8 h-8 border-2 border-brand-indigo border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Connecting to Cloud Matrix...</span>
                       </div>
                    </div>
                  )}
                  <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800/50 relative overflow-hidden group/card shadow-lg shadow-indigo-900/5 min-h-[100px] flex flex-col justify-center">
                    {isSyncing && stats.totalLeads === 0 && <div className="absolute inset-0 bg-zinc-900 z-10 flex flex-col p-4 space-y-2"><div className="h-2 bg-zinc-800 rounded w-1/3 animate-pulse" /><div className="h-6 bg-zinc-800 rounded w-2/3 animate-pulse" /><div className="h-2 bg-zinc-800 rounded w-1/2 animate-pulse mt-auto" /></div>}
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Total Leads</span>
                    <span className="text-xl font-mono font-bold text-white leading-none">{stats.totalLeads.toLocaleString()}</span>
                    <div className="flex gap-2 mt-2">
                       <span className={cn(
                         "text-[8px] font-bold px-1.5 py-0.5 rounded uppercase",
                         stats.totalLeads > 0 ? "text-brand-emerald bg-brand-emerald/10" : "text-zinc-600 bg-zinc-800"
                       )}>
                          {stats.totalLeads > 0 ? `+${Math.floor(stats.totalLeads * 0.1)} Potential` : "Stream Listening"}
                       </span>
                    </div>
                  </div>
                  <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800/50 relative overflow-hidden group/card shadow-lg shadow-emerald-900/5 min-h-[100px] flex flex-col justify-center">
                    {isSyncing && stats.totalLeads === 0 && <div className="absolute inset-0 bg-zinc-900 z-10 flex flex-col p-4 space-y-2"><div className="h-2 bg-zinc-800 rounded w-1/3 animate-pulse" /><div className="h-6 bg-zinc-800 rounded w-2/3 animate-pulse" /><div className="h-2 bg-zinc-800 rounded w-full animate-pulse mt-auto" /></div>}
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Conversion Rate</span>
                    <div className="flex items-end gap-2">
                      <span className="text-xl font-mono font-bold text-brand-emerald leading-none">{stats.conversionRate}%</span>
                      <TrendingUp size={14} className="text-brand-emerald mb-1 transition-transform group-hover/card:translate-y-[-2px]" />
                    </div>
                    <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${stats.conversionRate}%` }}
                         className="h-full bg-brand-emerald"
                       />
                    </div>
                  </div>
                  <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800/50 relative overflow-hidden group/card shadow-lg shadow-indigo-900/5 min-h-[100px] flex flex-col justify-center">
                    {isSyncing && stats.totalLeads === 0 && <div className="absolute inset-0 bg-zinc-900 z-10 flex flex-col p-4 space-y-2"><div className="h-2 bg-zinc-800 rounded w-1/3 animate-pulse" /><div className="h-6 bg-zinc-800 rounded w-2/3 animate-pulse" /><div className="h-4 bg-zinc-800 rounded w-1/2 animate-pulse mt-auto" /></div>}
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">Revenue Est.</span>
                    <span className="text-xl font-mono font-bold text-brand-indigo leading-none">₹{(stats.revenueEstimate / 1000000).toFixed(2)}M</span>
                    <div className="mt-2 flex items-center justify-between">
                       <p className="text-[8px] text-zinc-500 uppercase font-bold tracking-tighter">Proj. ROI: 4.8x</p>
                       <div className="flex gap-0.5 h-3 items-end">
                          {(stats.heatmap && stats.heatmap.length > 0 ? stats.heatmap : [30, 50, 40, 70, 60, 90]).map((h, i) => (
                             <div key={i} className="w-1 bg-brand-indigo/30 rounded-t-xs" style={{ height: `${Math.max(10, h)}%` }} />
                          ))}
                       </div>
                    </div>
                  </div>
                  <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800/50 relative overflow-hidden group/card min-h-[100px] flex flex-col justify-center">
                    {isSyncing && stats.totalLeads === 0 && <div className="absolute inset-0 bg-zinc-900 z-10 flex flex-col p-4 space-y-2"><div className="h-2 bg-zinc-800 rounded w-1/3 animate-pulse" /><div className="h-3 bg-zinc-800 rounded w-full animate-pulse" /><div className="h-3 bg-zinc-800 rounded w-full animate-pulse" /></div>}
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Agent Connectivity</span>
                    <div className="flex flex-col gap-1.5 mt-1">
                       <div className="flex items-center justify-between text-[8px] font-bold">
                          <span className="text-zinc-400">SALES ENGINE</span>
                          <span className={cn(stats.totalLeads > 0 ? "text-brand-emerald" : "text-amber-500")}>
                             {stats.totalLeads > 0 ? "ACTIVE" : "PENDING"}
                          </span>
                       </div>
                       <div className="flex items-center justify-between text-[8px] font-bold">
                          <span className="text-zinc-400">DATA SYNC</span>
                          <span className={cn(isSyncing ? "text-brand-indigo animate-pulse" : "text-brand-emerald")}>
                             {isSyncing ? "UPDATING" : "STABLE"}
                          </span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Activity Feed */}
                  <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800/50 rounded p-4">
                    <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
                      <h3 className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <Activity size={12} className="text-brand-indigo" />
                        Live Activity Feed
                      </h3>
                      <button className="text-[9px] text-zinc-500 hover:text-zinc-300 uppercase font-bold">Clear Logs</button>
                    </div>
                    <div className="space-y-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar relative">
                      {activities.length === 0 && (
                        <div className="flex items-center justify-center h-24 text-[9px] text-zinc-600 uppercase font-mono tracking-widest italic">
                           No activity logged...
                        </div>
                      )}
                      {activities.map((activity) => (
                        <div key={activity.id} className="flex gap-3 text-[11px] group/item">
                          <div className="flex flex-col items-center gap-1 py-1">
                            {activity.type === 'lead' && <User size={10} className="text-brand-emerald" />}
                            {activity.type === 'whatsapp' && <MessageSquare size={10} className="text-brand-indigo" />}
                            <div className="w-[1px] h-full bg-zinc-800" />
                          </div>
                          <div className="flex-1 pb-2">
                            <div className="flex items-center justify-between mb-0.5">
                               <span className="font-bold text-zinc-300 group-hover/item:text-white transition-colors">{activity.message}</span>
                               <span className="text-[9px] font-mono text-zinc-600">{activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                            </div>
                            {activity.status && (
                              <span className={cn(
                                "text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-tight",
                                activity.status === 'HOT' ? "bg-brand-emerald/10 text-brand-emerald" :
                                activity.status === 'MEDIUM' ? "bg-amber-400/10 text-amber-400" :
                                "bg-zinc-500/10 text-zinc-500"
                              )}>
                                {activity.status} LEAD IDENTIFIED
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lead Classification & Funnel */}
                  <div className="bg-zinc-900/30 border border-zinc-800/50 rounded p-4 flex flex-col">
                    <h3 className="text-[10px] font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Filter size={12} className="text-brand-indigo" />
                       Sales Funnel Progress
                    </h3>
                    
                    <div className="flex-1 space-y-4">
                       <div className="relative pt-2">
                          <div className="flex flex-col gap-1">
                             {[
                               { label: 'Visitor', val: stats.totalLeads * 4, color: 'bg-zinc-700' },
                               { label: 'Interactions', val: stats.totalLeads * 2, color: 'bg-zinc-600' },
                               { label: 'Captured Leads', val: stats.totalLeads, color: 'bg-brand-indigo' },
                               { label: 'Converted', val: stats.pipeline.converted, color: 'bg-brand-emerald' }
                             ].map((step, idx) => (
                              <div key={idx} className="group/funnel">
                                 <div className="flex justify-between text-[8px] font-bold text-zinc-500 uppercase mb-1">
                                    <span>{step.label}</span>
                                    <span className="text-white font-mono">{step.val.toLocaleString()}</span>
                                 </div>
                                 <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                    <motion.div 
                                       initial={{ width: 0 }}
                                       animate={{ width: `${Math.min(100, (step.val / (Math.max(1, stats.totalLeads) * 4 || 1)) * 100)}%` }} 
                                       className={cn("h-full transition-all duration-1000", step.color)} 
                                    />
                                 </div>
                              </div>
                             ))}
                          </div>
                       </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-zinc-800">
                       <div className="flex items-center justify-between mb-3">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Conversion Pipeline</span>
                       </div>
                       <div className="flex gap-1">
                          {[
                            { color: 'bg-zinc-500', count: stats.pipeline.new, label: 'NEW' },
                            { color: 'bg-sky-400', count: stats.pipeline.contacted, label: 'CONTACTED' },
                            { color: 'bg-amber-400', count: stats.pipeline.followup, label: 'FOLLOW-UP' },
                            { color: 'bg-brand-emerald', count: stats.pipeline.converted, label: 'CONVERTED' },
                            { color: 'bg-rose-500', count: stats.pipeline.closed, label: 'CLOSED' },
                          ].map((stage, i) => (
                            <div key={i} className="flex-1 group/stage relative">
                               <div 
                                  className={cn("h-1 rounded-sm", stage.count > 0 ? stage.color : "bg-zinc-800")} 
                                  style={{ opacity: stage.count > 0 ? 1 : 0.3 }}
                               />
                               <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded opacity-0 group-hover/stage:opacity-100 transition-opacity pointer-events-none z-30 whitespace-nowrap">
                                  <span className="text-[8px] font-bold text-white uppercase">{stage.label}: {stage.count}</span>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>

                {/* Latest Leads Table - Enhanced UI */}
                <div id="leads-table" className="mt-8 border-t border-zinc-800 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                       <Users size={12} className="text-brand-indigo" />
                       Latest CRM Leads
                    </h3>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] text-zinc-500 font-mono">Real-time Sync Active</span>
                       <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[10px] text-left">
                      <thead>
                        <tr className="border-b border-zinc-800/50 text-zinc-500 uppercase tracking-tighter">
                          <th className="pb-2 font-bold">Name</th>
                          <th className="pb-2 font-bold hidden sm:table-cell">Service</th>
                          <th className="pb-2 font-bold hidden md:table-cell">Budget</th>
                          <th className="pb-2 font-bold">Status</th>
                          <th className="pb-2 font-bold text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900/10">
                        {isSyncing && leads.length === 0 ? (
                          [...Array(5)].map((_, i) => (
                            <tr key={i} className="animate-pulse">
                              <td className="py-3 pr-4"><div className="h-4 bg-zinc-900/20 rounded w-24 mb-1" /><div className="h-2 bg-zinc-900/10 rounded w-16" /></td>
                              <td className="py-3 pr-4 hidden sm:table-cell"><div className="h-3 bg-zinc-900/10 rounded w-20" /></td>
                              <td className="py-3 pr-4 hidden md:table-cell"><div className="h-3 bg-zinc-900/10 rounded w-16" /></td>
                              <td className="py-3 pr-4"><div className="h-4 bg-zinc-900/20 rounded w-12" /></td>
                              <td className="py-3 text-right"><div className="h-4 bg-zinc-900/20 rounded w-16 ml-auto" /></td>
                            </tr>
                          ))
                        ) : leads.length > 0 ? (
                          leads.slice(0, 5).map((lead, i) => (
                            <tr key={i} className="group hover:bg-zinc-900/20 transition-colors">
                              <td className="py-3 pr-4">
                                <div className="flex flex-col">
                                  <span className="text-zinc-200 font-bold leading-none">{lead.name}</span>
                                  <span className="text-[8px] text-zinc-600 mt-1">{lead.phone}</span>
                                </div>
                              </td>
                              <td className="py-3 pr-4 text-zinc-400 hidden sm:table-cell">{lead.service}</td>
                              <td className="py-3 pr-4 font-mono text-zinc-300 hidden md:table-cell">₹{Number(lead.budget).toLocaleString()}</td>
                              <td className="py-3 pr-4">
                                <span className={cn(
                                  "px-2 py-0.5 rounded-sm font-bold uppercase text-[8px] tracking-tight",
                                  lead.status?.toUpperCase() === 'HOT' ? "bg-brand-emerald/10 text-brand-emerald" :
                                  lead.status?.toUpperCase() === 'CONVERTED' ? "bg-brand-indigo/10 text-brand-indigo" :
                                  "bg-zinc-800 text-zinc-400"
                                )}>
                                  {lead.status}
                                </span>
                              </td>
                              <td className="py-3 text-right font-mono text-brand-indigo font-bold">
                                ₹{Number(lead.revenue).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-zinc-600 font-mono uppercase tracking-widest italic">
                               <div className="flex flex-col items-center gap-2 text-center">
                                  <Activity className="text-zinc-600 animate-pulse" size={16} />
                                  <span className="text-zinc-600 font-mono uppercase tracking-widest text-[9px] italic">
                                     No Data Synchronized
                                  </span>
                                  <span className="text-zinc-700 font-mono text-[8px] uppercase">
                                     Check your Google Script connection
                                  </span>
                               </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Mode Meta Grid */}
            {currentMode && (
              <motion.div 
                key={currentMode + "-banner"}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-1"
              >
                <div className="bg-white border border-zinc-200 p-6 flex flex-col">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Target Strategy</span>
                  <h3 className="font-serif italic font-bold text-lg text-zinc-900">{MODE_INSIGHTS[currentMode].title}</h3>
                  <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">{MODE_INSIGHTS[currentMode].hint}</p>
                </div>
                <div className="bg-white border border-zinc-200 p-6 md:col-span-2">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-3 block">Operational Focus</span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {MODE_INSIGHTS[currentMode].tips.map(tip => (
                      <div key={tip} className="flex items-center gap-2 group">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-indigo group-hover:scale-125 transition-transform" />
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tight">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={cn(
                  "flex gap-6",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-10 h-10 shrink-0 flex items-center justify-center border",
                  msg.role === 'assistant' 
                    ? "bg-zinc-950 border-zinc-800 text-brand-indigo shadow-lg" 
                    : "bg-white border-zinc-200 text-zinc-400 shadow-sm"
                )}>
                  {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
                </div>
                
                <div className={cn(
                  "max-w-[85%] md:max-w-[75%] space-y-2",
                  msg.role === 'user' ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "flex items-center gap-3 px-1",
                    msg.role === 'user' && "flex-row-reverse"
                  )}>
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 font-mono">
                      // {msg.role === 'assistant' ? 'SYSTEM.LOG' : 'USER.INPUT'}
                    </span>
                    <span className="text-[9px] text-zinc-300 font-mono">
                      [{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                    </span>
                  </div>
                  <div className={cn(
                    "p-6 rounded-sm text-[14px] leading-relaxed",
                    msg.role === 'assistant' 
                      ? "bg-white border border-zinc-200 text-zinc-800 shadow-sm prose prose-sm prose-zinc max-w-none prose-p:leading-relaxed prose-strong:text-brand-indigo prose-strong:font-bold" 
                      : "bg-zinc-950 text-white border-zinc-800 font-medium"
                  )}>
                    {msg.role === 'assistant' ? (
                      <div>
                        <Markdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-3">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-3">{children}</ol>,
                            li: ({ children }) => <li className="text-zinc-600">{children}</li>,
                            h1: ({ children }) => <h1 className="text-lg font-serif italic font-bold text-zinc-900 mt-6 mb-3 border-b border-zinc-100 pb-1">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-serif italic font-bold text-zinc-900 mt-6 mb-3">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-bold text-zinc-800 mt-4 mb-2 uppercase tracking-tight">{children}</h3>,
                            p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                            a: ({ children, href }) => (
                              <a 
                                href={href} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-brand-indigo hover:underline font-bold"
                              >
                                {children}
                              </a>
                            ),
                            strong: ({ children }) => <strong className="font-bold text-brand-indigo">{children}</strong>,
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-2 border-brand-indigo/30 pl-4 py-1 italic text-zinc-500 my-4 bg-zinc-50/50">
                                {children}
                              </blockquote>
                            )
                          }}
                        >
                          {msg.content}
                        </Markdown>

                        {msg.id === 'welcome' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-6">
                            {[
                              { label: "🚀 Full Business Help", cmd: "https://docs.google.com/forms/d/e/1FAIpQLSd8uRsyJVbqqPmR1u3AEvQLj6QXn7klQ9KYTHMTGI2-t9N9Hw/viewform?usp=header", icon: Sparkles, isExternal: true },
                              { label: "Chat on WhatsApp", cmd: "https://wa.me/919330457995?text=Hi%20I%20submitted%20the%20form", icon: MessageSquare, isExternal: true },
                              { label: "Sales AI Agent", cmd: "/sales", icon: DollarSign },
                              { label: "CRM AI Agent", cmd: "/crm", icon: Users },
                              { label: "Support AI Agent", cmd: "/support", icon: Headset },
                              { label: "Analytics AI Agent", cmd: "/analytics", icon: BarChart3 },
                              { label: "Marketing AI Agent", cmd: "/marketing", icon: TrendingUp },
                              { label: "Growth AI Agent", cmd: "/growth", icon: Briefcase },
                              { label: "Scale Fast", cmd: "/scaling", icon: Target },
                            ].map((action) => (
                              <button
                                key={action.label}
                                onClick={() => {
                                  if ('isExternal' in action && action.isExternal) {
                                    window.open(action.cmd, '_blank');
                                  } else {
                                    handleSend(action.cmd);
                                  }
                                }}
                                className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-200 hover:border-brand-indigo hover:bg-brand-indigo/5 transition-all text-left group"
                              >
                                <action.icon size={14} className="text-zinc-400 group-hover:text-brand-indigo" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-brand-indigo leading-tight">{action.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-6 items-center"
                  >
                    <div className="w-10 h-10 bg-zinc-950 border border-zinc-800 text-brand-indigo flex items-center justify-center animate-pulse">
                      <Bot size={20} />
                    </div>
                    <div className="flex gap-2 p-3 bg-white border border-zinc-200 px-4 items-center">
                      <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 bg-brand-indigo animate-bounce [animation-delay:-0.32s]" />
                        <div className="w-1.5 h-1.5 bg-brand-indigo animate-bounce [animation-delay:-0.16s]" />
                        <div className="w-1.5 h-1.5 bg-brand-indigo animate-bounce" />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 ml-4 uppercase tracking-[0.2em] animate-pulse">BizAI.LOG: Processing</span>
                    </div>
                  </motion.div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Command Input Rail */}
        <AnimatePresence>
          {currentMode !== 'Admin Control Center' && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 md:p-8 pt-0 bg-gradient-to-t from-[#fafafa] via-[#fafafa] to-transparent z-40"
            >
              <div className="max-w-4xl mx-auto">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-brand-indigo/20 to-brand-emerald/20 blur opacity-0 group-focus-within:opacity-100 transition-opacity rounded-sm" />
                  <div className="relative flex shadow-xl shadow-zinc-200/50 border border-zinc-200 overflow-hidden bg-white items-end border-b-0 sm:border-b">
                    <div className="hidden sm:flex items-center px-4 h-12 md:h-14 bg-zinc-50 border-r border-zinc-200 text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-widest">
                      CMD {'>'}
                    </div>
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      rows={Math.min(5, input.split('\n').length || 1)}
                      placeholder={isLoading ? "SYSTEM PROCESSING..." : "EXECUTE COMMAND..."}
                      disabled={isLoading}
                      className="flex-1 bg-transparent py-3 md:py-4 px-4 md:px-6 text-sm font-medium focus:outline-none placeholder:text-zinc-300 uppercase tracking-tight resize-none max-h-40"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isLoading}
                      className={cn(
                        "px-4 sm:px-8 h-12 md:h-14 transition-all flex items-center justify-center border-l",
                        input.trim() && !isLoading 
                          ? "bg-zinc-950 text-white hover:bg-brand-indigo border-zinc-800" 
                          : "bg-zinc-50 text-zinc-300 border-zinc-100 cursor-not-allowed"
                      )}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
                <div className="mt-2 md:mt-4 flex flex-col sm:flex-row justify-between items-center px-2 gap-2">
                  <span className="text-[7px] md:text-[8px] font-mono text-zinc-400 uppercase tracking-[0.2em] md:tracking-[0.3em]">SECURE.ENCRYPTED.NODE</span>
                  <div className="flex items-center gap-3 md:gap-4">
                    <span className="text-[7px] md:text-[8px] font-mono text-zinc-400 uppercase">Ver: 3.2.0-STABLE</span>
                    <div className="flex items-center gap-1.5">
                      <span className={cn("w-1 h-1 rounded-full", isLoading ? "bg-brand-indigo animate-pulse" : "bg-brand-emerald")} />
                      <span className={cn("text-[7px] md:text-[8px] font-mono uppercase tracking-tighter", isLoading ? "text-brand-indigo" : "text-brand-emerald")}>
                        {isLoading ? "Node Busy" : "Stable"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice AI Assistant - Floating Module */}
        <div className="fixed bottom-24 sm:bottom-32 right-4 sm:right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
          <AnimatePresence>
            {voiceError && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-rose-500 text-white text-[9px] md:text-[10px] font-bold px-3 py-2 rounded shadow-xl pointer-events-auto"
              >
                {voiceError}
              </motion.div>
            )}
            
            {isListening && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-zinc-950 border border-brand-indigo/50 p-3 md:p-4 rounded shadow-2xl flex items-center gap-3 md:gap-4 pointer-events-auto max-w-[200px] sm:max-w-none"
              >
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 1, 2].map((i, idx) => (
                    <motion.div 
                      key={idx}
                      animate={{ height: [4, 12, 6, 16, 4] }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 0.8, 
                        delay: idx * 0.1,
                      }}
                      className="w-1 bg-brand-indigo rounded-full"
                    />
                  ))}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest block leading-none">Voice AI Active</span>
                  <span className="text-[8px] text-brand-indigo font-mono animate-pulse uppercase mt-1">Listening for commands...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pointer-events-auto group relative">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={startVoiceAssistant}
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 group relative overflow-hidden",
                isListening 
                  ? "bg-brand-indigo ring-4 ring-brand-indigo/20" 
                  : "bg-zinc-950 border border-zinc-800 hover:border-brand-indigo/50"
              )}
            >
              {isListening ? (
                <Volume2 size={24} className="text-white animate-pulse" />
              ) : (
                <Mic size={24} className={cn("transition-colors", isListening ? "text-white" : "text-brand-indigo group-hover:text-white")} />
              )}
              
              {/* Animated Ring */}
              <div className={cn(
                "absolute inset-0 border-2 border-brand-indigo/40 rounded-full",
                isListening ? "animate-ping" : "opacity-0 group-hover:opacity-100 transition-opacity"
              )} />
              
              {/* Premium Glow */}
              <div className="absolute inset-0 bg-brand-indigo/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
            </motion.button>
            
            {/* Tooltip */}
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
               <span className="text-[9px] font-bold text-white uppercase tracking-widest">Business Voice Assistant</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
