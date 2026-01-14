'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Shield, 
  ArrowRight, 
  Building, 
  Activity, 
  Briefcase,
  Zap
} from 'lucide-react';
import { getAccessToken, parseJwt } from '@/lib/auth';
import api from '@/lib/api';
import Sidebar from '@/components/Sidebar';

interface Stats {
  user_count: number;
  role_count: number;
  company_name: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.push('/login');
      return;
    }
    const payload = parseJwt(token);
    if (!payload?.active_company_id) {
        router.push('/onboarding');
        return;
    }
    setUserEmail(payload.sub);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('dashboard/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-10 bg-slate-950/30 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-1">
              {isLoading ? 'Loading workspace...' : `Welcome to ${stats?.company_name}`}
            </h1>
            <p className="text-slate-400 font-medium">{userEmail}</p>
          </div>
          <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 px-5 py-2.5 rounded-2xl">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 ring-4 ring-emerald-500/5">
                <Building size={16} />
            </div>
            <div className="text-left">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Active Hub</p>
                <p className="text-xs font-bold text-white leading-none">{stats?.company_name || 'ERP Portal'}</p>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl shadow-blue-500/20">
            <div className="relative z-10 h-full flex flex-col justify-between">
               <div>
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/10">
                    <Zap className="text-white" size={24} />
                  </div>
                  <h2 className="text-3xl font-black mb-4 leading-tight">Your Infrastructure is<br />Enterprise Ready.</h2>
                  <p className="text-blue-50/80 max-w-md font-medium leading-relaxed">
                    Managed multi-tenancy is active. All data remains isolated within your dedicated workspace repository.
                  </p>
               </div>
               <div className="mt-8">
                  <button 
                    onClick={() => router.push('/dashboard/users')}
                    className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-50 transition-all active:scale-95 shadow-lg shadow-black/10"
                   >
                    Manage Team Access
                    <ArrowRight size={16} />
                  </button>
               </div>
            </div>
            {/* Abstract Shapes */}
            <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-white/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[20%] w-40 h-40 bg-indigo-400/20 blur-[60px] rounded-full" />
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden group">
             <div className="flex justify-between items-start">
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center ring-8 ring-emerald-500/5">
                   <Activity size={28} />
                </div>
                <div className="text-right">
                   <p className="text-emerald-500 text-xs font-black uppercase tracking-widest">System Health</p>
                   <p className="text-white font-bold">Optimal</p>
                </div>
             </div>
             <div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[11px] mb-2">Platform Status</p>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full w-[95%] bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-lg shadow-emerald-500/20" />
                </div>
                <p className="text-slate-400 text-xs mt-3 font-medium">99.9% uptime maintained in current session.</p>
             </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Identity Hub */}
          <div className="bg-[#1e293b]/30 border border-slate-800/60 p-6 rounded-3xl hover:border-blue-500/40 transition-all group cursor-pointer" onClick={() => router.push('/dashboard/users')}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
              <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest">Total Members</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black text-white">{isLoading ? '...' : stats?.user_count}</p>
              <p className="text-xs text-slate-500 font-medium">Identities</p>
            </div>
          </div>

          {/* Access Control */}
          <div className="bg-[#1e293b]/30 border border-slate-800/60 p-6 rounded-3xl hover:border-emerald-500/40 transition-all group cursor-pointer" onClick={() => router.push('/dashboard/roles')}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield size={20} />
              </div>
              <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest">Active Roles</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black text-white">{isLoading ? '...' : stats?.role_count}</p>
              <p className="text-xs text-slate-500 font-medium">Defined</p>
            </div>
          </div>

          {/* Operations */}
          <div className="bg-[#1e293b]/30 border border-slate-800/60 p-6 rounded-3xl hover:border-purple-500/40 transition-all group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Briefcase size={20} />
              </div>
              <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest">Operations</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black text-white">Live</p>
              <p className="text-xs text-slate-500 font-medium">Modules</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#1e293b]/30 border border-emerald-500/20 p-6 rounded-3xl flex flex-col justify-center">
             <button 
                onClick={() => router.push('/dashboard/roles')}
                className="w-full py-2 px-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
             >
                Define New Role
             </button>
          </div>
        </div>
      </main>
    </div>
  );
}
