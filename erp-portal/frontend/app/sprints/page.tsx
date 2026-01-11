'use client';

import Sidebar from '@/components/Sidebar';
import { Activity, Construction, Layers, Target, Clock } from 'lucide-react';

export default function SprintsPage() {
  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 md:p-10 flex flex-col items-center justify-center text-center">
        <div className="bg-blue-50 p-6 rounded-3xl mb-6 text-blue-600 animate-pulse">
          <Activity size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Sprint Management</h2>
        <p className="text-slate-500 font-bold max-w-md">
          Track weekly sprints across all departments. Monitor planned vs completed story points and identify blockers in real-time.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4 w-full max-w-sm">
           <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <Target size={20} className="text-blue-500 mb-2 mx-auto" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next Sprint</p>
              <p className="text-sm font-bold text-slate-900">Sprint Aries</p>
           </div>
           <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <Clock size={20} className="text-emerald-500 mb-2 mx-auto" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</p>
              <p className="text-sm font-bold text-slate-900">14 Days</p>
           </div>
        </div>
        <div className="mt-10 flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest">
          <Construction size={16} className="text-amber-400" /> Agile Scaling in Progress
        </div>
      </main>
    </div>
  );
}
