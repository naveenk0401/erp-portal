'use client';

import React, { useState, useEffect } from 'react';
import { Percent } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import MasterTable from '@/components/MasterTable';
import MasterModal from '@/components/MasterModal';
import { taxApi } from '@/lib/masters-api';

interface Tax {
  _id: string;
  name: string;
  rate: number;
  tax_type: string;
  is_active: boolean;
}

export default function TaxesPage() {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', rate: 0, tax_type: 'GST' });

  const fetchTaxes = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await taxApi.list();
      setTaxes(response.data);
    } catch (err: any) { console.error(err); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchTaxes(); }, [fetchTaxes]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await taxApi.create(formData);
      setIsModalOpen(false);
      fetchTaxes();
    } catch (err: any) { alert(err.response?.data?.detail || 'Error'); }
    finally { setIsSubmitting(false); }
  };

  const columns = [
    { 
      key: 'name', label: 'Tax Description',
      render: (row: Tax) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500"><Percent className="w-5 h-5" /></div>
          <span className="font-bold text-white">{row.name}</span>
        </div>
      )
    },
    { 
      key: 'rate', label: 'Rate (%)',
      render: (row: Tax) => <span className="font-bold text-white">{row.rate}%</span>
    },
    { key: 'tax_type', label: 'Type' }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="mb-10 flex items-center gap-3">
          <div className="h-2 w-8 bg-cyan-500 rounded-full"></div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Tax Configuration</h1>
        </div>
        <MasterTable columns={columns} data={taxes} isLoading={isLoading} onSearch={()=>{}} onAdd={() => setIsModalOpen(true)} onEdit={()=>{}} onDeactivate={async (row: Tax) => { if(confirm('Deactivate?')) { await taxApi.deactivate(row._id); fetchTaxes(); } }} permissionPrefix="taxes" />
      </div>
      <MasterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Tax" onSubmit={handleSubmit} isLoading={isSubmitting}>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tax Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 text-white" placeholder="GST 18%" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Rate (%)</label>
              <input type="number" value={formData.rate} onChange={(e) => setFormData({...formData, rate: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tax Type</label>
              <select value={formData.tax_type} onChange={(e) => setFormData({...formData, tax_type: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 text-white">
                <option value="CGST">CGST</option>
                <option value="SGST">SGST</option>
                <option value="IGST">IGST</option>
                <option value="VAT">VAT</option>
              </select>
            </div>
          </div>
        </div>
      </MasterModal>
    </div>
  );
}
