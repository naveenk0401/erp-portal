'use client';

import { useState, useRef, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  MessageSquare, 
  Search, 
  Send, 
  Sparkles,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Users,
  IndianRupee,
  Activity,
  BarChart as BarIcon,
  HelpCircle,
  RefreshCcw,
  Cpu,
  CheckCircle2,
  X
} from 'lucide-react';
import api from '@/lib/api';

const predefinedQuestions = [
  { id: 1, text: 'What is my onboarding status?', category: 'HR' },
  { id: 2, text: 'Which department cost increased?', category: 'Finance' },
  { id: 3, text: 'How many active projects are there?', category: 'Operations' },
  { id: 4, text: 'What is the Burnout Velocity alert?', category: 'Insights' },
];

export default function AssistantPage() {
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [training, setTraining] = useState(false);
  const [trainResults, setTrainResults] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat, isTyping]);

  const handleQuery = async (q: string) => {
    if (!q.trim()) return;
    
    // Add user message
    const userMsg = { role: 'user', content: q };
    setChat(prev => [...prev, userMsg]);
    setQuery('');
    setIsTyping(true);

    try {
      const response: any = await api.get(`/copilot/query?q=${encodeURIComponent(q)}`);
      setChat(prev => [...prev, { role: 'assistant', ...response.data }]);
    } catch (error) {
      console.error('Assistant Error:', error);
      setChat(prev => [...prev, { 
        role: 'assistant', 
        answer: "I'm having trouble connecting to the brain right now. Please try again later.",
        context: "System Error"
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleTrain = async () => {
    try {
      setTraining(true);
      const response: any = await api.post('/copilot/train-auto');
      setTrainResults(response.data);
      
      // Auto-hide results after 5s
      setTimeout(() => {
         setTrainResults(null);
      }, 5000);

    } catch (error) {
      console.error('Training Error:', error);
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 md:p-10 overflow-y-auto max-h-screen custom-scrollbar flex flex-col" ref={scrollRef}>
        <header className="mb-8 border-b border-slate-200 pb-8 shrink-0 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
                <MessageSquare size={24} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">ERP Copilot</h2>
            </div>
            <p className="text-slate-500 font-bold text-sm opacity-70">
              Intelligent query-based assistant for enterprise data insights.
            </p>
          </div>
          
          <button 
            onClick={handleTrain}
            disabled={training}
            className={`px-6 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 shadow-xl ${
               training ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {training ? <RefreshCcw size={16} className="animate-spin" /> : <Cpu size={16} />}
            {training ? 'Neural Syncing...' : 'Train Assistant'}
          </button>
        </header>

        {/* Training Success Notification */}
        {trainResults && (
           <div className="mb-8 bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-4">
                 <div className="bg-emerald-500 text-white p-2 rounded-xl">
                    <CheckCircle2 size={20} />
                 </div>
                 <div>
                    <h4 className="text-sm font-black text-emerald-900">{trainResults.message}</h4>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                       {trainResults.indexed_nodes} Knowledge Nodes Indexed • {trainResults.pending_questions} Pending Queries
                    </p>
                 </div>
              </div>
              <button onClick={() => setTrainResults(null)}><X size={16} className="text-emerald-400" /></button>
           </div>
        )}

        {/* Chat Interface Container */}
        <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col gap-8 pb-32">
          
          {/* Welcome Message (Only if no chat history) */}
          {chat.length === 0 && !isTyping && (
            <div className="text-center py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-sm">
                <Sparkles className="text-blue-600" size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">How can I help you today?</h3>
              <p className="text-slate-500 font-bold max-w-sm mx-auto mb-10">
                Choose a predefined query or type your own to get real-time analytical reports.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {predefinedQuestions.map((q) => (
                  <button 
                    key={q.id}
                    onClick={() => handleQuery(q.text)}
                    className="p-6 bg-white border border-slate-100 rounded-[2rem] hover:shadow-xl hover:border-blue-200 transition-all flex flex-col gap-3 group"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit">
                      {q.category}
                    </span>
                    <p className="font-black text-slate-900 flex items-center justify-between">
                      {q.text}
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {chat.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-900' : 'bg-blue-600 shadow-lg shadow-blue-200'}`}>
                {msg.role === 'user' ? <Users className="text-white" size={20} /> : <Sparkles className="text-white" size={20} />}
              </div>
              <div className={`p-6 md:p-8 rounded-[2rem] max-w-[85%] border shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-slate-900 border-slate-800 text-white rounded-tr-none' 
                  : 'bg-white border-slate-100 rounded-tl-none'
              }`}>
                {msg.role === 'assistant' && msg.context && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2 block">{msg.context}</span>
                )}
                <p className={`font-bold text-sm leading-relaxed ${msg.role === 'user' ? 'text-slate-100' : 'text-slate-900'}`}>
                  {msg.answer || msg.content}
                </p>
                {msg.logic_applied && (
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <Activity size={12} /> Logic: {msg.logic_applied}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-4 animate-pulse">
              <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
                <Sparkles className="text-white" size={20} />
              </div>
              <div className="bg-white p-6 rounded-[2rem] rounded-tl-none border border-slate-100 shadow-sm flex gap-2">
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          )}
        </div>

        {/* Floating Input Area */}
        <div className="fixed bottom-10 left-0 md:left-72 right-0 px-6 z-30">
          <div className="max-w-3xl mx-auto bg-white p-2 rounded-[2.5rem] shadow-2xl border border-slate-100 flex items-center gap-4 group focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center shrink-0">
              <Search className="text-slate-400" size={20} />
            </div>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuery(query)}
              placeholder="Ask me anything about enterprise data..." 
              className="flex-1 border-none focus:ring-0 text-slate-900 font-bold placeholder:text-slate-300 bg-transparent"
            />
            <button 
              onClick={() => handleQuery(query)}
              className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-90"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
