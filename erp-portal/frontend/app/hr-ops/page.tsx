'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { KPICard } from '@/components/hr/KPICard';
import { AlertItem } from '@/components/hr/AlertItem';
import { LifecycleTable } from '@/components/hr/LifecycleTable';
import { PermissionGate } from '@/components/hr/PermissionGate';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Flame, 
  ClipboardList, 
  TrendingUp, 
  Calendar,
  ShieldCheck,
  FileWarning,
  RefreshCcw
} from 'lucide-react';
import api from '@/lib/api';

export default function HROpsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hr-core/operations');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching HR stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const attendanceData = [
    { name: 'Eng', value: 92 },
    { name: 'Sales', value: 88 },
    { name: 'HR', value: 95 },
    { name: 'Ops', value: 85 },
    { name: 'Admin', value: 98 },
  ];

  const attritionRiskData = [
    { name: 'Critical', value: 12, fill: '#f43f5e' },
    { name: 'High', value: 25, fill: '#f59e0b' },
    { name: 'Stable', value: 163, fill: '#10b981' },
  ];

  const lifecycleItems: any[] = [
    { id: '1', name: 'Arjun Mehta', type: 'Onboarding', date: 'Oct 15, 2023', status: 'In Progress' },
    { id: '2', name: 'Sarah Drasner', type: 'Probation', date: 'Oct 20, 2023', status: 'Pending' },
    { id: '3', name: 'Kevin Durant', type: 'Exit', date: 'Oct 12, 2023', status: 'Warning' },
    { id: '4', name: 'Priya Sharma', type: 'Confirmation', date: 'Oct 28, 2023', status: 'Completed' },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={14} className="text-blue-500" />
              <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">HR Management System v2.0</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">HR Operations</h2>
            <p className="text-slate-500 font-bold mt-1 opacity-80 uppercase text-[10px] tracking-widest">Enterprise Human Capital Command Center</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchStats} className="bg-white border-2 border-slate-100 text-slate-700 p-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
              <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="bg-white border-2 border-slate-100 text-slate-700 px-5 py-2.5 rounded-xl font-black text-xs hover:bg-slate-50 transition-all shadow-sm">Generate Monthly Report</button>
          </div>
        </header>

        {/* 1. KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          <KPICard title="Total Employees" value={stats?.total_employees?.toString() || "..."} trend="+4" trendType="positive" icon={<Users size={20} />} color="blue" />
          <KPICard title="New Joinees" value={stats?.onboarding_active?.toString() || "..."} trend="This Month" icon={<UserPlus size={20} />} color="emerald" />
          <KPICard title="Resignations" value="3" trend="-20%" trendType="positive" icon={<UserMinus size={20} />} color="rose" />
          <KPICard title="Attrition Risk" value="8" trend="High Alert" trendType="negative" icon={<Flame size={20} />} color="amber" />
          <KPICard title="Pending Leaves" value={stats?.leaves_pending?.toString() || "..."} icon={<ClipboardList size={20} />} color="purple" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* 2. Attendance Insights (Dept Wise) */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-900">Attendance %</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department-wise Breakdown</p>
              </div>
              <Calendar size={20} className="text-slate-300" />
            </div>
            <div className="h-64 w-full bg-slate-50/50 rounded-[2rem] border border-slate-100 flex items-center justify-center">
              <div className="text-center">
                <Users size={32} className="text-slate-200 mx-auto mb-2" />
                <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Telemetry Syncing...</span>
              </div>
            </div>
          </div>

          {/* 3. Attrition Risk Distribution */}
          <PermissionGate allowedRoles={['super_admin', 'dept_admin']} showFallback={true}>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-full">
              <h3 className="text-lg font-black text-slate-900 mb-2">Attrition Risk</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Company-wide Analysis</p>
              <div className="h-48 w-full mb-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 flex items-center justify-center">
                <div className="text-center">
                  <Flame size={32} className="text-slate-200 mx-auto mb-2" />
                  <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Calculating Risk...</span>
                </div>
              </div>
              <div className="space-y-3 mt-auto">
                {attritionRiskData.map(d => (
                  <div key={d.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.fill}}></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{d.name}</span>
                    </div>
                    <span className="text-sm font-black text-slate-900">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </PermissionGate>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 4. Lifecycle & Performance */}
          <div className="lg:col-span-2 space-y-8">
            <LifecycleTable title="Employee Lifecycle" items={lifecycleItems} />
            
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Performance & Appraisals</h3>
                <TrendingUp size={18} className="text-emerald-500" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Eligible for Promotion</p>
                  <p className="text-2xl font-black text-emerald-900">14</p>
                </div>
                <div className="p-5 rounded-2xl bg-rose-50 border border-rose-100">
                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Overdue Appraisals</p>
                  <p className="text-2xl font-black text-rose-900">06</p>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Alerts & Compliance */}
          <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 px-2">
              <FileWarning size={20} className="text-rose-600" /> Critical Alerts
            </h3>
            
            <AlertItem 
              category="Burnout Risk"
              title="Software Engineering Team"
              description="High excessive overtime detected in 8 developers."
              severity="high"
              timestamp="2 hours ago"
              reason="Continuous 12+ hour shifts for 10 days straight on 'ERP-Phase2' project. Recommend immediate rotation or week-off."
            />

            <AlertItem 
              category="Compliance"
              title="Missing ESIC Documents"
              description="15 new joinees haven't uploaded ID proof."
              severity="medium"
              timestamp="5 hours ago"
              reason="Document validation failed for the latest batch. ESIC registration will be delayed if not resolved by EOD."
            />

            <AlertItem 
              category="Attendance"
              title="Frequent Late Login"
              description="Marketing dept showing 22% late login."
              severity="low"
              timestamp="Yesterday"
              reason="Averaging 45 mins delay. Might be due to shift timing mismatch or commute issues. Recommend manager check-in."
            />

            <div className="mt-8 p-8 bg-slate-900 rounded-[2.5rem] text-white">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-slate-400">Compliance Status</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                    <span>PF / Insurance Sync</span>
                    <span className="text-emerald-400">92%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[92%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                    <span>Policy Acknowledgement</span>
                    <span className="text-amber-400">64%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[64%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
