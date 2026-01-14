'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import { Calendar, Clock, Search, Filter, ChevronRight, UserCheck, UserX, History, Briefcase } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function AttendancePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [myAttendance, setMyAttendance] = useState<any[]>([]);
  const [allAttendance, setAllAttendance] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'personal' | 'admin'>('personal');
  
  // Admin Filters
  const [deptFilter, setDeptFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmpHistory, setSelectedEmpHistory] = useState<any>(null);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    fetchMyAttendance();
    if (user.role === 'super_admin' || user.role === 'dept_admin') {
      fetchAllData();
      if (user.role === 'super_admin') setView('admin');
    }
  }, [user]);

  const fetchMyAttendance = async () => {
    try {
      const { data } = await api.get('/attendance/my-attendance');
      setMyAttendance(data);
    } catch (err) {
      setMyAttendance([]);
    }
  };

  const fetchAllData = async () => {
    try {
      const [attRes, empRes] = await Promise.all([
        api.get('/attendance/all'),
        api.get('/users/')
      ]);
      setAllAttendance(attRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    }
  };

  const handleAction = async (action: 'check-in' | 'check-out') => {
    setLoading(true);
    try {
      await api.post(`/attendance/${action}`);
      fetchMyAttendance();
      if (user?.role === 'super_admin') fetchAllData();
    } catch (err: any) {
      alert(err.response?.data?.detail || `${action} failed`);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAction = async (empId: string, action: 'check-in' | 'check-out') => {
    try {
      await api.post(`/attendance/admin-action?user_id=${empId}&action=${action}`);
      fetchAllData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Admin action failed');
    }
  };

  if (!user) return null;

  const today = new Date().toDateString();
  const isTodayCheckedIn = myAttendance.some(a => new Date(a.check_in).toDateString() === today);
  const isTodayCheckedOut = myAttendance.some(a => new Date(a.check_in).toDateString() === today && a.check_out);

  const departments = Array.from(new Set(employees.map(e => e.department)));
  
  const filteredEmployees = employees.filter(emp => {
    const matchesDept = deptFilter === 'all' || emp.department === deptFilter;
    const matchesSearch = emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.id.includes(searchQuery) || 
                          emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-200 pb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Attendance</h2>
            <p className="text-slate-500 font-bold mt-1 opacity-80 uppercase text-[10px] tracking-widest">
              {view === 'admin' ? 'Organization-wide Tracking' : 'Personal Presence Records'}
            </p>
          </div>
          
          {(user.role === 'super_admin' || user.role === 'dept_admin') && (
            <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 flex">
              <button 
                onClick={() => setView('personal')}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'personal' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}
              >
                My Logs
              </button>
              <button 
                onClick={() => setView('admin')}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'admin' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Team View
              </button>
            </div>
          )}
        </header>

        {view === 'personal' ? (
          <div className="max-w-5xl mx-auto space-y-10">
            {/* Personal Check-in Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <div className={`p-6 rounded-3xl mb-6 ${isTodayCheckedIn ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                  <Clock size={48} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black mb-8 text-slate-900 tracking-tight">Daily Clock</h3>
                <div className="flex flex-col gap-4 w-full">
                  <button 
                    onClick={() => handleAction('check-in')}
                    disabled={loading || isTodayCheckedIn}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all disabled:opacity-50 active:scale-95"
                  >
                    {isTodayCheckedIn ? 'Logged In' : 'Check In'}
                  </button>
                  <button 
                    onClick={() => handleAction('check-out')}
                    disabled={loading || !isTodayCheckedIn || isTodayCheckedOut}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all disabled:opacity-50 active:scale-95"
                  >
                    {isTodayCheckedOut ? 'Logged Out' : 'Check Out'}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-slate-900">
                  <Calendar size={24} className="text-blue-600" /> Stats Overview
                </h3>
                <div className="grid grid-cols-3 gap-6">
                  <StatItem label="Days" value="22" color="slate" />
                  <StatItem label="Present" value={myAttendance.length.toString()} color="green" />
                  <StatItem label="On-Time" value="98%" color="blue" />
                </div>
                <div className="mt-10 p-6 bg-blue-50 rounded-3xl border border-blue-100/50 flex items-center justify-between">
                  <div>
                    <p className="font-black text-blue-900 text-sm uppercase tracking-widest">Next Shift</p>
                    <p className="text-xs font-bold text-blue-600/80">Monday, 09:00 AM</p>
                  </div>
                  <ChevronRight size={24} className="text-blue-300" />
                </div>
              </div>
            </div>

            {/* Personal History Table */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50">
                <h3 className="text-xl font-black text-slate-900">Personal Log History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Check In</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Check Out</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {myAttendance.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6 font-bold text-slate-900">{new Date(item.check_in).toLocaleDateString()}</td>
                        <td className="px-8 py-6 text-sm font-bold text-slate-600">{new Date(item.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="px-8 py-6 text-sm font-bold text-slate-600">{item.check_out ? new Date(item.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}</td>
                        <td className="px-8 py-6">
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">Present</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Admin Management View */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-10">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    placeholder="Search ID, Name or Email..." 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                  <button 
                    onClick={() => setDeptFilter('all')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${deptFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
                  >
                    All Depts
                  </button>
                  {departments.map(dept => (
                    <button 
                      key={dept}
                      onClick={() => setDeptFilter(dept)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${deptFilter === dept ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee ID</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Full Name</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Department</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status Today</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredEmployees.map((emp) => {
                      const todayLog = allAttendance.find(a => a.user.id === emp.id && new Date(a.check_in).toDateString() === today);
                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/50 transition-all group">
                          <td className="px-8 py-6">
                            <span className="text-xs font-black text-slate-400 font-mono tracking-tighter">#{emp.id.slice(-6).toUpperCase()}</span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-black text-sm">
                                {emp.full_name[0]}
                              </div>
                              <span className="font-bold text-slate-900">{emp.full_name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{emp.department}</span>
                          </td>
                          <td className="px-8 py-6">
                            {todayLog ? (
                              <div className="flex items-center gap-3">
                                <span className={`w-2 h-2 rounded-full ${todayLog.check_out ? 'bg-slate-300' : 'bg-green-500 animate-pulse'}`}></span>
                                <div>
                                  <p className="text-xs font-black text-slate-900">{todayLog.check_out ? 'Completed' : 'Checked In'}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(todayLog.check_in).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 opacity-30">
                                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                <span className="text-xs font-black text-slate-900">Absent</span>
                              </div>
                            )}
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              {user.role === 'super_admin' && (
                                <>
                                  <button 
                                    onClick={() => handleAdminAction(emp.id, 'check-in')}
                                    disabled={!!todayLog}
                                    title="Force Check-In"
                                    className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-20"
                                  >
                                    <UserCheck size={18} />
                                  </button>
                                  <button 
                                    onClick={() => handleAdminAction(emp.id, 'check-out')}
                                    disabled={!todayLog || !!todayLog.check_out}
                                    title="Force Check-Out"
                                    className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all disabled:opacity-20"
                                  >
                                    <UserX size={18} />
                                  </button>
                                </>
                              )}
                              <button 
                                onClick={() => setSelectedEmpHistory(emp)}
                                className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all"
                              >
                                <History size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* History Modal */}
        {selectedEmpHistory && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Attendance History</h3>
                  <p className="text-blue-600 font-black text-[10px] uppercase tracking-widest mt-1">{selectedEmpHistory.full_name} — ID: #{selectedEmpHistory.id.slice(-6).toUpperCase()}</p>
                </div>
                <button onClick={() => setSelectedEmpHistory(null)} className="p-2 bg-slate-50 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all text-slate-400">
                  <UserX size={20} />
                </button>
              </div>
              
              <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                <div className="space-y-4">
                  {allAttendance
                    .filter(a => a.user.id === selectedEmpHistory.id)
                    .sort((a, b) => new Date(b.check_in).getTime() - new Date(a.check_in).getTime())
                    .map((log, i) => (
                      <div key={i} className="bg-slate-50 p-6 rounded-2xl flex justify-between items-center border border-slate-100">
                        <div>
                          <p className="font-black text-slate-900">{new Date(log.check_in).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          <div className="flex gap-4 mt-1">
                            <p className="text-xs font-bold text-slate-400"><span className="text-green-600">IN:</span> {new Date(log.check_in).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</p>
                            <p className="text-xs font-bold text-slate-400"><span className="text-rose-500">OUT:</span> {log.check_out ? new Date(log.check_out).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : 'Active'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-lg">9.0 hrs</p>
                        </div>
                      </div>
                    ))}
                  {allAttendance.filter(a => a.user.id === selectedEmpHistory.id).length === 0 && (
                    <div className="py-20 text-center space-y-4 opacity-30">
                      <History size={48} className="mx-auto" />
                      <p className="font-black uppercase text-xs tracking-widest">No history found for this employee</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: any = {
    slate: 'text-slate-900',
    green: 'text-green-600',
    blue: 'text-blue-600'
  };
  return (
    <div className="text-center">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-black ${colors[color]}`}>{value}</p>
    </div>
  );
}
