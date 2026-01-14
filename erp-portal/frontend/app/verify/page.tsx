'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function VerifyPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [config, setConfig] = useState<any>(null);
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await api.get('/config/');
        setConfig(data);
      } catch (err) {
        console.error('Failed to fetch config', err);
      }
    };
    fetchConfig();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Use the URL from backend config (demonstrating "requested url from backend")
      // In this case, we'll just hit a verify endpoint on the same backend
      const { data } = await api.post('/config/verify', { input });
      setMessage(data.message);
      setInput('');
      
      if (data.redirect_url) {
        setTimeout(() => {
          router.push(data.redirect_url);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-10 flex flex-col items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <div className="bg-blue-600 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-200">
              <ShieldCheck size={40} className="text-white" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">System Verification</h2>
            <p className="text-slate-500 font-bold mt-2 opacity-80 uppercase text-[10px] tracking-[0.2em]">Secure Database Handshake</p>
          </div>

          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
            {config && (
              <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Backend</p>
                <p className="text-xs font-bold text-blue-600 truncate">{config.api_url}</p>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Verification Code</label>
                <input 
                  placeholder="Enter secret code..." 
                  className="w-full border-none p-5 rounded-2xl bg-slate-50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-slate-900 text-center text-xl tracking-widest" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-slate-800 shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : <><Send size={18} /> Run Verification</>}
              </button>
            </form>

            {message && (
              <div className="mt-8 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4 animate-in zoom-in duration-300">
                <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />
                <p className="text-sm font-bold text-emerald-700">{message}</p>
              </div>
            )}

            {error && (
              <div className="mt-8 p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 animate-in zoom-in duration-300">
                <AlertCircle className="text-rose-500 shrink-0" size={24} />
                <p className="text-sm font-bold text-rose-700">{error}</p>
              </div>
            )}
          </div>
          
          <p className="mt-8 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
            Identity: {user.full_name} ({user.role})
          </p>
        </div>
      </main>
    </div>
  );
}
