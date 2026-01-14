'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  Star, 
  Search, 
  Filter, 
  Plus, 
  TrendingUp, 
  Award, 
  Calendar, 
  MessageSquare, 
  ShieldCheck,
  RefreshCcw,
  Target,
  ChevronRight,
  UserCheck,
  Zap,
  History
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function PerformancePage() {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/strategy/reviews');
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((acc, rev) => acc + (rev.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 md:p-10 overflow-y-auto max-h-screen custom-scrollbar">
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-blue-500" />
              <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">Meritocracy & Performance Index v2.1</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Performance & Appraisal</h2>
            <p className="text-slate-500 font-bold mt-1 opacity-80 uppercase text-[10px] tracking-widest">Employee Growth & Achievement Ledger</p>
          </div>
          <div className="flex gap-3">
             <button onClick={fetchReviews} className="bg-white border-2 border-slate-100 text-slate-700 p-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-xs hover:bg-slate-800 shadow-xl transition-all flex items-center gap-2">
              <Plus size={16} /> Request Feedback
            </button>
          </div>
        </header>

        {/* 1. Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-10 items-center">
            <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-50 border-t-blue-500 animate-[spin_3s_linear_infinite]" />
                    <span className="text-4xl font-black text-slate-900">{calculateAverageRating()}</span>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Current Merit Score</p>
            </div>
            <div className="flex-1 space-y-6 w-full">
                <div className="flex justify-between items-end">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Achievement Metrics</h3>
                    <TrendingUp size={18} className="text-emerald-500" />
                </div>
                <div className="space-y-4">
                    <MetricBar label="Consistency" value={88} color="blue" />
                    <MetricBar label="Communication" value={74} color="purple" />
                    <MetricBar label="Technical Skill" value={92} color="emerald" />
                </div>
            </div>
          </div>
          <div className="bg-blue-600 p-10 rounded-[2.5rem] text-white flex flex-col justify-between shadow-xl shadow-blue-100">
            <div>
              <Award size={32} className="mb-4 text-blue-200" />
              <h3 className="text-xl font-black mb-2">Next Milestone</h3>
              <p className="text-xs font-bold text-blue-100 uppercase tracking-tight leading-relaxed">
                  Maintain a 4.5+ rating for 2 more months to unlock Senior Tier benefits.
              </p>
            </div>
            <div className="mt-8 pt-8 border-t border-blue-500/50">
                <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Progress to Promotion</p>
                <div className="mt-2 w-full h-1.5 bg-blue-700/50 rounded-full overflow-hidden">
                    <div className="bg-white h-full w-[70%]" />
                </div>
            </div>
          </div>
        </div>

        {/* 2. Review History */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 text-slate-400 rounded-xl">
                    <History size={18} />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Review Cycle History</h3>
            </div>
            <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All Records</button>
          </div>

          <div className="divide-y divide-slate-50">
            {loading ? (
              <div className="p-20 text-center">
                <div className="animate-spin text-blue-500 mb-4 flex justify-center"><RefreshCcw size={32} /></div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Accessing Record Vault...</p>
              </div>
            ) : (
              <>
                {reviews.length === 0 && (
                  <div className="p-20 text-center opacity-30 italic font-bold text-slate-400">
                    No performance records found in the current ledger.
                  </div>
                )}
                {reviews.map((review) => (
                  <div key={review.id} className="p-8 hover:bg-slate-50/50 transition-colors group flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="flex gap-6 items-center flex-1">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <UserCheck size={24} />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900 leading-tight mb-1">{review.cycle || 'Annual Review 2025'}</h4>
                        <div className="flex items-center gap-2">
                           <Calendar size={12} className="text-slate-400" />
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Concluded: {new Date(review.review_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 w-full md:w-auto">
                        <p className="text-xs font-bold text-slate-500 italic uppercase leading-relaxed line-clamp-2">
                            "{review.comments || 'Outstanding contribution to the core infrastructure and system stability.'}"
                        </p>
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex items-center gap-1">
                           {[1, 2, 3, 4, 5].map(star => (
                               <Star 
                                 key={star} 
                                 size={14} 
                                 className={`${star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-100'}`} 
                               />
                           ))}
                        </div>
                        <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function MetricBar({ label, value, color }: { label: string, value: number, color: string }) {
  const colors: any = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    emerald: 'bg-emerald-500'
  };

  return (
    <div className="space-y-2">
        <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.1em]">
            <span className="text-slate-400">{label}</span>
            <span className="text-slate-900">{value}%</span>
        </div>
        <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
            <div className={`${colors[color]} h-full transition-all duration-1000`} style={{ width: `${value}%` }} />
        </div>
    </div>
  );
}
