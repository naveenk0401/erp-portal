'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  PieChart, 
  ArrowUpRight, 
  RefreshCcw,
  DollarSign,
  Zap,
  Activity
} from 'lucide-react';
import api from '@/lib/api';

export default function CRMDashboard() {
  const [stats, setStats] = useState<any>({
    forecast: { projected_revenue: 0 },
    active_leads_count: 0,
    deal_pipeline_value: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/crm/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch CRM stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 md:p-10 overflow-y-auto max-h-screen custom-scrollbar">
        
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-amber-500 fill-amber-500" />
              <span className="text-amber-600 font-black text-[10px] uppercase tracking-[0.2em]">Sales Pulse Engine v2.4</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">CRM Analytics</h2>
            <p className="text-slate-500 font-bold mt-1 opacity-80 uppercase text-[10px] tracking-widest">Revenue Forecast & Funnel Performance</p>
          </div>
          <div className="flex gap-3">
             <button onClick={fetchDashboardData} className="bg-white border-2 border-slate-100 text-slate-700 p-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-xs hover:bg-slate-800 shadow-xl transition-all flex items-center gap-2">
              <TrendingUp size={16} /> Strategy Review
            </button>
          </div>
        </header>

        {/* Metric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <MetricCard 
                title="Projected Revenue" 
                value={`$${stats.forecast.projected_revenue.toLocaleString()}`} 
                trend="+12.5%" 
                icon={<DollarSign className="text-emerald-500" />} 
                description="Weighted forecast based on probability"
            />
            <MetricCard 
                title="Active Lead Chain" 
                value={stats.active_leads_count.toString()} 
                trend="+4 last 24h" 
                icon={<Target className="text-blue-500" />} 
                description="Total active qualified leads"
            />
            <MetricCard 
                title="Pipeline Exposure" 
                value={`$${stats.deal_pipeline_value.toLocaleString()}`} 
                trend="Stable" 
                icon={<Activity className="text-purple-500" />} 
                description="Total value of all open deals"
            />
        </div>

        {/* Secondary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 min-h-[400px]">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
                        <BarChart3 size={20} className="text-blue-500" /> Lead Source Distribution
                    </h3>
                </div>
                <div className="flex items-center justify-center p-20 border-2 border-dashed border-slate-100 rounded-[2rem]">
                    <div className="text-center">
                        <PieChart size={48} className="text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Crunching Segment Data...</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
                        <Activity size={20} className="text-blue-500" /> Recent Deal Flux
                    </h3>
                    <button className="text-[10px] font-black uppercase text-blue-600 tracking-widest">View Ledger</button>
                </div>
                <div className="space-y-4">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp size={14} className="text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-900">Enterprise SaaS Sync</p>
                                    <p className="text-[9px] font-bold text-slate-400">85% Probability • Closing in 12 days</p>
                                </div>
                            </div>
                            <p className="text-xs font-black text-slate-900">$42,500</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </main>
    </div>
  );
}

function MetricCard({ title, value, trend, icon, description }: any) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform">
                {icon}
            </div>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</span>
            </div>
            <div className="flex items-baseline gap-3">
                <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h4>
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider">{trend}</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-4 leading-relaxed max-w-[80%]">{description}</p>
        </div>
    );
}
