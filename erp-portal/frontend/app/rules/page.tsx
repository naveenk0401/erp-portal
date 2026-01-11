'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  Cpu, 
  Plus, 
  Search, 
  ToggleLeft, 
  ToggleRight, 
  Clock, 
  AlertTriangle, 
  ChevronRight,
  Settings,
  MoreVertical,
  Activity,
  UserCheck
} from 'lucide-react';

const rules = [
  {
    id: 1,
    name: 'Auto-LOP Trigger',
    description: 'Mark Loss of Pay if employee is absent for 3 consecutive days without approved leave.',
    status: 'active',
    threshold: '3 Days',
    lastTriggered: '2 hours ago',
    impact: 'HR Ops',
    color: 'rose'
  },
  {
    id: 2,
    name: 'Burnout Alert',
    description: 'Flag employee if daily task hours exceed 10 hours for more than 4 days in a week.',
    status: 'active',
    threshold: '10h / 4d',
    lastTriggered: '1 day ago',
    impact: 'Managers',
    color: 'amber'
  },
  {
    id: 3,
    name: 'Promotion Eligibility',
    description: 'Auto-detect employees with 2+ years tenure and "Excellent" performance rating.',
    status: 'inactive',
    threshold: '2y / Excellent',
    lastTriggered: 'Never',
    impact: 'Leadership',
    color: 'emerald'
  },
  {
    id: 4,
    name: 'Project Escalation',
    description: 'Escalate to Super Admin if a Priority-1 ticket remains open for > 48 hours.',
    status: 'active',
    threshold: '48 Hours',
    lastTriggered: '5 hours ago',
    impact: 'Super Admin',
    color: 'blue'
  }
];

export default function RulesEnginePage() {
  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 md:p-10 overflow-y-auto max-h-screen custom-scrollbar">
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Cpu className="text-blue-600" size={32} /> Rules & Automations
            </h2>
            <p className="text-slate-500 mt-1 font-bold text-sm opacity-70">
              Configure organizational logic, triggers, and automated escalations.
            </p>
          </div>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 flex items-center gap-2">
            <Plus size={18} /> New Automation
          </button>
        </header>

        {/* Global Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
           <StatusCard label="Active Rules" value="14" icon={<Activity size={20} />} color="blue" />
           <StatusCard label="Rules Triggered (24h)" value="124" icon={<Clock size={20} />} color="amber" />
           <StatusCard label="Employees Impacted" value="42" icon={<UserCheck size={20} />} color="emerald" />
           <StatusCard label="System Load" value="Normal" icon={<Cpu size={20} />} color="indigo" />
        </div>

        {/* Rules List */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl w-fit">
              <button className="px-4 py-2 bg-white text-blue-600 rounded-lg text-xs font-black shadow-sm">All Automations</button>
              <button className="px-4 py-2 text-slate-400 hover:text-slate-600 rounded-lg text-xs font-black">History</button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search rules..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 w-full lg:w-64"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            {rules.map((rule) => (
              <div key={rule.id} className="p-8 hover:bg-slate-50/50 transition-colors group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">{rule.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        rule.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}>
                        {rule.status}
                      </span>
                    </div>
                    <p className="text-slate-500 font-bold text-sm leading-relaxed max-w-xl">
                      {rule.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-8">
                    <div className="text-center md:text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Threshold</p>
                      <p className="text-sm font-black text-slate-900">{rule.threshold}</p>
                    </div>
                    <div className="text-center md:text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Impact</p>
                      <p className="text-sm font-black text-slate-900">{rule.impact}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className={`p-2 rounded-xl transition-all ${rule.status === 'active' ? 'text-blue-600 bg-blue-50' : 'text-slate-300 bg-slate-50'}`}>
                        {rule.status === 'active' ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                      </button>
                      <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                        <Settings size={20} />
                      </button>
                      <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                        <MoreVertical size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between pt-6 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase tracking-widest">
                      <AlertTriangle size={14} /> Last Triggered: {rule.lastTriggered}
                    </div>
                  </div>
                  <button className="text-blue-600 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                    View Execution Logs <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusCard({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    indigo: 'bg-indigo-50 text-indigo-600'
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-2xl ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}
