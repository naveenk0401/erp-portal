'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import { IndianRupee, Plus, Calendar, User, Download, Search, CheckCircle2, TrendingUp } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function SalariesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [salaries, setSalaries] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    user_id: '',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    bonus: '0',
    deductions: '0'
  });

  useEffect(() => {
    if (!user || (user.role !== 'super_admin' && user.department !== 'accountant')) {
      router.push('/dashboard');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [salRes, empRes] = await Promise.all([
        api.get('/salaries/all'),
        api.get('/users/')
      ]);
      setSalaries(salRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      setSalaries([
        { id: '1', user: { full_name: 'John Doe', department: 'software' }, amount: 75000, month: 12, year: 2023, bonus: 5000, deductions: 2000 },
        { id: '2', user: { full_name: 'Jane Smith', department: 'hr' }, amount: 65000, month: 12, year: 2023, bonus: 2000, deductions: 1500 },
      ]);
      setEmployees([
        { id: '1', full_name: 'John Doe', department: 'software' },
        { id: '2', full_name: 'Jane Smith', department: 'hr' },
        { id: '3', full_name: 'Mike Ross', department: 'accountant' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/salaries/?user_id=${formData.user_id}&amount=${formData.amount}&month=${formData.month}&year=${formData.year}&bonus=${formData.bonus}&deductions=${formData.deductions}`);
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to process salary');
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-slate-200 pb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Payroll Management</h2>
            <p className="text-slate-500 font-bold mt-1 opacity-80 uppercase text-[10px] tracking-widest">Financial distribution and salary records</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center gap-2"
            >
              <Plus size={18} /> Process Payout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <StatCard title="Total Payout" value={`₹${salaries.reduce((acc, curr) => acc + curr.amount + (curr.bonus || 0) - (curr.deductions || 0), 0).toLocaleString()}`} color="slate" />
          <StatCard title="Total Bonus" value={`₹${salaries.reduce((acc, curr) => acc + (curr.bonus || 0), 0).toLocaleString()}`} color="green" />
          <StatCard title="Deductions" value={`₹${salaries.reduce((acc, curr) => acc + (curr.deductions || 0), 0).toLocaleString()}`} color="rose" />
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="font-black text-slate-900 tracking-tight text-lg">Recent Ledger</h3>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input placeholder="Search transactions..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Beneficiary</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Period</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Base Salary</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Adjustments</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Net Total</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {salaries.map((sal) => (
                  <tr key={sal.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-lg group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                          {sal.user?.full_name?.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 tracking-tight">{sal.user?.full_name}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{sal.user?.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-600">
                      {new Date(sal.year, sal.month - 1).toLocaleString('default', { month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-6 text-sm font-black text-slate-900">
                      ₹{sal.amount.toLocaleString()}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-green-600 font-black text-[10px]">+{sal.bonus?.toLocaleString()}</span>
                        <span className="text-rose-500 font-black text-[10px]">-{sal.deductions?.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-base font-black text-blue-600">
                      ₹{(sal.amount + (sal.bonus || 0) - (sal.deductions || 0)).toLocaleString()}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Disbursed</span>
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
            <h3 className="text-3xl font-black mb-8 text-slate-900 tracking-tight">Process Salary</h3>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Target Employee</label>
                <select 
                  className="w-full border-none p-4 rounded-2xl bg-slate-50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-slate-900 cursor-pointer"
                  value={formData.user_id}
                  onChange={e => setFormData({...formData, user_id: e.target.value})}
                  required
                >
                  <option value="">Select Employee...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.department})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Month</label>
                  <select 
                    className="w-full border-none p-4 rounded-2xl bg-slate-50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-slate-900 cursor-pointer"
                    value={formData.month}
                    onChange={e => setFormData({...formData, month: parseInt(e.target.value)})}
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Year</label>
                  <input 
                    type="number"
                    className="w-full border-none p-4 rounded-2xl bg-slate-50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-slate-900"
                    value={formData.year}
                    onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Base Amount (₹)</label>
                <input 
                  type="number"
                  placeholder="0.00" 
                  className="w-full border-none p-4 rounded-2xl bg-slate-50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-black text-slate-900 text-lg" 
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-green-600 uppercase tracking-widest mb-2 px-1">Bonus</label>
                  <input 
                    type="number"
                    className="w-full border-none p-4 rounded-2xl bg-slate-50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-green-600"
                    value={formData.bonus}
                    onChange={e => setFormData({...formData, bonus: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2 px-1">Deduction</label>
                  <input 
                    type="number"
                    className="w-full border-none p-4 rounded-2xl bg-slate-50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-rose-500"
                    value={formData.deductions}
                    onChange={e => setFormData({...formData, deductions: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-10">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95">Disburse</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: string; color: string }) {
  const colorMap: any = {
    slate: 'bg-white text-slate-900 border-slate-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100'
  };

  return (
    <div className={`${colorMap[color]} p-8 rounded-[2rem] shadow-sm border flex flex-col hover:shadow-xl transition-all duration-300 group`}>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-60 group-hover:opacity-100 transition-opacity">{title}</p>
      <p className="text-3xl font-black tracking-tighter">{value}</p>
    </div>
  );
}
