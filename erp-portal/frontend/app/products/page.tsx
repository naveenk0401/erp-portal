'use client';

import Sidebar from '@/components/Sidebar';
import { Star, Construction, ShoppingBag, BarChart } from 'lucide-react';

export default function ProductsPage() {
  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 md:p-10 flex flex-col items-center justify-center text-center">
        <div className="bg-amber-50 p-6 rounded-3xl mb-6 text-amber-600">
          <Star size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Product & Sales</h2>
        <p className="text-slate-500 font-bold max-w-md">
          Monitor your product catalog, license performance, and revenue growth. Track which products are leading the market in real-time.
        </p>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-md">
           <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><ShoppingBag size={20} /></div>
              <div className="text-left">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Products</p>
                 <p className="text-lg font-black text-slate-900">12 Active</p>
              </div>
           </div>
           <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><BarChart size={20} /></div>
              <div className="text-left">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Revenue</p>
                 <p className="text-lg font-black text-slate-900">₹142.5 Cr</p>
              </div>
           </div>
        </div>
        <div className="mt-10 flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest">
          <Construction size={16} className="text-amber-400" /> Commercial Hub Scaling
        </div>
      </main>
    </div>
  );
}
