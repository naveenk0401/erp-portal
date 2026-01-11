'use client';

import Sidebar from '@/components/Sidebar';
import { 
  UserCheck, 
  Search, 
  Filter, 
  Star, 
  TrendingUp, 
  Briefcase, 
  Clock, 
  Award,
  ChevronRight,
  PieChart as PieIcon,
  BarChart as BarIcon,
  Radar
} from 'lucide-react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar as RadarGraphic, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

const mockPerformanceData = [
  { subject: 'Productivity', A: 120, fullMark: 150 },
  { subject: 'Reliability', A: 98, fullMark: 150 },
  { subject: 'Skillset', A: 86, fullMark: 150 },
  { subject: 'Leadership', A: 99, fullMark: 150 },
  { subject: 'Communication', A: 85, fullMark: 150 },
  { subject: 'Efficiency', A: 65, fullMark: 150 },
];

const mockProjectHistory = [
  { name: 'Jan', tasks: 45 },
  { name: 'Feb', tasks: 52 },
  { name: 'Mar', tasks: 38 },
  { name: 'Apr', tasks: 65 },
  { name: 'May', tasks: 48 },
  { name: 'Jun', tasks: 59 },
];

export default function EmployeeAnalyticsPage() {
  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 md:p-10 overflow-y-auto max-h-screen custom-scrollbar">
        <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <UserCheck className="text-blue-600" size={32} /> Employee Analytics
            </h2>
            <p className="text-slate-500 mt-1 font-bold text-sm opacity-70">
              Deep performance insights, skill matrix, and project contribution metrics.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search employee analytics..." 
                className="pl-10 pr-4 py-2.5 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 w-full lg:w-64 shadow-sm"
              />
            </div>
            <button className="bg-white border-2 border-slate-100 text-slate-700 px-5 py-2.5 rounded-xl font-black text-xs hover:bg-slate-50 transition-all shadow-sm">
              <Filter size={18} />
            </button>
          </div>
        </header>

        {/* Selected Employee Summary Card */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-10">
          <div className="p-10 flex flex-col lg:flex-row gap-12">
            
            {/* Left: Basic Info */}
            <div className="lg:w-1/3 flex flex-col items-center text-center lg:text-left lg:items-start lg:border-r lg:border-slate-50 lg:pr-12">
               <div className="w-32 h-32 bg-slate-900 rounded-[2.5rem] flex items-center justify-center font-black text-white text-4xl mb-6 shadow-2xl shadow-slate-200">
                  SM
               </div>
               <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Siddharth Mehta</h3>
               <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-6">Senior Software Engineer</p>
               
               <div className="space-y-4 w-full">
                  <InfoItem icon={<Briefcase size={16} />} label="Department" value="Engineering" />
                  <InfoItem icon={<Clock size={16} />} label="Tenure" value="2.4 Years" />
                  <InfoItem icon={<Award size={16} />} label="Rating" value="4.8 / 5.0" />
               </div>

               <div className="mt-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 w-full">
                  <div className="flex items-center gap-2 text-emerald-600 mb-1">
                     <TrendingUp size={14} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Promotion Ready</span>
                  </div>
                  <p className="text-[10px] font-bold text-emerald-800 opacity-70 italic leading-tight">
                    High consistency in sprint delivery and leadership metrics in the last 2 quarters.
                  </p>
               </div>
            </div>

            {/* Right: Visualization Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-10">
               
               {/* Skill Matrix - Radar Chart */}
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                     <Radar size={14} /> Skill Matrix Analysis
                  </h4>
                  <div className="h-64 w-full bg-slate-50/50 rounded-[2rem] border border-slate-100 flex items-center justify-center">
                     <span className="text-slate-400 font-bold text-sm">Chart placeholder</span>
                  </div>
               </div>

               {/* Project Velocity - Bar Chart */}
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                     <BarIcon size={14} /> Project Task Velocity
                  </h4>
                  <div className="h-64 w-full bg-slate-50/50 rounded-[2rem] border border-slate-100 flex items-center justify-center">
                     <span className="text-slate-400 font-bold text-sm">Chart placeholder</span>
                  </div>
               </div>

            </div>
          </div>
        </div>

        {/* Contribution Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
           <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-8 px-1">Recent Project Contributions</h3>
              <div className="space-y-4">
                 <ContributionItem project="ERP-Core Enterprise" role="Lead Dev" timeline="Jan - Present" impact="Critical" />
                 <ContributionItem project="Cloud Migrator Tool" role="Consultant" timeline="Mar - Apr" impact="High" />
                 <ContributionItem project="Security Hub v2" role="Peer Reviewer" timeline="Jun - Jun" impact="Medium" />
              </div>
           </div>

           <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Star size={100} />
              </div>
              <h4 className="text-blue-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Strategic Fit</h4>
              <p className="text-2xl font-black leading-tight mb-6">Siddharth is currently optimized for Tech-Lead roles.</p>
              <button className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-slate-50 transition-all w-fit">
                 Plan Promotion
              </button>
           </div>
        </div>
      </main>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
   return (
      <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
         <div className="flex items-center gap-3 text-slate-400">
            {icon}
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
         </div>
         <span className="text-sm font-black text-slate-900">{value}</span>
      </div>
   );
}

function ContributionItem({ project, role, timeline, impact }: { project: string, role: string, timeline: string, impact: string }) {
   return (
      <div className="p-5 bg-slate-50 rounded-2xl flex items-center justify-between group hover:bg-white hover:shadow-lg hover:border-slate-100 border border-transparent transition-all">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-blue-600 shadow-sm">
               {project[0]}
            </div>
            <div>
               <p className="text-sm font-black text-slate-900">{project}</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase">{role} • {timeline}</p>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
               impact === 'Critical' ? 'bg-rose-50 text-rose-600 border-rose-100' :
               impact === 'High' ? 'bg-blue-50 text-blue-600 border-blue-100' :
               'bg-slate-50 text-slate-400 border-slate-200'
            }`}>
               {impact}
            </span>
            <ChevronRight size={18} className="text-slate-200 group-hover:text-blue-600 transition-colors" />
         </div>
      </div>
   );
}
