'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import { Users, Plus, Mail, Shield, Search, MoreVertical, ExternalLink, Trash2 } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function UsersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [employees, setEmployees] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: 'password123',
    department: 'software',
    role: 'employee'
  });

  useEffect(() => {
    if (!user || (user.role !== 'super_admin' && user.role !== 'dept_admin')) {
      router.push('/dashboard');
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
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users/', formData);
      setSuccess('Employee created successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setShowModal(false);
      fetchEmployees();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create user');
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-slate-200 pb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Employee Directory</h2>
            <p className="text-slate-500 font-bold mt-1 opacity-80 uppercase text-[10px] tracking-widest">Manage your organization's human capital</p>
          </div>
          {success && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-6 py-3 rounded-2xl font-bold animate-in fade-in slide-in-from-top-4">
              {success}
            </div>
          )}
          <div className="flex gap-3">
            <button 
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center gap-2"
            >
              <Plus size={18} /> Add Employee
            </button>
          </div>
        </header>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                placeholder="Search by name, email or department..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium"
              />
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-slate-50 rounded-lg text-xs font-black text-slate-500 uppercase tracking-widest">Active</button>
              <button className="px-4 py-2 text-xs font-black text-slate-300 uppercase tracking-widest hover:text-slate-500 transition-colors">On Leave</button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Department</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Role</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Performance</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                          {emp.full_name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{emp.full_name}</p>
                          <p className="text-xs text-slate-400 font-bold">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-slate-600 uppercase tracking-tighter">{emp.department}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Shield size={14} className={emp.role === 'super_admin' ? 'text-purple-500' : 'text-blue-500'} />
                        <span className="text-xs font-bold text-slate-500 capitalize">{emp.role.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full w-4/5"></div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><ExternalLink size={18} /></button>
                        <button className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="text-3xl font-black mb-8 text-slate-900 tracking-tight">New Employee</h3>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
                <input 
                  placeholder="e.g. John Doe" 
                  className="w-full border-none p-4 rounded-2xl bg-slate-50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-slate-900" 
                  value={formData.full_name}
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
                <input 
                  placeholder="john@company.com" 
                  type="email"
                  className="w-full border-none p-4 rounded-2xl bg-slate-50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-slate-900" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Department</label>
                  <select 
                    className="w-full border-none p-4 rounded-2xl bg-slate-50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-slate-900 cursor-pointer"
                    value={formData.department}
                    onChange={e => setFormData({...formData, department: e.target.value})}
                  >
                    <option value="accountant">Accountant</option>
                    <option value="hr">HR</option>
                    <option value="software">Software</option>
                    <option value="sales">Sales</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Role</label>
                  <select 
                    className="w-full border-none p-4 rounded-2xl bg-slate-50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-slate-900 cursor-pointer"
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="employee">Employee</option>
                    <option value="dept_admin">Dept Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 mt-10">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
