'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  GanttChart, 
  Target, 
  TrendingUp, 
  AlertCircle, 
  ChevronRight, 
  Plus, 
  Search,
  Users,
  Building2,
  ArrowUpRight
} from 'lucide-react';
import api from '@/lib/api';

export default function OKRPage() {
  const [loading, setLoading] = useState(true);
  const [okrs, setOkrs] = useState<any[]>([]);
  const [level, setLevel] = useState('company');
  const [selectedOkr, setSelectedOkr] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_value: 100,
    unit: '%',
    level: 'company',
    department: '',
    deadline: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]
  });

  const fetchOKRs = async () => {
    try {
      setLoading(true);
      const response: any = await api.get(`/strategy/okrs?level=${level}`);
      setOkrs(response.data);
    } catch (error) {
      console.error('Error fetching OKRs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOKRs();
  }, [level]);

  const handleCreateOKR = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);
      const payload = {
        ...formData,
        key_results: [
          { text: 'Define first key result', progress: 0 }
        ]
      };
      await api.post('/strategy/okrs', payload);
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        target_value: 100,
        unit: '%',
        level: 'company',
        department: '',
        deadline: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]
      });
      await fetchOKRs();
    } catch (error) {
      console.error('Error creating OKR:', error);
      alert('Failed to create objective');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdateKR = async (okrId: string, krIndex: number, currentProgress: number) => {
    const newProgress = prompt('Enter new progress percentage (0-100):', currentProgress.toString());
    if (newProgress === null) return;
    
    const val = parseFloat(newProgress);
    if (isNaN(val) || val < 0 || val > 100) {
      alert('Please enter a valid percentage between 0 and 100');
      return;
    }

    try {
      setUpdateLoading(true);
      await api.patch(`/strategy/okrs/${okrId}/key-results/${krIndex}?progress=${val}`);
      await fetchOKRs(); // Refresh data
      // Update selectedOkr if it's the one we're viewing
      if (selectedOkr && selectedOkr.id === okrId) {
        const updatedOkr = okrs.find(o => o.id === okrId);
        if (updatedOkr) {
          // Note: fetchOKRs updates the list, we might need to wait for it or use the response
          const updatedList: any = await api.get(`/strategy/okrs?level=${level}`);
          const newSelected = updatedList.data.find((o: any) => o.id === okrId);
          setSelectedOkr(newSelected);
        }
      }
    } catch (error) {
      console.error('Error updating Key Result:', error);
      alert('Failed to update progress');
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row relative">
      <Sidebar />
      <main className="flex-1 p-4 md:p-10 overflow-y-auto max-h-screen custom-scrollbar">
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Target className="text-blue-600" size={32} /> OKRs & Strategy
            </h2>
            <p className="text-slate-500 mt-1 font-bold text-sm opacity-70">
              Company-wide objectives, key results, and department alignment.
            </p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 flex items-center gap-2"
          >
            <Plus size={18} /> New Objective
          </button>
        </header>

        {/* Level Filters */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => setLevel('company')}
            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
              level === 'company' 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'bg-white border border-slate-100 text-slate-400 hover:text-slate-900 shadow-sm'
            }`}
          >
            <Building2 size={16} /> Company
          </button>
          <button 
            onClick={() => setLevel('department')}
            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
              level === 'department' 
                ? 'bg-[#10b981] text-white shadow-lg' 
                : 'bg-white border border-slate-100 text-slate-400 hover:text-slate-900 shadow-sm'
            }`}
          >
            <Users size={16} /> Department
          </button>
        </div>

        {loading ? (
          <div className="space-y-8 animate-pulse">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-[2.5rem] border border-slate-100 h-64" />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {okrs.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                <Target size={48} className="text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-black text-slate-400">No OKRs Found</h3>
                <p className="text-slate-300 font-bold">Start by creating your first strategic objective.</p>
              </div>
            )}
            {okrs.map((okr) => (
              <div key={okr.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group">
                <div className="p-8 md:p-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          okr.status === 'on_track' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          okr.status === 'at_risk' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                          {okr.status.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {okr.level === 'department' ? `${okr.department?.toUpperCase()} DEPT` : okr.owner_name || 'Organization'}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{okr.title}</h3>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                         <p className="text-4xl font-black text-slate-900 tracking-tighter">{okr.current_value}%</p>
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Total Progress</p>
                      </div>
                      <button 
                        onClick={() => setSelectedOkr(okr)}
                        className="p-4 bg-slate-50 text-slate-300 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm active:scale-90"
                      >
                         <ChevronRight size={24} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden mb-12">
                     <div 
                      className={`h-full rounded-full transition-all duration-1000 ${okr.status === 'on_track' ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]'}`} 
                      style={{ width: `${okr.current_value}%` }}
                     ></div>
                  </div>

                  {/* Key Results Sub-Section */}
                  {okr.key_results?.length > 0 && (
                    <div className="space-y-6">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50 pb-4">Key Results Breakdown</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {okr.key_results.map((kr: any, idx: number) => (
                            <div key={idx} className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100/50">
                               <div className="flex justify-between items-start mb-4">
                                  <p className="text-sm font-bold text-slate-700 leading-snug max-w-[200px]">{kr.text}</p>
                                  <span className="text-sm font-black text-slate-900">{kr.progress}%</span>
                               </div>
                               <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${kr.progress}%` }}></div>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}
                </div>

                {/* Action Footer */}
                <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <TrendingUp size={14} className="text-emerald-500" /> Real-time strategic updates
                   </div>
                   <button 
                    onClick={() => setSelectedOkr(okr)}
                    className="text-blue-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform"
                   >
                      Strategic Alignment <ArrowUpRight size={14} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Details Modal */}
        {selectedOkr && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
              {/* Sidebar Info */}
              <div className="w-full md:w-[35%] bg-slate-900 p-10 text-white flex flex-col justify-between">
                <div>
                  <div className="bg-blue-600/20 text-blue-400 w-fit px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-500/30">
                    {selectedOkr.level === 'company' ? 'Strategic Goal' : 'Dept Initiative'}
                  </div>
                  <h3 className="text-3xl font-black leading-tight mb-4 tracking-tight">{selectedOkr.title}</h3>
                  <p className="text-slate-400 font-medium text-sm leading-relaxed mb-8">{selectedOkr.description}</p>
                  
                  <div className="space-y-6 mb-10">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-800 rounded-2xl">
                        <Users size={18} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Owner</p>
                        <p className="text-sm font-bold text-slate-200">{selectedOkr.owner_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-800 rounded-2xl">
                        <AlertCircle size={18} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Deadline</p>
                        <p className="text-sm font-bold text-slate-200">
                          {selectedOkr.deadline ? new Date(selectedOkr.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'No set deadline'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedOkr(null)}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs uppercase tracking-widest rounded-2xl transition-all"
                >
                  Close View
                </button>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-10 overflow-y-auto bg-[#fafbfc]">
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Current Achievement</h4>
                    <p className="text-5xl font-black text-slate-900 tracking-tighter">{selectedOkr.current_value}%</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border mb-2 ${
                      selectedOkr.status === 'on_track' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      selectedOkr.status === 'at_risk' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      {selectedOkr.status.replace('_', ' ')}
                    </span>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target: {selectedOkr.target_value}{selectedOkr.unit}</p>
                  </div>
                </div>

                {/* Progress Visual */}
                <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden mb-12 shadow-inner">
                   <div 
                    className={`h-full rounded-full transition-all duration-1000 ${selectedOkr.status === 'on_track' ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]'}`} 
                    style={{ width: `${selectedOkr.current_value}%` }}
                   ></div>
                </div>

                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 border-b border-slate-200 pb-4">Alignment Breakdown</h5>
                
                <div className="space-y-4">
                  {selectedOkr.key_results?.map((kr: any, idx: number) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group/kr">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-sm font-black text-slate-800">{kr.text}</p>
                        <button 
                          disabled={updateLoading}
                          onClick={() => handleUpdateKR(selectedOkr.id, idx, kr.progress)}
                          className="bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white p-2 rounded-xl transition-all shadow-sm group-hover/kr:scale-105"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full transition-all duration-700" 
                            style={{ width: `${kr.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-black text-slate-900 w-10 text-right">{kr.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 p-6 bg-blue-50 rounded-[2rem] border border-blue-100/50 flex items-start gap-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm">
                    <TrendingUp size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-blue-900 mb-1">Strategic Impact</h5>
                    <p className="text-xs font-medium text-blue-700/70 leading-relaxed">
                      This objective is directly aligned with the {selectedOkr.level} focus for Q1. Key results are verified through active system metrics.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Create Objective Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-900/60 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Create Objective</h3>
                  <button onClick={() => setShowCreateModal(false)} className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all">
                    <Plus size={24} className="rotate-45" />
                  </button>
                </div>

                <form onSubmit={handleCreateOKR} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Objective Title</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Master Global Infrastructure"
                      className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-900"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Description</label>
                    <textarea 
                      placeholder="What is the strategic impact of this goal?"
                      className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-900 min-h-[100px]"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Strategy Level</label>
                      <select 
                        className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-900"
                        value={formData.level}
                        onChange={e => setFormData({...formData, level: e.target.value})}
                      >
                        <option value="company">Company Wide</option>
                        <option value="department">Department Specific</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Target Value</label>
                      <input 
                        required
                        type="number" 
                        className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-900"
                        value={formData.target_value}
                        onChange={e => setFormData({...formData, target_value: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Deadline</label>
                      <input 
                        required
                        type="date" 
                        className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-900"
                        value={formData.deadline}
                        onChange={e => setFormData({...formData, deadline: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Unit</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. %, leads, days"
                        className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-900"
                        value={formData.unit}
                        onChange={e => setFormData({...formData, unit: e.target.value})}
                      />
                    </div>
                  </div>

                  <button 
                    disabled={updateLoading}
                    type="submit"
                    className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 mt-4"
                  >
                    {updateLoading ? 'Launching Strategy...' : 'Launch Objective'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
