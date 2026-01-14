'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Search, 
  Filter,
  MoreVertical,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export default function ApprovalsPage() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState([
    { id: '1', name: 'Arjun Mehta', dept: 'Software', submittedBy: 'Vikram Singh', date: 'Oct 10, 2023', status: 'Pending' },
    { id: '2', name: 'Sarah Drasner', dept: 'Design', submittedBy: 'Maria Garcia', date: 'Oct 11, 2023', status: 'Pending' },
    { id: '3', name: 'Kevin Durant', dept: 'Sales', submittedBy: 'Steve Nash', date: 'Oct 12, 2023', status: 'Approved' },
  ]);

  const handleAction = (id: string, action: 'Approved' | 'Rejected') => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: action } : r));
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <UserCheck size={14} className="text-blue-500" />
              <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">Administrative Approval Queue</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Onboarding Approvals</h2>
            <p className="text-slate-500 font-bold mt-1 opacity-80 uppercase text-[10px] tracking-widest">Verify and Provision New Employee IDs</p>
          </div>
          <div className="flex gap-2">
            <span className="bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              {requests.filter(r => r.status === 'Pending').length} Pending Requests
            </span>
          </div>
        </header>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                placeholder="Search requests..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium"
              />
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg text-xs font-black text-slate-500 uppercase tracking-widest">
                <Filter size={14} /> Filter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee Name</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Department</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Submitted By</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-bold text-slate-900">{req.name}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-tighter bg-slate-100 px-3 py-1 rounded-lg">{req.dept}</span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-bold text-slate-600">{req.submittedBy}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-bold text-slate-400">{req.date}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        req.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        {req.status === 'Pending' && (
                          <>
                            <button 
                              onClick={() => handleAction(req.id, 'Approved')}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Approve"
                            >
                              <CheckCircle size={20} />
                            </button>
                            <button 
                              onClick={() => handleAction(req.id, 'Rejected')}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Reject"
                            >
                              <XCircle size={20} />
                            </button>
                          </>
                        )}
                        <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all" title="View Details">
                          <Eye size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
