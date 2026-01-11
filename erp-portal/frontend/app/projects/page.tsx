'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  Layers, 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  ShieldCheck,
  RefreshCcw,
  BarChart,
  GanttChart,
  MoreVertical,
  Activity
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function ProjectsPage() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/operations/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'on_hold': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 md:p-10 overflow-y-auto max-h-screen custom-scrollbar">
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity size={14} className="text-blue-500" />
              <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">Project Lifecycle & Resource Planning</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Project Portfolio</h2>
            <p className="text-slate-500 font-bold mt-1 opacity-80 uppercase text-[10px] tracking-widest">Enterprise Strategic Initiatives Ledger</p>
          </div>
          <div className="flex gap-3">
             <button onClick={fetchProjects} className="bg-white border-2 border-slate-100 text-slate-700 p-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
              <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-xs hover:bg-slate-800 shadow-xl transition-all flex items-center gap-2">
              <Plus size={16} /> Create Project
            </button>
          </div>
        </header>

        {/* 1. Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <StatCard title="Active Projects" value={projects.filter(p => p.status === 'active').length.toString()} icon={<GanttChart size={20} />} color="blue" />
          <StatCard title="Completed" value={projects.filter(p => p.status === 'completed').length.toString()} icon={<CheckCircle2 size={20} />} color="emerald" />
          <StatCard title="Team Velocity" value="84%" icon={<Activity size={20} />} color="purple" />
          <StatCard title="Resources" value="122" icon={<Users size={20} />} color="amber" />
        </div>

        {/* 2. Filters & Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              placeholder="Filter projects by title..." 
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-slate-500 hover:text-blue-600 transition-colors">
            <Filter size={20} />
          </button>
        </div>

        {/* 3. Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
             Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 animate-pulse h-64" />
             ))
          ) : (
            <>
              {filteredProjects.length === 0 && (
                <div className="col-span-full py-20 text-center opacity-30 italic font-bold text-slate-400">
                  No active projects found tailored to your role.
                </div>
              )}
              {filteredProjects.map((project) => (
                <div key={project.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300 flex flex-col group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Layers size={24} />
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${getStatusColor(project.status)}`}>
                        {project.status}
                    </span>
                  </div>
                  
                  <div className="flex-1 mb-8">
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-2">{project.name}</h3>
                    <p className="text-xs font-bold text-slate-400 line-clamp-2 leading-relaxed uppercase tracking-tighter">
                        {project.description || 'Enterprise grade initiative focusing on operational excellence and system performance.'}
                    </p>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-50">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-slate-500">
                            <Calendar size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No Deadline'}</span>
                        </div>
                        <div className="flex -space-x-2">
                            {Array(3).fill(0).map((_, i) => (
                                <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-400">U{i}</div>
                            ))}
                        </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full w-[65%]" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100'
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
      <div className={`p-4 rounded-2xl ${colors[color]} border`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
        <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
      </div>
    </div>
  );
}
