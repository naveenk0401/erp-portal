'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  History, 
  Search, 
  Filter, 
  ShieldCheck, 
  User, 
  Clock, 
  Database, 
  AlertCircle,
  RefreshCcw,
  Terminal,
  Activity,
  ChevronRight,
  Fingerprint
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function AuditLogsPage() {
  const { user } = useAuthStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModule, setActiveModule] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/audit-logs');
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
      const matchesSearch = (log.user_email || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (log.action || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesModule = activeModule === 'all' || log.module.toLowerCase() === activeModule.toLowerCase();
      return matchesSearch && matchesModule;
  });

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'UPDATE': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'DELETE': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'APPROVE': return 'text-purple-600 bg-purple-50 border-purple-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const modules = ['all', 'employee', 'payroll', 'task', 'rule', 'leave'];

  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 md:p-10 overflow-y-auto max-h-screen custom-scrollbar">
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Fingerprint size={14} className="text-blue-500" />
              <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">Immutable Event Chain v4.0</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Audit & Security Logs</h2>
            <p className="text-slate-500 font-bold mt-1 opacity-80 uppercase text-[10px] tracking-widest">Global Administrative Action Transcription</p>
          </div>
          <div className="flex gap-3">
             <button onClick={fetchLogs} className="bg-white border-2 border-slate-100 text-slate-700 p-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-xs hover:bg-slate-800 shadow-xl transition-all flex items-center gap-2">
              <Database size={16} /> Export CSV
            </button>
          </div>
        </header>

        {/* 1. Quick Filters */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl w-fit overflow-x-auto custom-scrollbar">
                {modules.map(mod => (
                    <button 
                        key={mod}
                        onClick={() => setActiveModule(mod)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeModule === mod ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {mod}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Filter by user or action..." 
                  className="pl-12 pr-6 py-4 bg-slate-50 border-none rounded-[1.5rem] text-sm font-bold focus:ring-2 focus:ring-blue-500 w-full lg:w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
        </div>

        {/* 2. Log Stream */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center">
                <div className="animate-spin text-blue-500 mb-4 flex justify-center"><RefreshCcw size={32} /></div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Accessing Secure Audit Chain...</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Module</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">IP Address</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center opacity-30 italic font-bold text-slate-400">
                        No cryptographic events matching the current criteria.
                      </td>
                    </tr>
                  )}
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                            <Clock size={14} className="text-slate-300" />
                            <p className="text-xs font-bold text-slate-600 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black">
                                {log.role[0].toUpperCase()}
                             </div>
                             <div>
                                <p className="text-sm font-black text-slate-900 leading-tight">{log.user_email}</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{log.role}</p>
                             </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">{log.module}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-2 text-slate-400">
                            <Terminal size={12} />
                            <p className="text-[10px] font-mono font-bold tracking-tighter">{log.ip_address || '127.0.0.1'}</p>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
