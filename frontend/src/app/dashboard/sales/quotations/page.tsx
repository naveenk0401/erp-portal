'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Filter, 
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Send
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { salesApi, Quotation } from '@/lib/sales-api';
import { useRouter } from 'next/navigation';
import { Can } from '@/lib/permissions';

export default function QuotationsPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchQuotations = async () => {
    setIsLoading(true);
    try {
      const response = await salesApi.getQuotations();
      setQuotations(response.data);
    } catch (err: any) {
      console.error('Failed to fetch quotations', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      case 'SENT': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'ACCEPTED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'REJECTED': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Clock className="w-3 h-3" />;
      case 'SENT': return <Send className="w-3 h-3" />;
      case 'ACCEPTED': return <CheckCircle2 className="w-3 h-3" />;
      case 'REJECTED': return <XCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  const filteredQuotations = quotations.filter(q => 
    q.quote_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <Sidebar />
      
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-2 w-8 bg-blue-500 rounded-full"></div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Quotations</h1>
            </div>
            <p className="text-slate-400 font-medium">Create and manage sales quotes for your customers</p>
          </div>
          
          <Can I="sales.quote.create">
            <button 
              onClick={() => router.push('/dashboard/sales/quotations/new')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              New Quotation
            </button>
          </Can>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search by quote number or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e293b]/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#1e293b]/50 border border-slate-800 text-slate-400 rounded-xl hover:text-white hover:border-slate-700 transition-all">
            <Filter className="w-5 h-5" />
            <span className="font-bold text-sm">Filters</span>
          </button>
        </div>

        {/* List */}
        <div className="space-y-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-[#1e293b]/20 border border-slate-800/50 rounded-2xl animate-pulse" />
            ))
          ) : filteredQuotations.length > 0 ? (
            filteredQuotations.map((quote) => (
              <div 
                key={quote._id}
                onClick={() => router.push(`/dashboard/sales/quotations/${quote._id}`)}
                className="group p-6 bg-[#1e293b]/30 border border-slate-800/60 rounded-3xl hover:border-blue-500/30 hover:bg-blue-500/[0.02] transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white font-bold text-lg">{quote.quote_number}</h3>
                      <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(quote.status)}`}>
                        {getStatusIcon(quote.status)}
                        {quote.status}
                      </span>
                    </div>
                    <p className="text-slate-400 font-medium text-sm">{quote.customer_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-12">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Amount</p>
                    <p className="text-xl font-black text-white">₹{quote.grand_total.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Created</p>
                    <p className="text-sm font-bold text-slate-300">
                      {new Date(quote.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center opacity-30">
              <FileText className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-bold">No quotations found</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
