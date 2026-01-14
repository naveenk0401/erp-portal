'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import { Briefcase, Users, ChevronRight, Search, Building2, Layers, TrendingUp } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function DepartmentsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchEmployees();
  }, [user]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users/');
      setEmployees(data);
    } catch (err) {
      setEmployees([
        { id: '1', full_name: 'John Doe', email: 'john@erp.com', department: 'software', role: 'employee' },
        { id: '2', full_name: 'Jane Smith', email: 'jane@erp.com', department: 'hr', role: 'dept_admin' },
        { id: '3', full_name: 'Mike Ross', email: 'mike@erp.com', department: 'accountant', role: 'employee' },
        { id: '4', full_name: 'Harvey Specter', email: 'harvey@erp.com', department: 'software', role: 'dept_admin' },
        { id: '5', full_name: 'Donna Paulsen', email: 'donna@erp.com', department: 'hr', role: 'employee' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const departments = Array.from(new Set(employees.map(emp => emp.department)));
  const filteredEmployees = selectedDept 
    ? employees.filter(emp => emp.department === selectedDept)
    : employees;

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        <header className="mb-10 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Organization Structure</h2>
          <p className="text-slate-500 font-bold mt-1 opacity-80 uppercase text-[10px] tracking-widest">Departmental hierarchy and team composition</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Dept Sidebar */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Departments</h3>
            <button 
              onClick={() => setSelectedDept(null)}
              className={`w-full text-left px-6 py-4 rounded-2xl font-black transition-all flex items-center justify-between text-sm ${!selectedDept ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
            >
              All Teams <Layers size={18} />
            </button>
            {departments.map(dept => (
              <button 
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`w-full text-left px-6 py-4 rounded-2xl font-black transition-all flex items-center justify-between text-sm capitalize ${selectedDept === dept ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
              >
                {dept} <ChevronRight size={18} />
              </button>
            ))}
            
            <div className="mt-10 p-6 bg-slate-900 rounded-[2rem] text-white overflow-hidden relative group">
              <TrendingUp className="absolute bottom-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500" size={100} />
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Efficiency</p>
              <p className="text-2xl font-black tracking-tight">+14%</p>
              <p className="text-xs font-bold text-slate-400 mt-1">Growth this quarter</p>
            </div>
          </div>

          {/* Employee List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h3 className="font-black text-slate-900 capitalize flex items-center gap-3 tracking-tight">
                  {selectedDept ? `${selectedDept} Department` : 'Global Workforce'} 
                  <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-md font-black">{filteredEmployees.length}</span>
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input placeholder="Filter team..." className="pl-9 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
                </div>
              </div>
              <div className="divide-y divide-slate-50">
                {filteredEmployees.map(emp => (
                  <div key={emp.id} className="p-8 hover:bg-slate-50/50 transition-colors flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 font-black text-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        {emp.full_name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 tracking-tight text-lg">{emp.full_name}</p>
                        <p className="text-sm text-slate-400 font-bold">{emp.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden md:block text-right mr-4">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Role</p>
                        <p className="text-xs font-bold text-slate-600 capitalize">{emp.role.replace('_', ' ')}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

