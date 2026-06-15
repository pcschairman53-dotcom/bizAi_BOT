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
  ChevronRight,
  Layers,
  Phone
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
    { label: 'New Leads', count: stats.pipeline.new, color: 'text-zinc-500', bg: 'bg-zinc-800/30', icon: Sparkles },
    { label: 'Contacted', count: stats.pipeline.contacted, color: 'text-sky-500', bg: 'bg-sky-500/10', icon: MessageSquare },
    { label: 'Follow-Ups', count: stats.pipeline.followup, color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock },
    { label: 'Converted', count: stats.pipeline.converted, color: 'text-brand-emerald', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
    { label: 'Closed', count: stats.pipeline.closed, color: 'text-rose-500', bg: 'bg-rose-500/10', icon: XCircle },
  ];

  return (
    <div className="glass-card neon-glow-indigo p-4 md:p-8 rounded-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-indigo/10 to-transparent opacity-50" />
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-white text-lg font-bold tracking-tight flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-indigo/20 rounded-lg flex items-center justify-center">
                <RefreshCcw size={18} className="text-brand-indigo animate-spin-slow" />
              </div>
              Lead Pipeline Automation
            </h3>
            <p className="text-[11px] text-zinc-500 mt-1 uppercase font-bold tracking-[0.2em]">Matrix Flow Analysis</p>
          </div>
          <div className="flex items-center gap-2">
             <div className="px-4 py-1.5 bg-brand-indigo/10 border border-brand-indigo/30 rounded-full text-[10px] font-bold text-brand-indigo uppercase tracking-wider">Stream Active</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          {steps.map((step, i) => (
            <motion.div 
              key={`pipeline-step-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 border border-white/5 p-4 rounded-xl hover:bg-white/10 transition-all group/card relative overflow-hidden h-full flex flex-col justify-between"
            >
              <div className={cn("absolute top-0 right-0 p-2 opacity-5 scale-150", step.color)}>
                <step.icon size={48} />
              </div>
              <div className="flex items-center gap-2 mb-4">
                 <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", step.bg, step.color)}>
                    <step.icon size={14} />
                 </div>
                 <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{step.label}</span>
              </div>
              <div className="text-3xl font-mono font-bold text-white mb-3">{step.count}</div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(step.count / (Math.max(1, stats.totalLeads))) * 100}%` }}
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
      title: `${stats.pipeline.followup} Priority Leads Identified`, 
      description: 'System detected pending critical follow-ups. Automated re-engagement could recover 15% revenue leakage.',
      status: 'URGENT',
      icon: Clock,
      color: 'text-rose-500',
      glow: 'shadow-[0_0_15px_-5px_rgba(244,63,94,0.4)]'
    },
    { 
      id: 2, 
      title: 'High-Value Conversion Detected', 
      description: `Targeting active leads could yield ₹${(stats.pipeline.followup * 25000).toLocaleString()} in upcoming pipeline growth.`,
      status: 'PREMIUM',
      icon: Target,
      color: 'text-brand-emerald',
      glow: 'shadow-[0_0_15px_-5px_rgba(16,185,129,0.4)]'
    },
    { 
      id: 3, 
      title: 'Growth Vector Strengthening', 
      description: `Acquisition velocity is up. BizAI marked ${stats.pipeline.new} new assets in the primary matrix today.`,
      status: 'OPTIMAL',
      icon: Sparkles,
      color: 'text-brand-indigo',
      glow: 'shadow-[0_0_15px_-5px_rgba(99,102,241,0.4)]'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 md:p-8 rounded-2xl relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
         <Bot size={140} className="text-brand-indigo" />
      </div>

      <div className="flex items-center justify-between mb-8 md:mb-10">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative">
            <div className="absolute -inset-2 bg-brand-indigo/30 rounded-full blur animate-pulse" />
            <div className="relative w-10 h-10 md:w-12 md:h-12 bg-zinc-950 border border-white/10 rounded-2xl flex items-center justify-center text-brand-indigo shadow-inner">
               <Bot className="w-6 h-6 md:w-7 md:h-7" />
            </div>
          </div>
          <div>
            <h3 className="text-[12px] md:text-[13px] font-bold text-white uppercase tracking-[0.2em] leading-none">AI Insight Matrix</h3>
            <p className="text-[9px] md:text-[10px] text-zinc-500 mt-2 uppercase font-bold tracking-tight">Real-time Autonomous Strategic Analysis</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3">
           <span className="w-2.5 h-2.5 bg-brand-emerald rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
           <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Engine Optimized</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {recommendations.map((rec) => (
          <motion.div 
            key={`rec-item-${rec.id}`}
            whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
            className={cn(
              "p-5 md:p-6 rounded-2xl border border-white/5 bg-white/5 relative group transition-all duration-500 h-full flex flex-col justify-between",
              rec.glow
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-4 md:mb-6">
                 <div className={cn("w-9 h-9 md:w-10 md:h-10 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center shadow-lg", rec.color)}>
                    <rec.icon className="w-[18px] h-[18px] md:w-5 md:h-5" />
                 </div>
                 <span className={cn(
                   "text-[8px] md:text-[9px] font-black px-2.5 py-1 md:py-1.5 rounded-full uppercase tracking-widest shadow-lg border border-white/5",
                   rec.status === 'URGENT' ? "bg-rose-500 text-white" : 
                   rec.status === 'PREMIUM' ? "bg-brand-emerald text-white" : 
                   "bg-brand-indigo text-white"
                 )}>
                   {rec.status}
                 </span>
              </div>
              <h4 className="text-[13px] md:text-[14px] font-bold text-white mb-2 md:mb-3 leading-tight tracking-tight">{rec.title}</h4>
              <p className="text-[10px] md:text-[11px] text-zinc-400 leading-relaxed font-medium">{rec.description}</p>
            </div>
            
            <div className="mt-5 md:mt-6 flex items-center gap-2 text-[9px] md:text-[10px] font-bold text-brand-indigo opacity-0 group-hover:opacity-100 transition-opacity">
              <span>INITIALIZE AI TAKEOVER</span>
              <ArrowRight size={12} />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function BusinessOperationsCenter({ stats }: { stats: DashboardStats }) {
  const overviewMetrics = [
    { label: 'Active Clients', val: stats.pipeline?.converted || 12, icon: CheckCircle2, color: 'text-brand-emerald', bg: 'bg-emerald-500/10' },
    { label: 'Pending Follow-ups', val: stats.pipeline?.followup || 8, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Revenue Opportunities', val: stats.revenueEstimate ? `₹${stats.revenueEstimate.toLocaleString()}` : '₹3,50,000', icon: DollarSign, color: 'text-brand-indigo', bg: 'bg-indigo-500/10' },
  ];

  const quickActions = [
    { 
      label: 'Generate Proposal', 
      desc: 'Create conversion layouts', 
      icon: Briefcase, 
      url: 'https://wa.me/919330457995?text=Hi%20BizAI,%20I%20want%20to%20generate%20a%20business%20proposal' 
    },
    { 
      label: 'Website Audit', 
      desc: 'Detect performance leaks', 
      icon: Layers, 
      url: 'https://docs.google.com/forms/d/e/1FAIpQLSd8uRsyJVbqqPmR1u3AEvQLj6QXn7klQ9KYTHMTGI2-t9N9Hw/viewform?usp=header' 
    },
    { 
      label: 'WhatsApp Follow-up', 
      desc: 'Activate pipeline push', 
      icon: MessageSquare, 
      url: 'https://wa.me/919330457995?text=Hi%20BizAI,%20I%20want%20to%20activate%20my%20WhatsApp%20follow-up%20strategy' 
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card neon-glow-indigo p-5 md:p-8 rounded-2xl relative overflow-hidden group/ops mt-6 border-white/5"
      id="business-operations-center"
    >
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover/ops:opacity-[0.05] transition-opacity pointer-events-none">
        <Briefcase size={120} className="text-brand-indigo" />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-white text-lg font-bold tracking-tight flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-indigo/20 rounded-lg flex items-center justify-center">
                <Briefcase size={18} className="text-brand-indigo" />
              </div>
              Business Operations Center
            </h3>
            <p className="text-[11px] text-zinc-500 mt-1 uppercase font-bold tracking-[0.2em]">Operational Efficiency Command</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-4 py-1.5 bg-zinc-900/50 border border-white/10 rounded-full text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-indigo rounded-full animate-pulse" />
              Operations Panel Active
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Module 1: Business Overview */}
          <div className="p-5 bg-white/5 border border-white/5 rounded-xl shadow-xl backdrop-blur-sm flex flex-col justify-between">
            <div>
              <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                <Activity size={14} className="text-brand-indigo animate-pulse" />
                Business Overview
              </h4>
              <div className="space-y-4">
                {overviewMetrics.map((step, idx) => (
                  <div key={`overview-m-${idx}`} className="flex items-center justify-between p-3 bg-zinc-950/20 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", step.bg, step.color)}>
                        <step.icon size={14} />
                      </div>
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{step.label}</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-white">{step.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Module 2: Quick Actions */}
          <div className="p-5 bg-white/5 border border-white/5 rounded-xl shadow-xl backdrop-blur-sm flex flex-col justify-between">
            <div>
              <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                <Cpu size={14} className="text-brand-indigo" />
                Quick Actions
              </h4>
              <div className="grid grid-cols-1 gap-2.5">
                {quickActions.map((act, idx) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={`ops-act-${idx}`}
                      onClick={() => window.open(act.url, '_blank')}
                      className="w-full flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 hover:border-brand-indigo/30 hover:bg-white/[0.06] transition-all rounded-xl text-left group/btn cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg text-zinc-400 group-hover/btn:text-white transition-colors">
                          <Icon size={14} />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-white uppercase tracking-wider block">{act.label}</span>
                          <span className="text-[9px] text-zinc-500 font-bold block">{act.desc}</span>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-zinc-500 group-hover/btn:text-white transition-transform group-hover/btn:translate-x-0.5" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Module 3: Consultation CTA */}
          <div className="p-5 bg-gradient-to-br from-brand-indigo/10 via-transparent to-brand-indigo/5 border border-white/5 rounded-xl shadow-xl flex flex-col justify-between relative overflow-hidden group/cta">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-indigo/5 via-transparent to-transparent opacity-50 pointer-events-none" />
            <div className="relative z-10 flex flex-col h-full justify-between gap-4">
              <div>
                <h4 className="text-[11px] font-bold text-white uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                  <Sparkles size={14} className="text-brand-indigo animate-pulse" />
                  Scale Priority
                </h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-medium mt-3">
                  Deploy premium operational acceleration systems. Upgrade customized enterprise pipeline nodes in collaboration with our master growth consultants.
                </p>
              </div>

              <motion.button
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 0 25px rgba(99, 102, 241, 0.4)"
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.open('https://wa.me/919330457995?text=Hi%20PCS%20Consultancy,%20I%20want%20to%20upgrade%20my%20AI%20automation%20system', '_blank')}
                className="w-full py-3 bg-brand-indigo text-white hover:bg-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
              >
                <Phone size={14} />
                <span>Book Premium Consultation</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-white/5 rounded-xl", className)} />
);

function AdminDashboard({ stats, leads, activities, setMode, onUpdateStatus, isSyncing, setIsSyncing }: AdminDashboardProps) {
  const isLoading = stats.totalLeads === 0 && leads.length === 0 && activities.length <= 1;

  return (
    <div className="space-y-6 md:space-y-8 pb-12 md:pb-24">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-2 md:mb-4">
        <div>
           <h2 className="text-xl md:text-2xl font-serif italic font-bold text-white leading-none">Matrix Command Center</h2>
           <p className="text-[9px] md:text-[11px] text-zinc-500 mt-2 md:mt-3 uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold">Autonomous Control & Node Monitoring</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
           <div className="bg-zinc-900 border border-zinc-800 px-3 md:px-4 py-1.5 md:py-2 rounded-xl flex items-center gap-2 md:gap-3 shadow-lg shadow-black/40">
              <div className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse neon-glow-emerald" />
              <span className="text-[9px] md:text-[10px] font-bold text-white uppercase tracking-widest">Network Active</span>
           </div>
           <div className="bg-zinc-900 border border-zinc-800 px-3 md:px-4 py-1.5 md:py-2 rounded-xl flex items-center gap-2 md:gap-3 shadow-lg shadow-black/40">
              <RefreshCcw size={12} className={cn("text-brand-indigo", isSyncing && "animate-spin")} />
              <span className="text-[9px] md:text-[10px] font-bold text-white uppercase tracking-widest leading-none">
                {isSyncing ? "Syncing Logic..." : "Stream Nominal"}
              </span>
           </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {isLoading ? (
          [0, 1, 2, 3].map((i) => <Skeleton key={`kpi-skeleton-${i}`} className="h-32" />)
        ) : (
          [
                { label: 'Total Matrix Leads', val: stats.totalLeads, icon: User, color: 'text-brand-indigo' },
                { label: 'Live Pipeline', val: stats.pipeline.new + stats.pipeline.contacted + stats.pipeline.followup, icon: ActivityIcon, color: 'text-amber-500' },
                { label: 'Conversion Velocity', val: stats.pipeline.converted, icon: CheckCircle2, color: 'text-brand-emerald' },
                { label: 'Optimal Growth', val: leads.length > 0 ? (stats.pipeline.converted / leads.length * 100).toFixed(0) + '%' : '0%', icon: Sparkles, color: 'text-brand-indigo' }
          ].map((kpi, i) => (
            <motion.div 
              key={`kpi-stat-${i}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5 rounded-2xl shadow-xl hover:bg-white/5 transition-all group border-white/5 h-full flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{kpi.label}</span>
                <div className="p-2 bg-white/5 rounded-lg">
                  <kpi.icon size={14} className={kpi.color} />
                </div>
              </div>
              <div>
                <div className="text-3xl font-mono font-bold text-white tracking-tighter">{kpi.val}</div>
                <div className="mt-5 h-1.5 bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ 
                      width: typeof kpi.val === 'number' 
                        ? `${Math.min(100, (kpi.val / (Math.max(1, stats.totalLeads || 100))) * 100)}%` 
                        : (String(kpi.val).includes('%') ? kpi.val : '100%') 
                    }}
                    className={cn("h-full", kpi.color.replace('text-', 'bg-'))} 
                   />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <LeadPipelineOverview stats={stats} />
      
      <BusinessOperationsCenter stats={stats} />
      
      <AiRecommendationEngine stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Lead Pipeline Status Breakdown */}
        <div className="lg:col-span-2 glass-card p-4 md:p-8 rounded-2xl shadow-2xl relative overflow-hidden group border-white/5">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
             <Layers size={60} className="text-brand-indigo" />
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-white/5 pb-6">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
              <Users size={18} className="text-brand-indigo animate-pulse" />
              VECTOR PIPELINE ANALYSIS
            </h3>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-none">Global Network Sync</span>
              <div className="w-2.5 h-2.5 rounded-full bg-brand-emerald animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
          </div>
          
          <div className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-4">
              {[
                { label: 'New Nodes', count: stats.pipeline.new, color: 'text-zinc-400 bg-white/5' },
                { label: 'Contacted', count: stats.pipeline.contacted, color: 'text-sky-400 bg-sky-500/10 shadow-[0_0_15px_rgba(14,165,233,0.1)]' },
                { label: 'Follow-Up', count: stats.pipeline.followup, color: 'text-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.1)]' },
                { label: 'Converted', count: stats.pipeline.converted, color: 'text-brand-emerald bg-brand-emerald/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]' },
                { label: 'Closed Sync', count: stats.pipeline.closed, color: 'text-rose-500 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.1)]' },
              ].map((stage) => (
                <div key={`analytical-stage-${stage.label}`} className="p-4 md:p-5 bg-white/5 border border-white/5 rounded-2xl text-center group/stage hover:bg-white/10 transition-all cursor-crosshair">
                  <div className="text-xl md:text-2xl font-mono font-black text-white shadow-xl">{stage.count}</div>
                  <div className={cn("text-[8px] md:text-[9px] font-black uppercase mt-2 px-2 py-1 rounded-lg border border-transparent", stage.color)}>{stage.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-black/20 border border-white/5 p-6 rounded-2xl shadow-inner backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em] leading-none">Distributed Asset Load</span>
                 <span className="text-[11px] font-mono font-black text-brand-emerald">{stats.totalLeads > 0 ? "OPTIMIZED" : "LOADING"}</span>
              </div>
              <div className="flex h-5 w-full rounded-full overflow-hidden border border-white/5 bg-zinc-900/50 p-1">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(stats.pipeline.new / (stats.totalLeads || 1)) * 100}%` }} className="h-full bg-zinc-600 rounded-full" />
                <motion.div initial={{ width: 0 }} animate={{ width: `${(stats.pipeline.contacted / (stats.totalLeads || 1)) * 100}%` }} className="h-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)] rounded-full -ml-1 border-l-2 border-zinc-950" />
                <motion.div initial={{ width: 0 }} animate={{ width: `${(stats.pipeline.followup / (stats.totalLeads || 1)) * 100}%` }} className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] rounded-full -ml-1 border-l-2 border-zinc-950" />
                <motion.div initial={{ width: 0 }} animate={{ width: `${(stats.pipeline.converted / (stats.totalLeads || 1)) * 100}%` }} className="h-full bg-brand-emerald shadow-[0_0_10px_rgba(16,185,129,0.5)] rounded-full -ml-1 border-l-2 border-zinc-950" />
                <motion.div initial={{ width: 0 }} animate={{ width: `${(stats.pipeline.closed / (stats.totalLeads || 1)) * 100}%` }} className="h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] rounded-full -ml-1 border-l-2 border-zinc-950" />
              </div>
              <div className="flex justify-between mt-4 text-center px-1">
                {['QUEUE', 'ACTIVE', 'PULSE', 'CORE', 'VAULT'].map((l, i) => (
                  <span key={`node-l-${i}`} className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{l}</span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-brand-indigo/10 border border-brand-indigo/20 p-6 rounded-2xl text-white overflow-hidden relative group/ai shadow-lg shadow-indigo-950/20">
                <div className="absolute -top-4 -right-4 p-8 opacity-10 group-hover:scale-110 transition-transform">
                   <Target size={100} className="text-brand-indigo" />
                </div>
                <div className="relative z-10">
                   <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-indigo mb-4 flex items-center gap-2">
                     <Cpu size={14} />
                     CORE LOGIC INTEGRITY
                   </h4>
                   <div className="space-y-3">
                     <div className="flex justify-between text-[11px] font-black text-white/80">
                       <span className="uppercase tracking-widest">Pipeline Accuracy</span>
                       <span className="text-brand-emerald font-mono">99.8%</span>
                     </div>
                     <div className="h-2 bg-black/40 rounded-full overflow-hidden p-[1px] border border-white/5">
                       <motion.div initial={{ width: 0 }} animate={{ width: '99.8%' }} transition={{ duration: 2 }} className="h-full bg-brand-indigo rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                     </div>
                   </div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/5 p-6 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer group shadow-xl">
                <div>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-2">Vector Throughput</h4>
                   <p className="text-2xl font-mono font-black text-white tracking-tighter group-hover:text-brand-emerald transition-colors">1.82 Nodes/Day</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-brand-emerald/10 border border-brand-emerald/20 flex items-center justify-center text-brand-emerald shadow-lg group-hover:scale-110 transition-transform">
                   <TrendingUp size={28} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Table - Live Admin Actions */}
        <div className="glass-card rounded-2xl shadow-2xl overflow-hidden flex flex-col border-white/5 lg:col-span-1">
          <div className="p-4 md:p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
               <div className="w-7 h-7 md:w-8 md:h-8 bg-brand-indigo/20 rounded-lg flex items-center justify-center text-brand-indigo">
                  <Database size={14} className="md:size-[16px]" />
               </div>
               <h3 className="text-[12px] md:text-sm font-black text-white uppercase tracking-[0.1em]">Node Management</h3>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-brand-emerald animate-pulse" />
               <span className="text-[8px] md:text-[9px] font-black text-zinc-500 uppercase tracking-widest">LIVE</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px] md:max-h-[520px] custom-scrollbar p-2">
            {leads.length > 0 ? (
              leads.slice(0, 15).map((lead, i) => (
                <div key={`admin-lead-${i}`} className="p-4 mb-2 bg-white/5 rounded-2xl border border-transparent hover:border-white/10 hover:bg-white/[0.08] transition-all group/lead cursor-pointer shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-white tracking-tight group-hover:text-brand-indigo transition-colors">{lead.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono font-bold mt-1 uppercase tracking-tighter">{lead.service || 'UNCLASSIFIED'}</span>
                    </div>
                    <StatusBadge status={lead.status} />
                  </div>
                  <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                    <select 
                      value={lead.status}
                      onChange={(e) => onUpdateStatus(lead.name, e.target.value)}
                      className="flex-1 text-[10px] font-black bg-zinc-900 text-zinc-400 border border-white/5 rounded-xl px-3 py-2 outline-none focus:border-brand-indigo focus:text-white transition-all appearance-none cursor-pointer hover:bg-zinc-800"
                    >
                      <option value="NEW">MARK: RAW NODE</option>
                      <option value="CONTACTED">STATUS: CONTACTED</option>
                      <option value="FOLLOW-UP">STAGE: PERSISTENT</option>
                      <option value="CONVERTED">CORE: INTEGRATED</option>
                      <option value="CLOSED">LOGS: TERMINATED</option>
                    </select>
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-brand-indigo transition-all">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              ))
            ) : isSyncing ? (
              <div className="flex flex-col items-center justify-center py-20 text-center h-full">
                <RefreshCcw size={32} className="text-brand-indigo mb-4 animate-spin" />
                <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em]">RECALIBRATING MATRIX...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center h-full opacity-40">
                <Database size={40} className="text-zinc-500 mb-4" />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">NODE STREAMS DISCONNECTED</span>
                <p className="text-[9px] text-zinc-600 mt-2 uppercase font-mono">Verify uplink protocols</p>
              </div>
            )}
          </div>
          <button className="p-5 bg-white/5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] hover:text-white hover:bg-brand-indigo transition-all border-t border-white/5">
            DOWNLOAD FULL TRANSACTION LOG
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
             <ActivityIcon size={18} className="text-brand-indigo animate-pulse" />
             Strategic Movement Log
          </h3>
          <button 
            onClick={() => setIsSyncing(true)}
            className="px-4 py-2 bg-brand-indigo/10 border border-brand-indigo/30 text-[10px] font-black text-brand-indigo uppercase rounded-xl hover:bg-brand-indigo hover:text-white transition-all shadow-lg"
          >
            FORCE SECURE SYNC
          </button>
        </div>
        <div className="space-y-3">
          {activities.slice(0, 6).map((log) => (
            <div key={`act-summary-${log.id}`} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-brand-indigo/30 hover:bg-white/10 transition-all group shadow-xl">
               <div className="flex items-center gap-5">
                  <div className={cn(
                    "w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border transition-all",
                    log.type === 'lead' ? "bg-brand-emerald/10 border-brand-emerald/20 text-brand-emerald" : "bg-brand-indigo/10 border-brand-indigo/20 text-brand-indigo"
                  )}>
                    {log.type === 'lead' ? <Users size={16} /> : <ActivityIcon size={16} />}
                  </div>
                  <div>
                     <p className="text-[13px] font-bold text-zinc-100 group-hover:text-white transition-colors">{log.message}</p>
                     <span className="text-[9px] text-zinc-500 font-mono font-black uppercase mt-1 inline-block tracking-tighter opacity-60">{log.timestamp.toLocaleTimeString()}</span>
                  </div>
               </div>
               {log.status && (
                 <div className="hidden sm:block">
                   <StatusBadge status={log.status} />
                 </div>
               )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Management Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 pb-12 md:pb-24">
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
                  <div key={`source-stat-${label}`} className="space-y-1.5">
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
                <div key={`skeleton-source-${i}`} className="space-y-1.5 animate-pulse">
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
                <div key={`client-port-${i}`} className="flex items-center justify-between p-3 bg-zinc-950/50 border border-zinc-800 hover:border-brand-indigo transition-colors group/client">
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

const preprocessMessageContent = (content: string): string => {
  if (!content) return '';
  
  let formatted = content.replace('[RETRY COMMAND](button:retry)', '');

  // Clean URL for BizAI onboarding form
  const onboardingFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSd8uRsyJVbqqPmR1u3AEvQLj6QXn7klQ9KYTHMTGI2-t9N9Hw/viewform?usp=header";

  // Non-lookbehind safe regex to match both markdown links and raw URLs
  const linkRegex = /\[([^\]]+)\]\((https:\/\/[^\s\)]+)\)|(https:\/\/docs\.google\.com\/forms\/[^\s\)]+)|(https:\/\/wa\.me\/[^\s\)]+)/gi;

  formatted = formatted.replace(linkRegex, (match, p1, p2, p3, p4) => {
    if (p1 && p2) {
      if (p2.includes('docs.google.com/forms') || p2.includes('google.com/forms')) {
        return `[📝 Fill Onboarding Form](${onboardingFormUrl})`;
      }
      if (p2.includes('wa.me')) {
        if (p2.includes('Google%20Sheets') || p2.includes('Google Sheets')) {
          return `[📊 Activate Analytics](${p2})`;
        }
        return `[📲 Connect on WhatsApp](${p2})`;
      }
      return match;
    }
    if (p3) {
      return `[📝 Fill Onboarding Form](${onboardingFormUrl})`;
    }
    if (p4) {
      if (p4.includes('Google%20Sheets') || p4.includes('Google Sheets')) {
        return `[📊 Activate Analytics](${p4})`;
      }
      return `[📲 Connect on WhatsApp](${p4})`;
    }
    return match;
  });

  return formatted;
};

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
  const isSyncingRef = useRef(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const generateId = (prefix: string = '') => `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Live Dashboard - Real Google Sheets data polling
  useEffect(() => {
    let lastLeadName = '';
    let isMounted = true;
    
    const updateDashboard = async () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      setIsSyncing(true);
      
      try {
        const liveLeads = await fetchLiveLeads();
        if (!isMounted) return;

        if (!liveLeads || liveLeads.length === 0) {
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
              id: generateId('lead-'),
              type: 'lead' as const,
              message: `Live Lead Detected: ${latestLead.name} (${latestLead.service})`,
              timestamp: new Date(),
              status: Number(String(latestLead.budget).replace(/[^0-9.-]+/g, "")) > 10000 ? 'HOT' : 'NEW'
            }, ...prev].slice(0, 10));
          } else {
            // Log sync success on first load
            setActivities(prev => [{
              id: generateId('sync-'),
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
            id: generateId('error-'),
            type: 'system' as const,
            message: `⚠️ Sync Failed: Data stream connection interrupted.`,
            timestamp: new Date()
          }, ...prev].slice(0, 10));
        }
      } finally {
        if (isMounted) {
          isSyncingRef.current = false;
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
      id: generateId('update-'),
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
            id: generateId('ai-'),
            role: 'assistant',
            content: content,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, { id: generateId('user-cmd-'), role: 'user', content: textToSend, timestamp: new Date() }, systemMsg]);
          setInput('');
          return;
        }
        
        // If there's remaining text, we treat it as a message after switching mode
        textToSend = remainingText;
      }
    }

    const userMsg: Message = {
      id: generateId('user-'),
      role: 'user',
      content: overrideInput || input, // Use full text including command for history if needed, or stripped? Let's use what the user typed.
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const performRequest = async (retryCount = 0) => {
      try {
        const response = await chatWithAssistant([...messages, userMsg], currentMode, language);
        const assistantMsg: Message = {
          id: generateId('ai-'),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMsg]);
      } catch (error: any) {
        if (retryCount < 1 && !error.message?.includes('Key') && !error.message?.includes('401')) {
           // Reduced auto-retry for faster feedback, and skip for known config errors
           console.log(`Retrying... (${retryCount + 1})`);
           await new Promise(r => setTimeout(r, 2000));
           return performRequest(retryCount + 1);
        }

        let errorContent = "### ⚠️ STRATEGIC CONNECTION INTERRUPTED\n\nI couldn't reach the BizAI Core. This is usually due to network congestion or high traffic.\n\n**OPTIONS:**\n\n1. [RETRY COMMAND](button:retry)\n2. [Switch to WhatsApp Support](https://wa.me/919330457995?text=Hi%20BizAI%20is%20down%20for%20me)\n\n*Your command history has been saved.*";
        
        if (error.message?.includes('missing')) {
          errorContent = "### ⚠️ **API KEY REGISTRATION REQUIRED**\n\nThe `GEMINI_API_KEY` is not detected. Please ensure you have configured it in your project environment settings.";
        } else if (error.message?.includes('invalid') || error.message?.includes('Key')) {
          errorContent = "### ⚠️ **KEY AUTHENTICATION FAILED**\n\nThe provided API code was rejected by the Gemini system. Please check your credentials.";
        }

        const errorMsg: Message = {
          id: generateId('error-'),
          role: 'assistant',
          content: errorContent,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMsg]);
        showToast("Node Link Lost: " + (error.message || "Unknown error"), 'error');
      } finally {
        setIsLoading(false);
      }
    };

    await performRequest();
  };

  const handleRetry = () => {
    // Find the last user message
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      // Remove any trailing error message
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.id.startsWith('error-')) {
          return prev.slice(0, -1);
        }
        return prev;
      });
      handleSend(lastUserMsg.content);
    }
  };

  return (
    <div className="flex bg-zinc-950 text-zinc-100 font-sans selection:bg-brand-indigo/10 overflow-hidden h-[100dvh] w-full relative">
      {/* Mobile Sidebar Overlay Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
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
            className="w-72 md:w-80 bg-zinc-950 border-r border-zinc-800 flex flex-col z-50 fixed lg:sticky lg:top-0 lg:h-[100dvh] text-zinc-400 shadow-2xl lg:shadow-none font-sans"
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
                      key={`mode-option-${mode}`}
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
                        key={`lang-opt-${lang.id}`}
                        onClick={() => {
                          setLanguage(lang.id as Language);
                          setActivities(prev => [{
                            id: generateId('lang-'),
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
      <main className="flex-1 flex flex-col min-w-0 bg-zinc-950 relative overflow-hidden h-full">
        {/* Technical Header */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-4 md:px-8 bg-zinc-950/80 backdrop-blur-lg z-30 shrink-0 sticky top-0 shadow-lg shadow-black/20">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 bg-zinc-900 border border-zinc-700/50 rounded-lg text-white transition-all active:scale-95"
            >
              <Users size={18} />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none hidden sm:inline">Portal</span>
                <span className="text-sm font-bold text-white tracking-tight truncate max-w-[120px] xs:max-w-[180px] sm:max-w-none">
                  {currentMode || "Startup"}
                </span>
              </div>
              <span className="text-[8px] font-mono text-brand-indigo leading-none font-bold uppercase tracking-tighter">BizAI Matrix Engine</span>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
             <div className="hidden lg:flex items-center gap-8">
              <div className="flex flex-col items-end">
                <span className="text-[8px] uppercase font-bold text-zinc-500 tracking-widest">Network Speed</span>
                <span className="text-[10px] font-mono text-brand-emerald">10GBPS</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[8px] uppercase font-bold text-zinc-500 tracking-widest">Sync Priority</span>
                <span className={cn("text-[10px] font-mono", leads.length > 0 ? "text-brand-emerald" : "text-amber-500")}>
                  {leads.length > 0 ? "ULTRA" : "HIGH"}
                </span>
              </div>
             </div>
             <button 
              onClick={() => setMessages([messages[0]])}
              className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all shadow-sm"
              title="Reset System"
             >
                <RefreshCcw size={16} />
             </button>
             <div className="w-10 h-10 rounded-xl border border-zinc-800 bg-zinc-900 p-0.5 overflow-hidden group hover:border-brand-indigo transition-colors cursor-pointer shrink-0 shadow-lg shadow-brand-indigo/10">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent("pcschair")}`} alt="User" className="w-full h-full object-cover" />
             </div>
          </div>
        </header>

        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 50, x: '-50%' }}
              className={cn(
                "fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border backdrop-blur-xl transition-all",
                toast.type === 'error' ? "bg-rose-500/90 border-rose-400 text-white" : 
                toast.type === 'success' ? "bg-emerald-500/90 border-emerald-400 text-white" :
                "bg-zinc-900/90 border-zinc-700 text-white"
              )}
            >
              <div className="p-1 rounded-lg bg-white/20">
                <AlertCircle size={16} />
              </div>
              <span className="text-[12px] font-bold uppercase tracking-widest">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Console Viewport */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-8 space-y-8 md:space-y-12 bg-zinc-950 relative custom-scrollbar overscroll-contain">
          {/* Subtle noise/gradient background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08),transparent_50%)] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto space-y-8 md:space-y-12 pb-32 relative z-10">
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
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card neon-glow-indigo p-4 md:p-8 rounded-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <LayoutDashboard size={120} className="text-brand-indigo" />
              </div>
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-indigo/20 rounded-2xl flex items-center justify-center text-brand-indigo shadow-lg">
                      <Activity size={24} className="animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-white text-xl font-bold tracking-tight">Enterprise Insight Matrix</h2>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold mt-1">
                        {isSyncing ? (
                          <>
                            <span className="text-brand-emerald block">BUSINESS ANALYTICS READY</span>
                            <span className="text-[8px] text-zinc-500 block mt-0.5 tracking-[0.15em]">WAITING FOR DATA INPUT</span>
                          </>
                        ) : `Operational Node Sync: ${lastSyncTime ? lastSyncTime.toLocaleTimeString() : 'Active'}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-white w-full md:w-auto">
                     <div className="flex items-center gap-3 bg-zinc-900/50 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md shadow-lg flex-1 md:flex-none justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-emerald animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#10b981]">
                           System Core Live
                        </span>
                     </div>
                  </div>
                </div>

                <div id="stats-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative">
                  {isSyncing && stats.totalLeads === 0 && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/65 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl">
                       <div className="text-center p-6">
                          <span className="text-[12px] font-black text-brand-emerald uppercase tracking-[0.25em] block mb-2">SYSTEM READY</span>
                          <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-[0.15em] block mb-1">Awaiting Lead Data</span>
                          <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest block">Google Form Integration Available</span>
                       </div>
                    </div>
                  )}
                  
                  {[
                    { 
                      label: 'Total Active Assets', 
                      val: stats.totalLeads.toLocaleString(), 
                      sub: stats.totalLeads > 0 ? `+${Math.floor(stats.totalLeads * 0.1)} Potential` : "Matrix Listening", 
                      color: 'text-brand-indigo', 
                      icon: Users 
                    },
                    { 
                      label: 'Conversion Velocity', 
                      val: `${stats.conversionRate}%`, 
                      sub: 'Network Performance', 
                      color: 'text-brand-emerald', 
                      icon: TrendingUp, 
                      progress: stats.conversionRate 
                    },
                    { 
                      label: 'Projected Revenue', 
                      val: `₹${(stats.revenueEstimate / 1000000).toFixed(2)}M`, 
                      sub: 'ROI Efficiency: 4.8x', 
                      color: 'text-brand-indigo', 
                      icon: DollarSign, 
                      spark: true 
                    },
                    { 
                      label: 'Node Connectivity', 
                      val: stats.totalLeads > 0 ? "ACTIVE" : "IDLE", 
                      sub: isSyncing ? "Updating Matrix..." : "Stable Connection", 
                      color: stats.totalLeads > 0 ? 'text-brand-emerald' : 'text-amber-500', 
                      icon: Bot, 
                      status: true 
                    }
                  ].map((card, idx) => (
                    <div key={`dashboard-card-${idx}`} className="bg-white/5 border border-white/5 p-5 rounded-2xl hover:bg-white/10 transition-all group/card shadow-xl min-h-[120px] flex flex-col justify-between relative backdrop-blur-sm h-full">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{card.label}</span>
                        <card.icon size={14} className={card.color} />
                      </div>
                      <div className="flex items-center gap-3">
                         <span className={cn("text-2xl font-mono font-bold leading-none", card.color === 'text-brand-indigo' ? 'text-white' : card.color)}>{card.val}</span>
                         {card.icon === TrendingUp && <TrendingUp size={16} className="text-brand-emerald mb-1 animate-bounce" />}
                      </div>
                      <div className="flex items-center justify-between mt-4">
                         <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">{card.sub}</span>
                         {card.spark && (
                           <div className="flex gap-0.5 h-4 items-end pr-1">
                              {(stats.heatmap && stats.heatmap.length > 0 ? stats.heatmap : [30, 50, 40, 70, 60, 90]).map((h, i) => (
                                 <div key={`heatmap-bar-${i}`} className="w-0.5 bg-brand-indigo/40 rounded-full" style={{ height: `${Math.max(20, h)}%` }} />
                              ))}
                           </div>
                         )}
                         {card.status && (
                           <div className={cn("w-2 h-2 rounded-full", isSyncing ? "bg-brand-indigo animate-spin" : "bg-brand-emerald")} />
                         )}
                      </div>
                      {card.progress !== undefined && (
                        <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${card.progress}%` }}
                             className="h-full bg-brand-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                           />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Activity Feed */}
                  <div className="lg:col-span-2 bg-white/5 border border-white/5 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                      <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.2em] flex items-center gap-3">
                        <Activity size={16} className="text-brand-indigo animate-pulse" />
                        NODE EVENT LOG
                      </h3>
                      <button className="text-[10px] text-zinc-500 hover:text-white uppercase font-black transition-colors">ARCHIVE LOGS</button>
                    </div>
                    <div className="space-y-4 max-h-[220px] overflow-y-auto pr-3 custom-scrollbar relative">
                      {activities.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-32 text-[10px] text-zinc-600 uppercase font-bold tracking-widest italic opacity-50">
                           <Database size={24} className="mb-2" />
                           Awaiting node pulses...
                        </div>
                      )}
                      {activities.map((activity) => (
                        <div key={`act-full-${activity.id}`} className="flex gap-4 text-[12px] group/item p-3 border border-transparent hover:border-white/5 hover:bg-white/5 rounded-xl transition-all">
                          <div className="flex flex-col items-center gap-1.5 py-1">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center shadow-lg",
                              activity.type === 'lead' ? "bg-brand-emerald/10 text-brand-emerald" : "bg-brand-indigo/10 text-brand-indigo"
                            )}>
                               {activity.type === 'lead' && <User size={14} />}
                               {activity.type === 'whatsapp' && <MessageSquare size={14} />}
                               {activity.type === 'system' && <Activity size={14} />}
                            </div>
                            <div className="w-[1px] h-full bg-zinc-800" />
                          </div>
                          <div className="flex-1 pb-1">
                            <div className="flex items-center justify-between mb-1">
                               <span className="font-bold text-zinc-100 group-hover/item:text-brand-indigo transition-colors">{activity.message}</span>
                               <span className="text-[10px] font-mono text-zinc-500 font-bold">{activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            {activity.status && (
                              <div className="flex items-center gap-2 mt-2">
                                <span className={cn(
                                  "text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider",
                                  activity.status === 'HOT' ? "bg-brand-emerald text-zinc-950 neon-glow-emerald" :
                                  activity.status === 'MEDIUM' ? "bg-amber-400 text-zinc-950" :
                                  "bg-white/10 text-zinc-300"
                                )}>
                                  {activity.status} TARGET
                                </span>
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">Verified by BizAI Core</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Funnel Optimization */}
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col">
                    <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                       <Filter size={16} className="text-brand-indigo" />
                       PIPELINE DYNAMICS
                    </h3>
                    
                    <div className="flex-1 space-y-6">
                       <div className="relative pt-2">
                          <div className="flex flex-col gap-3">
                             {[
                               { label: 'Network Scan', val: stats.totalLeads * 4, color: 'bg-zinc-800' },
                               { label: 'Strategic Hits', val: stats.totalLeads * 2, color: 'bg-zinc-700' },
                               { label: 'Validated Assets', val: stats.totalLeads, color: 'bg-brand-indigo shadow-[0_0_10px_rgba(99,102,241,0.5)]' },
                               { label: 'Conversion Success', val: stats.pipeline.converted, color: 'bg-brand-emerald shadow-[0_0_10px_rgba(16,185,129,0.5)]' }
                             ].map((step, idx) => (
                              <div key={`funnel-step-${idx}`} className="group/funnel">
                                 <div className="flex justify-between text-[9px] font-black text-zinc-500 uppercase mb-2 tracking-widest">
                                    <span>{step.label}</span>
                                    <span className="text-white font-mono">{step.val.toLocaleString()}</span>
                                 </div>
                                 <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                    <motion.div 
                                       initial={{ width: 0 }}
                                       animate={{ width: `${Math.min(100, (step.val / (Math.max(1, stats.totalLeads) * 4 || 1)) * 100)}%` }} 
                                       className={cn("h-full rounded-full transition-all duration-1000", step.color)} 
                                    />
                                 </div>
                              </div>
                             ))}
                          </div>
                       </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-white/5">
                       <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Flow Optimization</span>
                          <span className="text-[10px] font-mono text-brand-emerald">+12.4%</span>
                       </div>
                       <div className="flex gap-1.5 h-3">
                          {[
                            { color: 'bg-zinc-800', percentage: (stats.pipeline.new / (stats.totalLeads || 1)) * 100 },
                            { color: 'bg-sky-500/50', percentage: (stats.pipeline.contacted / (stats.totalLeads || 1)) * 100 },
                            { color: 'bg-amber-500/50', percentage: (stats.pipeline.followup / (stats.totalLeads || 1)) * 100 },
                            { color: 'bg-brand-emerald', percentage: (stats.pipeline.converted / (stats.totalLeads || 1)) * 100 },
                            { color: 'bg-rose-500/50', percentage: (stats.pipeline.closed / (stats.totalLeads || 1)) * 100 }
                          ].map((seg, i) => (
                             <div key={`flow-seg-${i}`} className={cn("h-full rounded-full shadow-lg", seg.color)} style={{ width: `${Math.max(5, seg.percentage)}%` }} />
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Business Growth Center */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="glass-card neon-glow-emerald p-5 md:p-10 rounded-2xl relative overflow-hidden group/growth mt-8"
              id="business-growth-center"
            >
              {/* Decorative Background Icon */}
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover/growth:opacity-[0.07] transition-opacity pointer-events-none">
                <TrendingUp size={120} className="text-brand-emerald" />
              </div>

              <div className="relative z-10">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-emerald/20 rounded-2xl flex items-center justify-center text-brand-emerald shadow-lg">
                      <TrendingUp size={24} className="animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-white text-xl font-bold tracking-tight">Business Growth Center</h2>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold mt-1">
                        Strategic Acceleration & Analytics Engine
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-white w-full md:w-auto">
                    <div className="flex items-center gap-3 bg-zinc-900/50 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md shadow-lg flex-1 md:flex-none justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-emerald animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#10b981]">
                        Optimization Node Enabled
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grid Layout for modules */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Column 1: Growth Score Card */}
                  <div className="bg-white/5 border border-white/5 p-6 rounded-2xl shadow-xl backdrop-blur-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                        <Activity size={16} className="text-brand-emerald" />
                        GROWTH SCORE TARGETS
                      </h3>
                      
                      {/* Overall Circular Score or Large text presentation */}
                      <div className="flex items-center gap-6 mb-6">
                        <div className="relative flex items-center justify-center w-20 h-20 rounded-full border-4 border-brand-emerald/20">
                          <div className="absolute inset-0 rounded-full border-4 border-t-brand-emerald border-r-brand-emerald border-b-transparent border-l-transparent animate-spin-slow" />
                          <div className="text-center">
                            <span className="text-2xl font-black text-white font-mono">72</span>
                            <span className="text-[10px] text-zinc-500 font-bold block -mt-1">/ 100</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Business Growth Score</h4>
                          <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">
                            Above market average index. Key acceleration vectors identified.
                          </p>
                        </div>
                      </div>

                      {/* Score Metrics */}
                      <div className="space-y-4">
                        {[
                          { label: 'Lead Generation', val: 72, color: 'bg-brand-indigo' },
                          { label: 'Website Presence', val: 85, color: 'bg-brand-emerald' },
                          { label: 'Automation Velocity', val: 60, color: 'bg-amber-400' }
                        ].map((m, idx) => (
                          <div key={`score-val-${idx}`}>
                            <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase mb-1.5 tracking-wider">
                              <span>{m.label}</span>
                              <span className="text-white font-mono">{m.val}%</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${m.val}%` }}
                                transition={{ duration: 1, delay: 0.1 * idx }}
                                className={cn("h-full rounded-full", m.color)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Quick Actions */}
                  <div className="bg-white/5 border border-white/5 p-6 rounded-2xl shadow-xl backdrop-blur-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                        <Cpu size={16} className="text-brand-indigo" />
                        STRATEGIC QUICK ACTIONS
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { 
                            label: 'Website Audit', 
                            desc: 'Identify conversion leaks', 
                            icon: Layers, 
                            url: 'https://docs.google.com/forms/d/e/1FAIpQLSd8uRsyJVbqqPmR1u3AEvQLj6QXn7klQ9KYTHMTGI2-t9N9Hw/viewform?usp=header' 
                          },
                          { 
                            label: 'Growth Plan', 
                            desc: 'Custom scaling strategies', 
                            icon: TrendingUp, 
                            url: 'https://docs.google.com/forms/d/e/1FAIpQLSd8uRsyJVbqqPmR1u3AEvQLj6QXn7klQ9KYTHMTGI2-t9N9Hw/viewform?usp=header' 
                          },
                          { 
                            label: 'WhatsApp Strategy', 
                            desc: 'Direct chatbot pathways', 
                            icon: MessageSquare, 
                            url: 'https://wa.me/919330457995?text=Hi%20BizAI,%20I%20want%20to%20know%20more%20about%20WhatsApp%20Strategy' 
                          },
                          { 
                            label: 'Book Consultation', 
                            desc: 'Connect with core experts', 
                            icon: Phone, 
                            url: 'https://wa.me/919330457995?text=Hi%20PCS%20Consultancy,%20I%20want%20to%20upgrade%20my%20AI%20automation%20system' 
                          }
                        ].map((act, idx) => {
                          const IconComp = act.icon;
                          return (
                            <button
                              key={`quick-act-${idx}`}
                              onClick={() => window.open(act.url, '_blank')}
                              className="bg-white/[0.02] border border-white/5 hover:border-brand-indigo/30 hover:bg-white/[0.06] transition-all p-4 rounded-xl text-left group/btn flex flex-col justify-between min-h-[90px] shadow-lg cursor-pointer relative overflow-hidden"
                            >
                              <div className="flex justify-between items-start w-full">
                                <div className="p-2 bg-white/5 rounded-lg text-zinc-400 group-hover/btn:text-white transition-colors">
                                  <IconComp size={16} />
                                </div>
                                <ChevronRight size={14} className="text-zinc-500 group-hover/btn:text-white transition-transform group-hover/btn:translate-x-0.5" />
                              </div>
                              <div>
                                <span className="text-[11px] font-bold text-white uppercase tracking-wider block mt-2">{act.label}</span>
                                <span className="text-[9px] text-zinc-500 font-bold block mt-0.5">{act.desc}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Consultation CTA */}
                  <div className="bg-white/5 border border-white/5 p-6 rounded-2xl shadow-xl backdrop-blur-sm flex flex-col justify-between relative overflow-hidden group/cta">
                    {/* Glowing highlight */}
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-emerald/10 via-transparent to-brand-indigo/5 opacity-50 group-hover/cta:opacity-70 transition-opacity pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                      <div>
                        <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                          <Sparkles size={16} className="text-brand-emerald animate-pulse" />
                          CONSULTATION DEPLOYMENT
                        </h3>
                        
                        <h4 className="text-lg font-bold text-white tracking-tight mt-2 min-h-[50px] flex items-center">
                          Ready to Grow Your Business?
                        </h4>
                        
                        <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed font-medium">
                          Secure a premium 1-on-1 strategy call with our elite consultancy unit. We translate raw analytics matrices into direct operational revenue growth.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3 bg-zinc-950/40 p-3 rounded-xl border border-white/5">
                          <CheckCircle2 size={16} className="text-brand-emerald shrink-0" />
                          <span className="text-[10px] text-zinc-300 font-medium">Free 45-Minute Strategic Mapping Node</span>
                        </div>
                        
                        <motion.button
                          whileHover={{ 
                            scale: 1.02,
                            boxShadow: "0 0 25px rgba(16, 185, 129, 0.4)"
                          }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => window.open('https://wa.me/919330457995?text=Hi%20PCS%20Consultancy,%20I%20want%20to%20upgrade%20my%20AI%20automation%20system', '_blank')}
                          className="w-full py-3 bg-brand-emerald text-zinc-950 hover:bg-emerald-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 cursor-pointer focus:outline-none animate-bounce"
                          style={{ animationDuration: '3s' }}
                        >
                          <Phone size={14} />
                          <span>Book Free Consultation</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>

            {/* Latest Leads Table - Enhanced UI */}
            <div id="leads-table" className="mt-12 pt-8 border-t border-white/5">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-brand-indigo shadow-2xl backdrop-blur-md">
                    <Database size={24} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Active Matrix Assets</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black mt-1">Operational Data Stream: Verified</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-zinc-900/50 px-4 py-2 rounded-xl border border-white/5 shadow-xl backdrop-blur-sm">
                   <div className="w-2.5 h-2.5 rounded-full bg-brand-emerald animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                   <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest leading-none">Security Node Active</span>
                </div>
              </div>
              
              <div className="overflow-x-auto custom-scrollbar -mx-4 md:mx-0">
                <div className="inline-block min-w-full align-middle md:px-0">
                  <table className="w-full text-[13px] text-left border-separate border-spacing-y-3">
                    <thead>
                      <tr className="text-zinc-500 uppercase tracking-[0.25em] font-black text-[9px]">
                        <th className="px-6 py-4">Identity Matrix</th>
                        <th className="px-6 py-4 hidden sm:table-cell">Product Vector</th>
                        <th className="px-6 py-4 hidden md:table-cell">Budget Capacity</th>
                        <th className="px-6 py-4">Current Vector</th>
                        <th className="px-6 py-4 text-right">Proj. Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isSyncing && leads.length === 0 ? (
                        [...Array(5)].map((_, i) => (
                          <tr key={`table-skeleton-${i}`} className="animate-pulse">
                            <td className="px-6 py-6 bg-white/5 rounded-l-2xl border-t border-b border-l border-white/5"><div className="h-5 bg-zinc-800 rounded w-36 mb-2" /><div className="h-3 bg-zinc-800 rounded w-24" /></td>
                            <td className="px-6 py-6 bg-white/5 border-t border-b border-white/5 hidden sm:table-cell"><div className="h-4 bg-zinc-800 rounded w-28" /></td>
                            <td className="px-6 py-6 bg-white/5 border-t border-b border-white/5 hidden md:table-cell"><div className="h-4 bg-zinc-800 rounded w-20" /></td>
                            <td className="px-6 py-6 bg-white/5 border-t border-b border-white/5"><div className="h-7 bg-zinc-800 rounded-lg w-24" /></td>
                            <td className="px-6 py-6 bg-white/5 rounded-r-2xl border-t border-b border-r border-white/5 text-right"><div className="h-5 bg-zinc-800 rounded w-28 ml-auto" /></td>
                          </tr>
                        ))
                      ) : leads.length > 0 ? (
                        leads.slice(0, 10).map((lead, i) => (
                          <tr key={`lead-row-${i}`} className="group hover:translate-y-[-2px] transition-all duration-300">
                            <td className="px-6 py-6 bg-white/5 group-hover:bg-white/[0.08] lg:group-hover:bg-white/[0.1] rounded-l-2xl border-l border-t border-b border-white/5 shadow-sm transition-all">
                              <div className="flex flex-col">
                                <span className="text-zinc-100 font-bold text-base tracking-tight group-hover:text-brand-indigo transition-colors">{lead.name}</span>
                                <div className="flex items-center gap-2 mt-2 font-mono opacity-60">
                                  <Phone size={10} className="text-zinc-400" />
                                  <span className="text-[10px] text-zinc-400 font-bold">{lead.phone}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-6 bg-white/5 group-hover:bg-white/[0.08] lg:group-hover:bg-white/[0.1] border-t border-b border-white/5 text-zinc-400 font-bold hidden sm:table-cell transition-all uppercase tracking-tight">{lead.service}</td>
                            <td className="px-6 py-6 bg-white/5 group-hover:bg-white/[0.08] lg:group-hover:bg-white/[0.1] border-t border-b border-white/5 text-brand-indigo font-mono font-bold hidden md:table-cell transition-all uppercase">₹{lead.budget ? lead.budget.toLocaleString() : '--'}</td>
                            <td className="px-6 py-6 bg-white/5 group-hover:bg-white/[0.08] lg:group-hover:bg-white/[0.1] border-t border-b border-white/5 transition-all">
                              <span className={cn(
                                "px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] inline-flex items-center gap-2 shadow-lg",
                                lead.status?.toUpperCase() === 'CONVERTED' ? "bg-brand-emerald text-zinc-950 neon-glow-emerald" :
                                lead.status?.toUpperCase() === 'NEW' ? "bg-zinc-800 text-zinc-400 border border-white/5" :
                                lead.status?.toUpperCase() === 'CONTACTED' ? "bg-sky-500/20 text-sky-400 border border-sky-500/30" :
                                "bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20"
                              )}>
                                <div className={cn("w-2 h-2 rounded-full", lead.status?.toUpperCase() === 'CONVERTED' ? "bg-white animate-pulse" : "bg-current")} />
                                {lead.status || 'UNIDENTIFIED'}
                              </span>
                            </td>
                            <td className="px-6 py-6 bg-white/5 group-hover:bg-white/[0.08] lg:group-hover:bg-white/[0.1] rounded-r-2xl border-r border-t border-b border-white/5 text-right transition-all">
                              <span className="text-white font-mono font-black text-base shadow-brand-indigo/20 drop-shadow-lg">{lead.revenue ? `₹${lead.revenue.toLocaleString()}` : '--'}</span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-24 text-center">
                            <div className="flex flex-col items-center gap-4 opacity-30">
                              <Database size={48} className="text-zinc-500" />
                              <span className="text-zinc-500 font-black uppercase tracking-[0.4em] text-[12px]">No data units detected in matrix</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>



            {/* Mode Meta Grid */}
            {currentMode && (
              <motion.div 
                key={currentMode + "-banner"}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-6 md:mt-8"
              >
                <div className="bg-white/5 border border-white/5 p-4 md:p-6 rounded-2xl flex flex-col shadow-xl backdrop-blur-md">
                  <span className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Strategy Node</span>
                  <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">{MODE_INSIGHTS[currentMode].title}</h3>
                  <p className="text-[11px] md:text-[12px] text-zinc-400 mt-2 md:mt-3 leading-relaxed font-medium">{MODE_INSIGHTS[currentMode].hint}</p>
                </div>
                <div className="bg-white/5 border border-white/5 p-4 md:p-6 md:col-span-2 rounded-2xl shadow-xl backdrop-blur-md">
                  <span className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 md:mb-4 block">Operational Matrix Focus</span>
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4">
                    {MODE_INSIGHTS[currentMode].tips.map((tip, tipIdx) => (
                      <div key={`insight-tip-${tipIdx}`} className="flex items-center gap-2 md:gap-3 group bg-white/5 p-2 md:p-3 rounded-xl border border-white/5 hover:border-brand-indigo/30 transition-all">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-indigo shadow-[0_0_8px_rgba(99,102,241,0.5)] group-hover:scale-125 transition-transform" />
                        <span className="text-[9px] md:text-[10px] font-black text-zinc-300 uppercase tracking-widest">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {messages.map((msg) => (
              <motion.div
                key={`chat-msg-${msg.id}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={cn(
                  "flex gap-3 md:gap-6",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-10 h-10 md:w-12 md:h-12 shrink-0 flex items-center justify-center rounded-2xl border transition-all duration-300",
                  msg.role === 'assistant' 
                    ? "bg-brand-indigo/10 border-brand-indigo/30 text-brand-indigo shadow-[0_0_15px_rgba(99,102,241,0.15)]" 
                    : "bg-white/5 border-white/10 text-zinc-400 shadow-xl"
                )}>
                  {msg.role === 'assistant' ? <Bot size={20} className="md:size-6 animate-pulse" /> : <User size={20} className="md:size-6" />}
                </div>
                
                <div className={cn(
                  "flex-1 max-w-[calc(100%-3rem)] md:max-w-[85%] lg:max-w-[75%] space-y-2 flex flex-col",
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
                    "p-4 md:p-6 rounded-2xl text-[14px] leading-relaxed break-words overflow-hidden w-full",
                    msg.role === 'assistant' 
                      ? "bg-zinc-950/50 border border-zinc-800 text-zinc-100 shadow-xl prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-strong:text-brand-indigo prose-strong:font-bold prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10" 
                      : "bg-brand-indigo/10 text-white border border-brand-indigo/30 font-medium"
                  )}>
                    {msg.role === 'assistant' ? (
                      <div className="w-full">
                        <Markdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-3">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-3">{children}</ol>,
                            li: ({ children }) => <li className="text-zinc-300">{children}</li>,
                            h1: ({ children }) => <h1 className="text-lg font-serif italic font-bold text-white mt-6 mb-3 border-b border-white/10 pb-1">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-serif italic font-bold text-white mt-6 mb-3">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-bold text-zinc-200 mt-4 mb-2 uppercase tracking-tight">{children}</h3>,
                            p: ({ children }) => <p className="mb-3 last:mb-0 break-words-container">{children}</p>,
                             a: ({ children, href }) => {
                              const isForm = href && (href.includes('google.com/forms') || href.includes('docs.google.com/forms'));
                              const isWA = href && href.includes('wa.me');

                              if (isForm) {
                                return (
                                  <span className="block my-3">
                                    <a 
                                      href={href} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-indigo hover:bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] active:scale-95 cursor-pointer border border-brand-indigo/30"
                                    >
                                      <Sparkles size={14} className="animate-pulse text-indigo-200" />
                                      <span>{children || "Fill Onboarding Form"}</span>
                                    </a>
                                  </span>
                                );
                              }

                              if (isWA) {
                                return (
                                  <span className="block my-3">
                                    <a 
                                      href={href} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-emerald hover:bg-emerald-500 text-zinc-950 font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-95 cursor-pointer"
                                    >
                                      <Phone size={14} />
                                      <span>{children || "Connect on WhatsApp"}</span>
                                    </a>
                                  </span>
                                );
                              }

                              return (
                                <a 
                                  href={href} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-brand-indigo hover:underline font-bold break-all inline-block max-w-full"
                                >
                                  {children}
                                </a>
                              );
                            },
                            strong: ({ children }) => <strong className="font-bold text-brand-indigo">{children}</strong>,
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-2 border-brand-indigo/30 pl-4 py-1 italic text-zinc-400 my-4 bg-white/5">
                                {children}
                              </blockquote>
                            )
                          }}
                        >
                          {preprocessMessageContent(msg.content)}
                        </Markdown>

                        {msg.content.includes('button:retry') && (
                          <button 
                            onClick={handleRetry}
                            className="mt-6 bg-brand-indigo text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-indigo/80 transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] active:scale-95 border border-brand-indigo/50 font-mono uppercase tracking-widest text-[10px]"
                          >
                            <RefreshCcw size={14} />
                            Retry Command Execution
                          </button>
                        )}

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
                            ].map((action, actionIdx) => (
                              <button
                                key={`welcome-action-${actionIdx}`}
                                onClick={() => {
                                  if ('isExternal' in action && action.isExternal) {
                                    window.open(action.cmd, '_blank');
                                  } else {
                                    handleSend(action.cmd);
                                  }
                                }}
                                className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 hover:border-brand-indigo hover:bg-brand-indigo/5 transition-all text-left group rounded-xl"
                              >
                                <action.icon size={14} className="text-zinc-500 group-hover:text-brand-indigo" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-brand-indigo leading-tight">{action.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="break-words w-full">{msg.content}</div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3 md:gap-6 items-center"
                  >
                    <div className="w-10 h-10 bg-zinc-950 border border-zinc-800 text-brand-indigo flex items-center justify-center animate-pulse rounded-2xl">
                      <Bot size={20} />
                    </div>
                    <div className="flex gap-2 p-3 bg-zinc-900/50 border border-zinc-800 px-4 items-center rounded-2xl">
                      <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 bg-brand-indigo animate-bounce [animation-delay:-0.32s] rounded-full" />
                        <div className="w-1.5 h-1.5 bg-brand-indigo animate-bounce [animation-delay:-0.16s] rounded-full" />
                        <div className="w-1.5 h-1.5 bg-brand-indigo animate-bounce rounded-full" />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 ml-4 uppercase tracking-[0.2em] animate-pulse">BizAI.LOG: Processing</span>
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
              className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 pt-0 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent z-40"
            >
              <div className="max-w-4xl mx-auto">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-brand-indigo/20 to-brand-emerald/20 blur opacity-0 group-focus-within:opacity-100 transition-opacity rounded-2xl" />
                  <div className="relative flex shadow-2xl shadow-indigo-500/10 border border-white/10 overflow-hidden bg-[#0a0a0a] items-end rounded-2xl command-input-wrapper">
                    <div className="hidden sm:flex items-center px-4 h-12 md:h-14 bg-white/5 border-r border-white/10 text-[10px] font-mono text-brand-indigo font-bold uppercase tracking-widest">
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
                      className="chat-input flex-1 bg-transparent py-3 md:py-4 px-4 md:px-6 text-[14px] md:text-[15px] font-medium focus:outline-none placeholder:text-zinc-600 uppercase tracking-tight resize-none max-h-40 border-none !p-4 !border-0 !rounded-none min-h-[56px]"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isLoading}
                      className={cn(
                        "px-6 sm:px-8 h-12 md:h-14 transition-all flex items-center justify-center border-l border-white/10",
                        input.trim() && !isLoading 
                          ? "bg-brand-indigo text-white hover:bg-brand-indigo/80 shadow-[0_0_15px_rgba(99,102,241,0.3)]" 
                          : "bg-white/5 text-zinc-700 cursor-not-allowed"
                      )}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
                <div className="mt-3 md:mt-4 flex flex-col sm:flex-row justify-between items-center px-2 gap-2">
                  <span className="text-[7px] md:text-[8px] font-mono text-zinc-500 uppercase tracking-[0.2em] md:tracking-[0.3em]">SECURE.ENCRYPTED.NODE</span>
                  <div className="flex items-center gap-3 md:gap-4">
                    <span className="text-[7px] md:text-[8px] font-mono text-zinc-500 uppercase">Ver: 3.2.0-STABLE</span>
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

      </main>
    </div>
  );
}
