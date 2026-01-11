'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useFinance } from '@/hooks/useFinance';
import StatsCards from './components/StatsCards';
import InvoicesTable from './components/InvoicesTable';
import NewInvoiceModal from './components/NewInvoiceModal';
import InvoiceViewer from './components/InvoiceViewer';
import PeriodSelector from './components/PeriodSelector';
import { Download, Plus } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Invoice } from '@/types/finance';

export default function FinancialHealthPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('year');
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  
  const { loading, stats, invoices, refetch } = useFinance(selectedPeriod);

  const handleDownloadAudit = async () => {
    try {
      const response = await api.get('/finance/audit/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `financial_audit_${new Date().getFullYear()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success('Audit Report downloaded successfully!');
    } catch (error) {
      console.error("Audit Download failed", error);
      toast.error("Failed to download Audit Report.");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 md:p-10 overflow-y-auto max-h-screen custom-scrollbar">
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200 pb-8">
           {/* Header Content */}
           <div>
             <div className="flex items-center gap-2 mb-2">
               <span className="bg-blue-600 w-2 h-2 rounded-full animate-pulse"></span>
               <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">Strategic Intelligence</span>
             </div>
             <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight flex items-center gap-4">
               Financial Health
             </h2>
             <p className="text-slate-500 mt-2 font-bold text-sm md:text-base opacity-80 italic">
               Real-time monitoring of company net worth, revenue trends, and profitability.
             </p>
           </div>

           {/* Actions */}
           <div className="flex gap-3 items-center">
             <PeriodSelector selected={selectedPeriod} onChange={setSelectedPeriod} />
             
             <button 
               onClick={handleDownloadAudit} 
               className="bg-white border-2 border-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex items-center gap-2"
             >
               <Download size={18} /> Audit
             </button>
             
             <button 
               onClick={() => setCreateOpen(true)} 
               className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 flex items-center gap-2"
             >
               <Plus size={18} /> New Invoice
             </button>
           </div>
        </header>

        {loading ? (
          <div className="space-y-8 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-48">
               {[1,2,3].map(i => <div key={i} className="bg-white rounded-[2.5rem] border border-slate-100" />)}
            </div>
            <div className="bg-white h-96 rounded-[2.5rem] border border-slate-100" />
          </div>
        ) : (
          <>
            <StatsCards stats={stats} />
            <InvoicesTable 
              invoices={invoices} 
              onView={(inv) => setViewingInvoice(inv)} 
            />
          </>
        )}

        {/* Modals */}
        {isCreateOpen && (
          <NewInvoiceModal 
            onClose={() => setCreateOpen(false)} 
            onSuccess={() => { setCreateOpen(false); refetch(); }} 
          />
        )}
        
        {viewingInvoice && (
          <InvoiceViewer 
            invoice={viewingInvoice} 
            onClose={() => setViewingInvoice(null)} 
          />
        )}
      </main>
    </div>
  );
}
