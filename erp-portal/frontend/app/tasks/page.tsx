'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import { CheckSquare, Clock, AlertCircle, Plus, Search, Filter, RefreshCcw } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function TasksPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/tasks/my-tasks');
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (taskId: string, newStatus: string) => {
    try {
      await api.patch(`/tasks/${taskId}/status?status=${newStatus}`);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-10 overflow-y-auto max-h-screen custom-scrollbar">
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckSquare size={14} className="text-blue-500" />
              <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">Agile Workflow Engine v1.0</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Active Tasks</h2>
            <p className="text-slate-500 font-bold mt-1 opacity-80 uppercase text-[10px] tracking-widest">Personal & Collaborative Mission Ledger</p>
          </div>
          <div className="flex gap-3">
             <button onClick={fetchTasks} className="bg-white border-2 border-slate-100 text-slate-700 p-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center gap-2">
              <Plus size={18} /> New Task
            </button>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              placeholder="Filter tasks by title or content..." 
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-slate-500 hover:text-blue-600 transition-colors">
            <Filter size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pending Column */}
          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-[10px] font-black flex items-center gap-2 text-slate-400 uppercase tracking-[0.2em]">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div> Pending
              </h3>
              <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                {filteredTasks.filter(t => t.status === 'pending').length}
              </span>
            </div>
            {filteredTasks.filter(t => t.status === 'pending').map(task => (
              <TaskCard key={task._id} task={task} onUpdate={updateStatus} />
            ))}
          </div>

          {/* In Progress Column */}
          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-[10px] font-black flex items-center gap-2 text-slate-400 uppercase tracking-[0.2em]">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div> Working
              </h3>
              <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                {filteredTasks.filter(t => t.status === 'in_progress').length}
              </span>
            </div>
            {filteredTasks.filter(t => t.status === 'in_progress').map(task => (
              <TaskCard key={task._id} task={task} onUpdate={updateStatus} />
            ))}
          </div>

          {/* Completed Column */}
          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-[10px] font-black flex items-center gap-2 text-slate-400 uppercase tracking-[0.2em]">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Done
              </h3>
              <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                {filteredTasks.filter(t => t.status === 'completed').length}
              </span>
            </div>
            {filteredTasks.filter(t => t.status === 'completed').map(task => (
              <TaskCard key={task._id} task={task} onUpdate={updateStatus} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function TaskCard({ task, onUpdate }: { task: any; onUpdate: (id: string, status: string) => void }) {
  const initials = task.assigned_to_name ? task.assigned_to_name.split(' ').map((n: string) => n[0]).join('') : 'U';

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">{task.title}</h4>
        <AlertCircle size={16} className="text-slate-200" />
      </div>
      <p className="text-xs font-bold text-slate-400 mb-6 line-clamp-2 uppercase tracking-tighter">{task.description}</p>
      
      {task.due_date && (
        <div className="flex items-center gap-2 mb-4 text-[10px] font-black text-slate-400 uppercase">
          <Clock size={12} className="text-blue-500" />
          <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
        </div>
      )}

      <div className="flex justify-between items-center pt-5 border-t border-slate-50">
        <select 
          value={task.status} 
          onChange={(e) => onUpdate(task._id, e.target.value)}
          className="text-[9px] font-black uppercase border-none bg-slate-50 rounded-xl px-4 py-2 text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">Working</option>
          <option value="completed">Done</option>
        </select>
        <div className="flex -space-x-1">
          <div className="w-8 h-8 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center text-[10px] font-black text-blue-600 shadow-sm" title={task.assigned_to_name || 'Assigned'}>
            {initials}
          </div>
        </div>
      </div>
    </div>
  );
}

