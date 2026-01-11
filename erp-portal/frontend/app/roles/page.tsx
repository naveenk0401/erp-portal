'use client';

import Sidebar from '@/components/Sidebar';
import { ShieldCheck, Construction } from 'lucide-react';

export default function RolesPage() {
  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 md:p-10 flex flex-col items-center justify-center text-center">
        <div className="bg-emerald-50 p-6 rounded-3xl mb-6 text-emerald-600">
          <ShieldCheck size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Roles & Permissions</h2>
        <p className="text-slate-500 font-bold max-w-md">
          Advanced RBAC (Role-Based Access Control) module is being integrated. Soon you'll be able to define granular permissions for every role.
        </p>
        <div className="mt-10 flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest">
          <Construction size={16} className="text-amber-400" /> Module Scaling in Progress
        </div>
      </main>
    </div>
  );
}
