'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import { 
  PlaneTakeoff, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MoreVertical,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import api from '@/lib/api';

export default function LeaveManagementPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hr-core/leaves');
      setLeaveRequests(response.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (leaveId: string, status: 'approved' | 'rejected') => {
    try {
      // Find the approval request for this leave
      const approvalsRes = await api.get('/approvals');
      const approval = approvalsRes.data.find((a: any) => a.resource_id === leaveId);
      
      if (approval) {
        await api.patch(`/approvals/${approval.id}`, { status });
        fetchLeaves();
      } else {
        alert('Approval record not found');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const filteredRequests = leaveRequests.filter(req => {
    const matchesTab = activeTab === 'all' || req.status === activeTab;
    const matchesSearch = (req.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (req.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter(r => r.status === 'pending').length,
    approved: leaveRequests.filter(r => r.status === 'approved').length,
    rejected: leaveRequests.filter(r => r.status === 'rejected').length
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 md:p-10 overflow-y-auto max-h-screen custom-scrollbar">
        <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <PlaneTakeoff className="text-blue-600" size={32} /> Leave Management
            </h2>
            <p className="text-slate-500 mt-1 font-bold text-sm opacity-70">
              Review, approve, and track employee time-off requests.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border-2 border-slate-100 text-slate-700 px-5 py-2.5 rounded-xl font-black text-xs hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
              <Download size={16} /> Export
            </button>
            <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
              Apply Leave
            </button>
          </div>
        </header>

        {/* Leave Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <LeaveStatCard title="Total Requests" value={stats.total.toString()} icon={<CalendarIcon size={20} />} color="blue" />
          <LeaveStatCard title="Pending" value={stats.pending.toString()} icon={<Clock size={20} />} color="amber" />
          <LeaveStatCard title="Approved" value={stats.approved.toString()} icon={<CheckCircle2 size={20} />} color="emerald" />
          <LeaveStatCard title="Rejected" value={stats.rejected.toString()} icon={<XCircle size={20} />} color="rose" />
        </div>

        {/* Filters & Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl w-fit">
              <TabButton active={activeTab === 'pending'} onClick={() => setActiveTab('pending')} label="Pending" />
              <TabButton active={activeTab === 'approved'} onClick={() => setActiveTab('approved')} label="Approved" />
              <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')} label="All History" />
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search employee or ID..." 
                  className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 w-full lg:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button onClick={() => fetchLeaves()} className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
                <Filter size={18} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Synchronizing leave ledger...</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Employee</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Leave Type</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Days</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                         <div className="opacity-20 flex flex-col items-center">
                            <PlaneTakeoff size={48} className="mb-2" />
                            <p className="font-black uppercase text-xs tracking-[0.2em]">No leave records found</p>
                         </div>
                      </td>
                    </tr>
                  )}
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-500 text-xs">
                            {(req.user_name || 'E').split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{req.user_name || 'Unknown'}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{req.id.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">{req.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-700">{new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-slate-900">{req.days} Days</p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {req.status === 'pending' && user?.role === 'hr' && (
                            <>
                              <button 
                                onClick={() => handleStatusUpdate(req.id, 'approved')}
                                className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors" title="Approve"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(req.id, 'rejected')}
                                className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors" title="Reject"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="p-6 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Showing {filteredRequests.length} requests</p>
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50"><ChevronLeft size={20} /></button>
              <button className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs">1</button>
              <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><ChevronRight size={20} /></button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function LeaveStatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600'
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-2xl ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
        active ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending: 'bg-amber-50 text-amber-600 border-amber-100',
    approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rejected: 'bg-rose-50 text-rose-600 border-rose-100'
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${styles[status]}`}>
      {status}
    </span>
  );
}
