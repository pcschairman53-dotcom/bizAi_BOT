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
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from './lib/utils';
import { Message, ConsultingMode } from './types';
import { chatWithAssistant } from './services/geminiService';

interface SidebarProps {
  currentMode: ConsultingMode;
  setMode: (mode: ConsultingMode) => void;
  isOpen: boolean;
  toggle: () => void;
}

const MODES: { mode: ConsultingMode; icon: any; color: string }[] = [
  { mode: 'AI Smart Assistant', icon: Cpu, color: 'text-violet-500' },
  { mode: 'Growth Strategy', icon: Briefcase, color: 'text-indigo-500' },
  { mode: 'Marketing Engine', icon: TrendingUp, color: 'text-emerald-500' },
  { mode: 'Client Acquisition System', icon: Target, color: 'text-orange-500' },
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
    title: 'Marketing Engine hub',
    hint: 'SEO, Ads, and Branding strategies focused on ROI.',
    tips: ['SEO Authority', 'PPC Strategy', 'Content Engines']
  },
  'Client Acquisition System': {
    title: 'Client Acquisition',
    hint: 'Lead generation and sales funnels designed for conversions.',
    tips: ['Lead Magnets', 'Conversion Funnels', 'Sales Psychology']
  }
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "### 🚀 AI-Powered Growth Consultant for Business Scaling\n\nWelcome to BizAI.\n\nI help you:\n✔ Get more clients\n✔ Increase revenue\n✔ Build online presence\n✔ Automate your business\n\n**🔥 Quick Actions:**\n\n👉 **Get Clients in 7 Days** → type: `/clients` \n👉 **Grow Your Business** → type: `/growth` \n👉 **Marketing Plan** → type: `/marketing` \n👉 **General Help** → type: `/general` \n\n---\n\n**🚀 To get full business help:**\n\n1️⃣ **Fill this form:** [BizAI Onboarding Form](https://docs.google.com/forms/d/e/1FAIpQLSd8uRsyJVbqqPmR1u3AEvQLj6QXn7klQ9KYTHMTGI2-t9N9Hw/viewform?usp=header)\n\n2️⃣ **Then chat on WhatsApp:** [Connect on WhatsApp](https://wa.me/919330457995?text=Hi%20I%20submitted%20the%20form)\n\n⚡ *I will guide you step-by-step*",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [currentMode, setCurrentMode] = useState<ConsultingMode | null>('AI Smart Assistant');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        '/marketing': 'Marketing Engine',
        '/clients': 'Client Acquisition System',
        '/general': 'AI Smart Assistant'
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
      const response = await chatWithAssistant([...messages, userMsg], currentMode);
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
    <div className="flex h-screen bg-[#F0F1F4] text-zinc-900 font-sans selection:bg-brand-indigo/10 overflow-hidden">
      {/* Structural Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-72 bg-zinc-950 border-r border-zinc-800 flex flex-col z-40 fixed lg:relative h-full text-zinc-400"
          >
            <div className="p-8 pb-4 flex items-center justify-between border-b border-zinc-800/50">
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
            </nav>

            <div className="p-4 border-t border-zinc-800/50 bg-zinc-900/20">
              <div className="p-4 rounded border border-zinc-800 bg-zinc-950">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={12} className="text-brand-indigo" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Tier Status</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed mb-3">Enterprise Access enabled for premium consulting.</p>
                <button className="w-full py-1.5 bg-brand-indigo hover:bg-brand-indigo/80 text-white rounded text-[10px] font-bold uppercase tracking-widest transition-all">
                  Manage Account
                </button>
              </div>
              <p className="mt-4 text-[9px] text-center text-zinc-600 uppercase tracking-tighter">Powered by DeepMind Antigravity</p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Terminal View */}
      <main className="flex-1 flex flex-col min-w-0 bg-white relative overflow-hidden">
        {/* Technical Header */}
        <header className="h-14 border-b border-zinc-200 flex items-center justify-between px-4 sm:px-6 bg-white/80 backdrop-blur-md z-30 shrink-0 sticky top-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-zinc-50 border border-zinc-100 rounded transition-colors"
            >
              <PanelLeftOpen size={16} className={cn("transition-transform", sidebarOpen && "rotate-180")} />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none hidden xs:inline">Console</span>
                <span className="text-xs font-bold text-zinc-900 tracking-tight truncate max-w-[120px] sm:max-w-none">
                  {currentMode || "Startup"}
                </span>
              </div>
              <span className="text-[8px] font-mono text-zinc-400 leading-none">0x921A-BIZ-NODE</span>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
             <div className="hidden lg:flex items-center gap-8">
               <div className="flex flex-col items-end">
                 <span className="text-[8px] uppercase font-bold text-zinc-400 tracking-widest">Latency</span>
                 <span className="text-[10px] font-mono text-brand-emerald">12ms</span>
               </div>
               <div className="flex flex-col items-end">
                 <span className="text-[8px] uppercase font-bold text-zinc-400 tracking-widest">Node Status</span>
                 <span className="text-[10px] font-mono text-zinc-600">Syncing...</span>
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
          <div className="max-w-4xl mx-auto space-y-12 pb-48">
            
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
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6">
                            {[
                              { label: "🚀 Full Business Help", cmd: "https://docs.google.com/forms/d/e/1FAIpQLSd8uRsyJVbqqPmR1u3AEvQLj6QXn7klQ9KYTHMTGI2-t9N9Hw/viewform?usp=header", icon: Sparkles, isExternal: true },
                              { label: "Chat on WhatsApp", cmd: "https://wa.me/919330457995?text=Hi%20I%20submitted%20the%20form", icon: MessageSquare, isExternal: true },
                              { label: "Get Clients in 7 Days", cmd: "/clients", icon: Target },
                              { label: "Grow Your Business", cmd: "/growth", icon: Briefcase },
                              { label: "Marketing Plan", cmd: "/marketing", icon: TrendingUp },
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
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Command Input Rail */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 pt-0 bg-gradient-to-t from-[#fafafa] via-[#fafafa] to-transparent">
          <div className="max-w-4xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-indigo/20 to-brand-emerald/20 blur opacity-0 group-focus-within:opacity-100 transition-opacity rounded-sm" />
              <div className="relative flex shadow-xl shadow-zinc-200/50 border border-zinc-200 overflow-hidden bg-white items-end">
                <div className="hidden xs:flex items-center px-4 h-14 bg-zinc-50 border-r border-zinc-200 text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-widest">
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
                  placeholder={isLoading ? "SYSTEM PROCESSING..." : "EXECUTE COMMAND OR ASK FOR ADVICE..."}
                  disabled={isLoading}
                  className="flex-1 bg-transparent py-4 px-6 text-sm font-medium focus:outline-none placeholder:text-zinc-300 uppercase tracking-tight resize-none max-h-40"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "px-6 sm:px-8 h-14 transition-all flex items-center justify-center border-l",
                    input.trim() && !isLoading 
                      ? "bg-zinc-950 text-white hover:bg-brand-indigo border-zinc-800" 
                      : "bg-zinc-50 text-zinc-300 border-zinc-100 cursor-not-allowed"
                  )}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center px-2">
              <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-[0.3em]">SECURE.ENCRYPTED.NODE</span>
              <div className="flex items-center gap-4">
                <span className="text-[8px] font-mono text-zinc-400 uppercase">Ver: 3.2.0-STABLE</span>
                <div className="flex items-center gap-1.5">
                  <span className={cn("w-1 h-1 rounded-full", isLoading ? "bg-brand-indigo animate-pulse" : "bg-brand-emerald")} />
                  <span className={cn("text-[8px] font-mono uppercase tracking-tighter", isLoading ? "text-brand-indigo" : "text-brand-emerald")}>
                    {isLoading ? "Node Busy" : "Connection Stable"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
