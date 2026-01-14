'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  TrendingUp, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  DollarSign, 
  Calendar,
  Layers,
  RefreshCcw,
  Target,
  ArrowUpRight
} from 'lucide-react';
import api from '@/lib/api';

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/crm/deals');
      setDeals(response.data || []);
    } catch (error) {
      console.error('Failed to fetch deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeals = deals.filter(deal => 
    deal.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 md:p-10 overflow-y-auto max-h-screen custom-scrollbar">
        
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Layers size={14} className="text-purple-500" />
              <span className="text-purple-600 font-black text-[10px] uppercase tracking-[0.2em]">Transaction Pipeline v1.2</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Deal Pipeline</h2>
            <p className="text-slate-500 font-bold mt-1 opacity-80 uppercase text-[10px] tracking-widest">Active Revenue Streams & Probability Matrix</p>
          </div>
          <div className="flex gap-3">
             <button onClick={fetchDeals} className="bg-white border-2 border-slate-100 text-slate-700 p-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-xs hover:bg-slate-800 shadow-xl transition-all flex items-center gap-2">
              <Plus size={16} /> Create Deal
            </button>
          </div>
        </header>

        {/* Pipeline Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
            <PipelineStage title="Prospecting" count={deals.filter(d => d.stage === 'prospecting').length} color="blue" />
            <PipelineStage title="Negotiation" count={deals.filter(d => d.stage === 'negotiation').length} color="amber" />
            <PipelineStage title="Closed Won" count={deals.filter(d => d.stage === 'closed_won').length} color="emerald" />
            <PipelineStage title="Closed Lost" count={deals.filter(d => d.stage === 'closed_lost').length} color="rose" />
        </div>

        {/* Deal List */}
        <div className="space-y-4">
             {loading ? (
                <div className="py-20 text-center bg-white rounded-[2.5rem] border border-slate-100">
                    <div className="animate-spin text-blue-500 mb-4 flex justify-center"><RefreshCcw size={32} /></div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Scanning Pipeline Segments...</p>
                </div>
             ) : (
                <>
                    {filteredDeals.length === 0 && (
                        <div className="py-20 text-center bg-white rounded-[2.5rem] border border-slate-100 opacity-30 italic font-bold text-slate-400">
                            No deals currently active in the pipeline.
                        </div>
                    )}
                    {filteredDeals.map((deal) => (
                        <div key={deal._id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 group">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-blue-600 transition-colors">
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-slate-900 leading-tight">{deal.title}</h4>
                                    <div className="flex items-center gap-4 mt-1">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            <Target size={12} className="text-blue-500" /> Lead ID: {deal.lead.slice(-6).toUpperCase()}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            <Calendar size={12} className="text-purple-500" /> Exp. Close: {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-10">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Probability</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500" style={{ width: `${deal.probability}%` }}></div>
                                        </div>
                                        <span className="text-xs font-black text-slate-900">{deal.probability}%</span>
                                    </div>
                                </div>
                                <div className="h-10 w-px bg-slate-100 hidden lg:block"></div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deal Value</p>
                                    <p className="text-xl font-black text-slate-900 tracking-tighter">${deal.amount.toLocaleString()}</p>
                                </div>
                                <button className="p-3 bg-slate-50 text-slate-300 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <ArrowUpRight size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </>
             )}
        </div>
      </main>
    </div>
  );
}

function PipelineStage({ title, count, color }: any) {
    const colors: any = {
        blue: 'text-blue-600 bg-blue-50 border-blue-100',
        amber: 'text-amber-600 bg-amber-50 border-amber-100',
        emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        rose: 'text-rose-600 bg-rose-50 border-rose-100',
    };
    return (
        <div className={`p-6 rounded-[1.5rem] border ${colors[color]} flex items-center justify-between`}>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{title}</p>
                <p className="text-2xl font-black mt-1">{count}</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
                <Layers size={18} />
            </div>
        </div>
    );
}
