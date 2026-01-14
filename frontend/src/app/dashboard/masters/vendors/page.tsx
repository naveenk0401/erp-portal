'use client';

import React, { useState, useEffect } from 'react';
import { BaggageClaim } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import MasterTable from '@/components/MasterTable';
import MasterModal from '@/components/MasterModal';
import { vendorApi } from '@/lib/masters-api';

interface Vendor {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  gst_number?: string;
  is_active: boolean;
  address?: { street: string; city: string; state: string; zip: string; country: string };
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', gst_number: '',
    address: { street: '', city: '', state: '', zip: '', country: 'India' }
  });

  const fetchVendors = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await vendorApi.list({ search: searchQuery });
      setVendors(response.data);
    } catch (err: any) { console.error(err); }
    finally { setIsLoading(false); }
  }, [searchQuery]);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  const handleOpenModal = (vendor: Vendor | null = null) => {
    if (vendor) {
      setSelectedVendor(vendor);
      setFormData({
        name: vendor.name, email: vendor.email || '', phone: vendor.phone || '',
        gst_number: vendor.gst_number || '',
        address: vendor.address || { street: '', city: '', state: '', zip: '', country: 'India' }
      });
    } else {
      setSelectedVendor(null);
      setFormData({
        name: '', email: '', phone: '', gst_number: '',
        address: { street: '', city: '', state: '', zip: '', country: 'India' }
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (selectedVendor) await vendorApi.update(selectedVendor._id, formData);
      else await vendorApi.create(formData);
      setIsModalOpen(false);
      fetchVendors();
    } catch (err: any) { alert(err.response?.data?.detail || 'Error'); }
    finally { setIsSubmitting(false); }
  };

  const columns = [
    { 
      key: 'name', label: 'Vendor',
      render: (row: Vendor) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
            <BaggageClaim className="w-5 h-5" />
          </div>
          <div><div className="font-bold text-white">{row.name}</div><div className="text-xs text-slate-500">{row.email}</div></div>
        </div>
      )
    },
    { key: 'phone', label: 'Contact' },
    { key: 'gst_number', label: 'GSTIN' },
    { 
      key: 'status', label: 'Status',
      render: (row: Vendor) => (
        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
          row.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
        }`}>{row.is_active ? 'Active' : 'Inactive'}</span>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-2 w-8 bg-purple-500 rounded-full"></div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Vendor Management</h1>
            </div>
            <p className="text-slate-400 font-medium">Manage your suppliers and procurement partners</p>
          </div>
        </div>
        <MasterTable columns={columns} data={vendors} isLoading={isLoading} onSearch={setSearchQuery} onAdd={() => handleOpenModal()} onEdit={handleOpenModal} onDeactivate={async (row: Vendor) => { if(confirm('Action?')) { await vendorApi.deactivate(row._id); fetchVendors(); } }} permissionPrefix="vendors" />
      </div>
      <MasterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedVendor ? 'Edit Vendor' : 'New Vendor'} onSubmit={handleSubmit} isLoading={isSubmitting}>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">GSTIN</label>
              <input type="text" value={formData.gst_number} onChange={(e) => setFormData({...formData, gst_number: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone</label>
              <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 text-white" />
            </div>
          </div>
        </div>
      </MasterModal>
    </div>
  );
}
