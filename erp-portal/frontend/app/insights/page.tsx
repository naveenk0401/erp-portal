'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import { 
  Zap, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  Info,
  ArrowRight,
  ShieldAlert,
  BarChart as BarIcon,
  RefreshCcw,
  Activity,
  ChevronDown,
  ChevronUp,
  Target,
  FlaskConical,
  X,
  Users,
  User as UserIcon,
  CheckCircle2
} from 'lucide-react';
import api from '@/lib/api';

// Dynamic imports for Recharts to avoid SSR issues and type mismatches in Next.js
const ResponsiveContainer = dynamic(
  () => import('recharts').then((recharts) => recharts.ResponsiveContainer),
  { ssr: false }
);
const AreaChart = dynamic(
  () => import('recharts').then((recharts) => recharts.AreaChart),
  { ssr: false }
);
const Area = dynamic(
  () => import('recharts').then((recharts) => recharts.Area),
  { ssr: false }
);
const XAxis = dynamic(
  () => import('recharts').then((recharts) => recharts.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import('recharts').then((recharts) => recharts.YAxis),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import('recharts').then((recharts) => recharts.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('recharts').then((recharts) => recharts.Tooltip),
  { ssr: false }
);

export default function InsightsPage() {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [detailedRisk, setDetailedRisk] = useState<any[]>([]);
  const [expanding, setExpanding] = useState(false);

  // Advanced Modeling States
  const [modelingLoading, setModelingLoading] = useState(false);
  const [modelingResult, setModelingResult] = useState<any>(null);
  const [showModelModal, setShowModelModal] = useState(false);

  // Alert Drill-down & Acknowledgment States
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [ackLoading, setAckLoading] = useState(false);
  const [ackSuccess, setAckSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, historyRes]: any = await Promise.all([
        api.get('/insights/summary'),
        api.get('/insights/historical-trends')
      ]);
      
      setAlerts(summaryRes.data.alerts);
      setHealth(summaryRes.data.health);
      setHistory(historyRes.data.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString(),
        productivity: item.metrics.productivity,
        risk: item.metrics.attrition_risk
      })).reverse());

    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpandModel = async () => {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    try {
      setExpanding(true);
      const response: any = await api.get('/insights/detailed-risk');
      setDetailedRisk(response.data);
      setIsExpanded(true);
    } catch (error) {
      console.error('Error expanding risk model:', error);
    } finally {
      setExpanding(false);
    }
  };

  const handleAdvancedModeling = async () => {
    try {
      setModelingLoading(true);
      const response: any = await api.post('/insights/advanced-modeling');
      setModelingResult(response.data);
      setShowModelModal(true);
    } catch (error) {
      console.error('Error running advanced modeling:', error);
    } finally {
      setModelingLoading(false);
    }
  };

  const openAlertDetail = (alert: any) => {
    setSelectedAlert(alert);
    setAckSuccess(false);
    setShowAlertModal(true);
  };

  const handleAcknowledge = async () => {
    if (!selectedAlert) return;
    
    try {
      setAckLoading(true);
      await api.post(`/insights/alerts/${selectedAlert.id}/acknowledge`);
      setAckSuccess(true);
      setTimeout(() => {
        setShowAlertModal(false);
      }, 1500);
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    } finally {
      setAckLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 md:p-10 overflow-y-auto max-h-screen custom-scrollbar">
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-blue-500 fill-blue-500" />
              <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">Predictive Engine v5.0</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Strategic Insights
            </h2>
            <p className="text-slate-500 mt-1 font-bold text-sm opacity-70 uppercase tracking-widest text-[10px]">
              AI-Driven Risk Assessment & Performance Modeling
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchData} className="bg-white border-2 border-slate-100 text-slate-700 p-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={handleAdvancedModeling}
              disabled={modelingLoading}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-xs hover:bg-slate-800 shadow-xl transition-all flex items-center gap-2"
            >
              {modelingLoading ? <RefreshCcw size={16} className="animate-spin" /> : <Filter size={16} />} 
              Advanced Modeling
            </button>
          </div>
        </header>

        {loading ? (
             <div className="py-20 text-center">
                <div className="animate-spin text-blue-500 mb-4 flex justify-center"><RefreshCcw size={48} /></div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Synchronizing Neural Data Streams...</p>
             </div>
        ) : (
          <>
            {/* 1. Risk Matrix Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {alerts.map((card) => (
                <div 
                  key={card.id} 
                  onClick={() => openAlertDetail(card)}
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden cursor-pointer"
                >
                   <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform">
                      <ShieldAlert size={80} />
                   </div>
                  <div className="flex justify-between items-start mb-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      card.severity === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      card.severity === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {card.severity} Priority
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">{card.title}</h3>
                  <p className="text-sm font-bold text-slate-400 mb-8 leading-relaxed">
                    {card.description}
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Impact: </span>
                       <span className="text-xs font-black text-slate-900">{card.impact}</span>
                    </div>
                    <ArrowRight size={18} className="text-blue-500 group-hover:translate-x-1 transition-all cursor-pointer" />
                  </div>
                </div>
              ))}
            </div>

            {/* 2. Real-time Analysis Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-8 mb-12">
              <div className="lg:col-span-4 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                       Efficiency Quotient
                    </h3>
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">30-Day Productivity Variance</p>
                  </div>
                  <Activity className="text-blue-500" size={20} />
                </div>
                
                <div className="h-80 w-full">
                  <div className="h-full w-full">
                    {history.length > 0 && (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history}>
                          <defs>
                            <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="date" hide />
                          <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                          />
                          <Area type="monotone" dataKey="productivity" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorProd)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-10">
                   <h3 className="text-xl font-black text-slate-900">Health Index</h3>
                   <div className={`p-2 rounded-xl bg-emerald-50 text-emerald-600`}>
                      <TrendingUp size={18} />
                   </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-center items-center text-center">
                    <div className="relative mb-8">
                         <div className="w-40 h-40 rounded-full border-[12px] border-slate-50 flex items-center justify-center">
                            <span className="text-5xl font-black text-slate-900 italic">{Math.round(health?.health_score || 0)}%</span>
                         </div>
                         <div className="absolute inset-0 w-40 h-40 rounded-full border-[12px] border-blue-500 border-t-transparent animate-spin-slow shadow-xl shadow-blue-500/10"></div>
                    </div>
                    <p className="text-sm font-bold text-slate-500 px-10">
                        Operational stability is <span className="text-blue-600">Optimal</span> based on last 7 days of telemetry.
                    </p>
                </div>
              </div>
            </div>

            {/* 3. Action Recommendation & Expanded Model */}
            <div className="bg-slate-900 text-white rounded-[4rem] p-12 relative overflow-hidden transition-all duration-500">
                <div className="absolute top-0 right-0 p-20 opacity-[0.05] rotate-12 scale-150">
                    <Zap size={200} />
                </div>
                <div className="relative z-10">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2 mb-6">
                            <Activity size={16} className="text-blue-400" />
                            <h4 className="text-blue-400 font-black text-xs uppercase tracking-[0.3em]">Architectural Recommendation</h4>
                        </div>
                        <h3 className="text-3xl font-black mb-6 leading-tight">Infrastructure Pulse Optimal</h3>
                        <p className="text-slate-400 font-bold leading-relaxed mb-10 text-lg">
                            System-wide diagnostics indicate a balanced distribution of resources. However, attrition risk in some departments shows localized fluctuations.
                        </p>
                        <div className="flex gap-4">
                            <button 
                              onClick={handleExpandModel}
                              disabled={expanding}
                              className="bg-blue-600 hover:bg-blue-700 px-10 py-4 rounded-2xl font-black text-sm transition-all shadow-2xl shadow-blue-500/20 active:scale-95 flex items-center gap-2"
                            >
                                {expanding ? <RefreshCcw size={16} className="animate-spin" /> : isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                {isExpanded ? 'Collapse Risk Model' : 'Expand Risk Model'}
                            </button>
                        </div>
                    </div>

                    {/* Expanded Section */}
                    {isExpanded && (
                      <div className="mt-12 pt-12 border-t border-slate-800 animate-in fade-in slide-in-from-top-4 duration-500">
                         <h4 className="text-xl font-black mb-8 text-blue-400">Departmental Risk Matrix</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {detailedRisk.map((item, idx) => (
                              <div key={idx} className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50">
                                 <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">{item.dept}</p>
                                 <div className="space-y-4">
                                    <div>
                                       <div className="flex justify-between text-[10px] font-black mb-1 italic">
                                          <span>ATTRITION RISK</span>
                                          <span className={item.attrition_risk > 40 ? 'text-rose-400' : 'text-emerald-400'}>{item.attrition_risk}%</span>
                                       </div>
                                       <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                                          <div className={`h-full ${item.attrition_risk > 40 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${item.attrition_risk}%` }}></div>
                                       </div>
                                    </div>
                                    <div>
                                       <div className="flex justify-between text-[10px] font-black mb-1 italic">
                                          <span>BURNOUT RISK</span>
                                          <span className={item.burnout_risk > 60 ? 'text-rose-400' : 'text-emerald-400'}>{item.burnout_risk}%</span>
                                       </div>
                                       <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                                          <div className={`h-full ${item.burnout_risk > 60 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${item.burnout_risk}%` }}></div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                    )}
                </div>
            </div>
          </>
        )}
      </main>

      {/* Advanced Modeling Modal */}
      {showModelModal && modelingResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl relative">
              <button 
                onClick={() => setShowModelModal(false)}
                className="absolute top-8 right-8 p-3 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-all"
              >
                <X size={20} />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2">
                 <div className="p-12 bg-slate-50">
                    <div className="flex items-center gap-2 mb-8">
                      <Target size={20} className="text-blue-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Simulation Results</span>
                    </div>
                    
                    <h3 className="text-3xl font-black text-slate-900 mb-6 italic">Monte Carlo Projection</h3>
                    
                    <div className="space-y-8 mb-12">
                       <div className="flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Health</p>
                            <span className="text-2xl font-black text-slate-900">{modelingResult.current_health}%</span>
                          </div>
                          <TrendingUp size={24} className="text-slate-300" />
                       </div>
                       
                       <div className="flex items-center justify-between p-6 bg-blue-600 rounded-3xl shadow-xl shadow-blue-500/20 text-white">
                          <div>
                            <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Projected Optimus</p>
                            <span className="text-2xl font-black">{modelingResult.projected_health}%</span>
                          </div>
                          <Zap size={24} className="text-blue-300 animate-pulse" />
                       </div>
                    </div>
                    
                    <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl">
                       <div className="flex items-center gap-2 mb-3">
                          <FlaskConical size={16} className="text-emerald-600" />
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Confidence Score</span>
                       </div>
                       <div className="flex items-end gap-2">
                          <span className="text-4xl font-black text-emerald-700 italic">{modelingResult.confidence_interval * 100}%</span>
                          <span className="text-sm font-bold text-emerald-600 mb-1 pb-1">Mathematical Certainty</span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="p-12">
                    <h4 className="text-xl font-black text-slate-900 mb-8">Alternative Scenarios</h4>
                    <div className="space-y-4 mb-10">
                       {modelingResult.simulated_scenarios.map((s: any, i: number) => (
                         <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all group">
                            <div>
                               <p className="text-xs font-black text-slate-900">{s.name}</p>
                               <span className="text-[10px] font-bold text-slate-400">{s.likelihood} Probability</span>
                            </div>
                            <span className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{s.projected_score}%</span>
                         </div>
                       ))}
                    </div>
                    
                    <div className="pt-8 border-t border-slate-100">
                       <div className="flex items-center gap-2 mb-4">
                          <ShieldAlert size={16} className="text-amber-500" />
                          <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Strategic Playbook</span>
                       </div>
                       <p className="text-sm font-bold text-slate-500 leading-relaxed italic">
                          "{modelingResult.recommendation}"
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Alert Impact Details Modal */}
      {showAlertModal && selectedAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative">
              <button 
                onClick={() => setShowAlertModal(false)}
                className="absolute top-8 right-8 p-3 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-all"
              >
                <X size={20} />
              </button>
              
              <div className="p-12">
                 <div className="flex items-center gap-4 mb-8">
                    <div className={`p-4 rounded-2xl ${
                       selectedAlert.severity === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                       <AlertTriangle size={32} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-slate-900">{selectedAlert.title}</h3>
                       <p className="text-sm font-bold text-slate-500 italic">Personnel Intelligence Breakdown</p>
                    </div>
                 </div>

                 <div className="bg-slate-50 p-6 rounded-[2rem] mb-10 border border-slate-100 italic font-bold text-slate-600 text-sm leading-relaxed">
                    "{selectedAlert.description}"
                 </div>

                 <div className="space-y-4 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                    {selectedAlert.details?.map((emp: any, idx: number) => (
                       <div key={idx} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[1.5rem] hover:border-blue-200 transition-all group">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                <UserIcon size={20} />
                             </div>
                             <div>
                                <p className="text-sm font-black text-slate-900">{emp.name}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{emp.dept}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                                emp.risk === 'Critical' ? 'bg-rose-100 text-rose-600' :
                                emp.risk === 'High' ? 'bg-amber-100 text-amber-600' :
                                'bg-slate-100 text-slate-600'
                             }`}>
                                {emp.risk} Risk
                             </span>
                             <p className="text-[9px] font-bold text-slate-400 mt-1">{emp.factor}</p>
                          </div>
                       </div>
                    ))}
                 </div>

                 <div className="mt-10 flex justify-center">
                    <button 
                      onClick={handleAcknowledge}
                      disabled={ackLoading || ackSuccess}
                      className={`px-10 py-3 rounded-2xl font-black text-xs shadow-xl transition-all flex items-center gap-2 ${
                        ackSuccess ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                       {ackLoading ? <RefreshCcw size={16} className="animate-spin" /> : ackSuccess ? <CheckCircle2 size={16} /> : null}
                       {ackSuccess ? 'Protocol Acknowledged' : 'Acknowledge Protocol'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
