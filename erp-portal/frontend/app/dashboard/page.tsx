'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CheckSquare, 
  IndianRupee, 
  ArrowUpRight, 
  TrendingUp, 
  Activity,
  PlaneTakeoff,
  AlertCircle,
  Clock,
  Briefcase,
  BarChart3,
  Settings,
  FileText,
  Bell,
  ShieldCheck,
  Download,
  Star,
  ChevronRight,
  History,
  Layers,
  AlertTriangle,
  Flame,
  UserMinus
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const delayTrendData = [
  { name: 'W1', value: 2 },
  { name: 'W2', value: 5 },
  { name: 'W3', value: 3 },
  { name: 'W4', value: 8 },
  { name: 'W5', value: 6 },
];

const salaryVsRevenueData = [
  { name: 'Jan', revenue: 120, salary: 40 },
  { name: 'Feb', revenue: 150, salary: 42 },
  { name: 'Mar', revenue: 110, salary: 45 },
  { name: 'Apr', revenue: 180, salary: 48 },
  { name: 'May', revenue: 160, salary: 50 },
];

const deptProductivityData = [
  { name: 'Eng', value: 85 },
  { name: 'Sales', value: 92 },
  { name: 'HR', value: 78 },
  { name: 'Ops', value: 88 },
];

const attritionRiskData = [
  { name: 'High', value: 5, fill: '#f43f5e' },
  { name: 'Medium', value: 15, fill: '#f59e0b' },
  { name: 'Low', value: 80, fill: '#10b981' },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/dashboard/overview');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold">Initializing Command Center...</p>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const alerts = data?.alerts || [];

  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto max-h-screen custom-scrollbar">
        <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span className="text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em]">Super Admin Command v4.0</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Enterprise Overview</h2>
            <p className="text-slate-500 mt-1 font-bold text-sm opacity-70">
              Decision-focused real-time organizational metrics.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border-2 border-slate-100 text-slate-700 px-5 py-2.5 rounded-xl font-black text-xs hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 text-nowrap">
              <Download size={16} /> Export Data
            </button>
          </div>
        </header>

        {/* 1. KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-10">
          <StatCardSmall title="Active Projects" value={kpis.active_projects?.toString() || "0"} icon={<Layers size={16} />} color="blue" />
          <StatCardSmall title="Sprint Success" value={kpis.sprint_success || "0%"} icon={<Activity size={16} />} color="emerald" />
          <StatCardSmall title="Burnout Risk" value={kpis.burnout_risk?.toString() || "0"} icon={<Flame size={16} />} color="rose" />
          <StatCardSmall title="Attrition Risk" value={kpis.attrition_risk?.toString() || "0"} icon={<UserMinus size={16} />} color="amber" />
          <StatCardSmall title="Salary Cost" value={kpis.salary_cost || "₹0"} icon={<IndianRupee size={16} />} color="indigo" />
          <StatCardSmall title="Revenue" value={kpis.revenue || "₹0"} icon={<TrendingUp size={16} />} color="green" />
          <StatCardSmall title="Net Worth" value={kpis.net_worth || "0"} icon={<Star size={16} />} color="purple" />
        </div>

        {/* 2. Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          
          {/* Main Chart: Salary vs Revenue */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-black text-slate-900">Revenue vs Salary Cost</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last 5 Months</span>
             </div>
             <div className="h-72 w-full bg-slate-50/50 rounded-[2rem] border border-slate-100 flex items-center justify-center">
                <div className="text-center">
                   <span className="text-slate-400 font-bold text-sm">Dashboard Analytics Ready</span>
                </div>
             </div>
          </div>

          {/* Attrition Risk Distribution (Pie) */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
             <h3 className="text-lg font-black text-slate-900 mb-8 text-center">Attrition Risk</h3>
             <div className="h-56 w-full mb-4 bg-slate-50/50 rounded-[2rem] border border-slate-100 flex items-center justify-center">
                <span className="text-slate-400 font-bold text-sm">Real-time Risk Map</span>
             </div>
             <div className="flex justify-around gap-2 mt-auto">
                {attritionRiskData.map(d => (
                   <div key={d.name} className="flex flex-col items-center">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.name}</span>
                      <span className="text-sm font-black text-slate-900">{d.value}%</span>
                   </div>
                ))}
             </div>
          </div>

        </div>

        {/* 3. Bottom Row: Productivity, Delays, and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">
           
           {/* Department Productivity (Bar) */}
           <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-widest text-center">Dept Productivity</h3>
              <div className="h-48 w-full bg-slate-50/50 rounded-[2rem] border border-slate-100 flex items-center justify-center">
                 <span className="text-slate-400 font-bold text-sm">Resource Velocity</span>
              </div>
           </div>

           {/* Project Delay Trend (Line) */}
           <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-widest text-center">Delay Trend</h3>
              <div className="h-48 w-full bg-slate-50/50 rounded-[2rem] border border-slate-100 flex items-center justify-center">
                 <span className="text-slate-400 font-bold text-sm">Timeline Variance</span>
              </div>
           </div>

           {/* 4. Alerts Panel (MOST IMPORTANT) */}
           <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 px-2">
                 <AlertCircle size={20} className="text-rose-600" /> Executive Alerts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {alerts.length > 0 ? alerts.map((alert: any, i: number) => (
                    <AlertItem 
                      key={i} 
                      title={alert.title} 
                      desc={alert.desc} 
                      color={alert.color as any} 
                      icon={alert.color === 'rose' ? <AlertTriangle size={16} /> : alert.color === 'amber' ? <Briefcase size={16} /> : <CheckSquare size={16} />} 
                    />
                 )) : (
                    <div className="col-span-2 p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                       <p className="text-slate-400 font-bold text-sm">No critical alerts detected.</p>
                    </div>
                 )}
              </div>
           </div>

        </div>
      </main>
    </div>
  );
}

function StatCardSmall({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
   const colors: any = {
      blue: 'bg-blue-50 text-blue-600',
      emerald: 'bg-emerald-50 text-emerald-600',
      rose: 'bg-rose-50 text-rose-600',
      amber: 'bg-amber-50 text-amber-600',
      indigo: 'bg-indigo-50 text-indigo-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600'
   };

   return (
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:shadow-md transition-all">
         <div className={`p-2 rounded-xl mb-3 ${colors[color]} group-hover:scale-110 transition-transform`}>
            {icon}
         </div>
         <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}</p>
         <p className="text-sm font-black text-slate-900">{value}</p>
      </div>
   );
}

function AlertItem({ title, desc, color, icon }: { title: string, desc: string, color: 'rose' | 'orange' | 'amber' | 'emerald', icon: React.ReactNode }) {
   const colors = {
      rose: 'bg-rose-50 text-rose-600 border-rose-100',
      orange: 'bg-orange-50 text-orange-600 border-orange-100',
      amber: 'bg-amber-50 text-amber-600 border-amber-100',
      emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100'
   };

   return (
      <div className={`p-4 rounded-2xl border flex items-center gap-4 hover:shadow-lg transition-all cursor-pointer ${colors[color]}`}>
         <div className="bg-white/50 p-2 rounded-lg shadow-sm">
            {icon}
         </div>
         <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{title}</p>
            <p className="text-xs font-bold text-slate-900 truncate">{desc}</p>
         </div>
      </div>
   );
}
