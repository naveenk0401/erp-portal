'use client';

import Sidebar from '@/components/Sidebar';
import { FileText, Construction, ShieldCheck, Download, Calculator } from 'lucide-react';

export default function FinancePage() {
  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 md:p-10 flex flex-col items-center justify-center text-center">
        <div className="bg-emerald-50 p-6 rounded-3xl mb-6 text-emerald-600">
          <FileText size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Invoices & Tax</h2>
        <p className="text-slate-500 font-bold max-w-md">
          Professional billing, expense tracking, and automated tax compliance reporting for GST/VAT and TDS filings.
        </p>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
           <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-2">
              <Calculator size={20} className="text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tax Engine</span>
           </div>
           <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-2">
              <Download size={20} className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Audit Ready</span>
           </div>
           <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-2">
              <ShieldCheck size={20} className="text-purple-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Compliance</span>
           </div>
        </div>
        <div className="mt-10 flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest">
          <Construction size={16} className="text-amber-400" /> Finance Ledger Scaling
        </div>
      </main>
    </div>
  );
}
