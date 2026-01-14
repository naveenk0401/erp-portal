'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  Mail, 
  Phone, 
  Building2, 
  Tag,
  RefreshCcw,
  UserPlus
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function LeadsPage() {
  const { user } = useAuthStore();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      // lib/api.ts now returns 'response.data' directly
      const response = await api.get('/crm/leads');
      setLeads(response.data || []);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.company || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 md:p-10 overflow-y-auto max-h-screen custom-scrollbar">
        
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users size={14} className="text-blue-500" />
              <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">CRM Lead Intelligence v3.0</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Lead Portfolio</h2>
            <p className="text-slate-500 font-bold mt-1 opacity-80 uppercase text-[10px] tracking-widest">Revenue Opportunity Tracking System</p>
          </div>
          <div className="flex gap-3">
             <button onClick={fetchLeads} className="bg-white border-2 border-slate-100 text-slate-700 p-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-xs hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center gap-2">
              <Plus size={16} /> New Lead
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              placeholder="Filter leads by name, email or company..." 
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-slate-500 hover:text-blue-600 transition-colors">
            <Filter size={20} />
          </button>
        </div>

        {/* Lead Table */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Lead Identity</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Organization</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned To</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <div className="animate-spin text-blue-500 mb-4 flex justify-center"><RefreshCcw size={32} /></div>
                                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Accessing CRM Vault...</p>
                                </td>
                            </tr>
                        ) : (
                            <>
                                {filteredLeads.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center opacity-30 italic font-bold text-slate-400">
                                            No leads identified in the current pipeline.
                                        </td>
                                    </tr>
                                )}
                                {filteredLeads.map((lead) => (
                                    <tr key={lead._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">
                                                    {lead.name[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 leading-tight">{lead.name}</p>
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mt-1">
                                                        <Mail size={10} /> {lead.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <Building2 size={14} className="text-slate-400" />
                                                <span className="text-xs font-bold text-slate-600">{lead.company || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(lead.status)}`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[8px] font-black">
                                                    AS
                                                </div>
                                                <span className="text-xs font-bold text-slate-500 tracking-tight">Ananth S.</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                                                <ChevronRight size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </>
                        )}
                    </tbody>
                </table>
             </div>
        </div>
      </main>
    </div>
  );
}

function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
        case 'new': return 'text-blue-600 bg-blue-50 border-blue-100';
        case 'contacted': return 'text-amber-600 bg-amber-50 border-amber-100';
        case 'qualified': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        case 'won': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        case 'lost': return 'text-rose-600 bg-rose-50 border-rose-100';
        default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
}
