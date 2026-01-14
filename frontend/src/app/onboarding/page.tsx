'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, ArrowRight, Loader2, LogOut, CheckCircle, Briefcase } from 'lucide-react';
import api from '@/lib/api';
import { setTokens, clearTokens } from '@/lib/auth';

interface Company {
  id: string;
  name: string;
  description?: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyDesc, setNewCompanyDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/companies/');
      setCompanies(res.data);
    } catch (err) {
      console.error('Failed to fetch companies');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = async (companyId: string) => {
    setIsSubmitting(true);
    try {
      const res = await api.post(`/companies/select/${companyId}`);
      const { access_token, refresh_token } = res.data;
      setTokens(access_token, refresh_token);
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to select company');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName) return;
    setIsSubmitting(true);
    try {
      // 1. Create company
      const res = await api.post('/companies/', {
        name: newCompanyName,
        description: newCompanyDesc
      });
      // 2. Select it automatically (backend update_user already happened in create_company, but we want new tokens)
      await handleSelect(res.data.id);
    } catch (err) {
      console.error('Failed to create company');
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = () => {
    clearTokens();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500 w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white relative overflow-hidden flex flex-col items-center py-20 px-4">
      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-amber-500/5 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl z-10"
      >
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Setup Your Workspace</h1>
            <p className="text-slate-400 mt-2">Almost there! Choose a company to get started.</p>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Company Selection */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Building2 className="text-emerald-500" />
              Existing Companies
            </h2>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {companies.length > 0 ? (
                companies.map((company) => (
                  <motion.button
                    key={company.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(company.id)}
                    disabled={isSubmitting}
                    className="w-full text-left bg-slate-900/40 border border-slate-800 p-6 rounded-2xl hover:border-emerald-500/50 hover:bg-slate-800/40 transition-all group flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-emerald-400 transition-colors">{company.name}</h3>
                      <p className="text-slate-500 text-sm mt-1">{company.description || 'No description'}</p>
                    </div>
                    <ArrowRight className="text-slate-700 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                  </motion.button>
                ))
              ) : (
                <div className="text-center py-12 bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl">
                  <p className="text-slate-500">No companies found. Create one to continue.</p>
                </div>
              )}
            </div>
          </div>

          {/* Create New Company */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Plus className="text-amber-500" />
              Register New Entity
            </h2>

            <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl shadow-xl">
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 ml-1">Company Name</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <input
                      value={newCompanyName}
                      onChange={(e) => setNewCompanyName(e.target.value)}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                      placeholder="Acme Corporation"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 ml-1">Description (Optional)</label>
                  <textarea
                    value={newCompanyDesc}
                    onChange={(e) => setNewCompanyDesc(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all min-h-[100px]"
                    placeholder="Enter business details..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !newCompanyName}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <>
                      Create Company
                      <CheckCircle size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
