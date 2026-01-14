'use client';

import Sidebar from '@/components/Sidebar';
import { Bell, Construction, Megaphone, Users, Zap } from 'lucide-react';

export default function MarketingPage() {
  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 md:p-10 flex flex-col items-center justify-center text-center">
        <div className="bg-pink-50 p-6 rounded-3xl mb-6 text-pink-600">
          <Bell size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Marketing & CRM</h2>
        <p className="text-slate-500 font-bold max-w-md">
          Track campaigns, manage customer leads, and monitor ROI across different marketing channels like Email, WhatsApp, and Ads.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
           <div className="px-5 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-2">
              <Megaphone size={16} className="text-pink-500" />
              <span className="text-xs font-bold text-slate-700">Campaigns</span>
           </div>
           <div className="px-5 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-2">
              <Users size={16} className="text-blue-500" />
              <span className="text-xs font-bold text-slate-700">Leads</span>
           </div>
           <div className="px-5 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-2">
              <Zap size={16} className="text-amber-500" />
              <span className="text-xs font-bold text-slate-700">3.4x ROI</span>
           </div>
        </div>
        <div className="mt-10 flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest">
          <Construction size={16} className="text-amber-400" /> CRM Engine Developing
        </div>
      </main>
    </div>
  );
}
