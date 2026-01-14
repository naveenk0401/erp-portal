'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Mail, Phone, MapPin, Hash } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import MasterTable from '@/components/MasterTable';
import MasterModal from '@/components/MasterModal';
import { customerApi } from '@/lib/masters-api';

interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  gst_number?: string;
  is_active: boolean;
  billing_address?: { street: string; city: string; state: string; zip: string; country: string };
  shipping_address?: { street: string; city: string; state: string; zip: string; country: string };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gst_number: '',
    billing_address: { street: '', city: '', state: '', zip: '', country: 'India' },
    shipping_address: { street: '', city: '', state: '', zip: '', country: 'India' }
  });

  const fetchCustomers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await customerApi.list({ search: searchQuery });
      setCustomers(response.data);
    } catch (err: any) {
      console.error('Failed to fetch customers', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleOpenModal = (customer: Customer | null = null) => {
    if (customer) {
      setSelectedCustomer(customer);
      setFormData({
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || '',
        gst_number: customer.gst_number || '',
        billing_address: customer.billing_address || { street: '', city: '', state: '', zip: '', country: 'India' },
        shipping_address: customer.shipping_address || { street: '', city: '', state: '', zip: '', country: 'India' }
      });
    } else {
      setSelectedCustomer(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        gst_number: '',
        billing_address: { street: '', city: '', state: '', zip: '', country: 'India' },
        shipping_address: { street: '', city: '', state: '', zip: '', country: 'India' }
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (selectedCustomer) {
        await customerApi.update(selectedCustomer._id, formData);
      } else {
        await customerApi.create(formData);
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      console.error('Save failed', err);
      alert(err.response?.data?.detail || 'Failed to save customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (customer: Customer) => {
    if (confirm(`Are you sure you want to ${customer.is_active ? 'deactivate' : 'activate'} this customer?`)) {
      try {
        await customerApi.deactivate(customer._id);
        fetchCustomers();
      } catch (err: any) {
        console.error('Action failed', err);
      }
    }
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Customer',
      render: (row: Customer) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white">{row.name}</div>
            <div className="text-xs text-slate-500">{row.email}</div>
          </div>
        </div>
      )
    },
    { key: 'phone', label: 'Contact' },
    { key: 'gst_number', label: 'GSTIN' },
    { 
      key: 'status', 
      label: 'Status',
      render: (row: Customer) => (
        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
          row.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
        }`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <Sidebar />
      
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-2 w-8 bg-emerald-500 rounded-full"></div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Customer Master</h1>
            </div>
            <p className="text-slate-400 font-medium">Manage your customer database and credit profiles</p>
          </div>
        </div>

        <MasterTable 
          columns={columns}
          data={customers}
          isLoading={isLoading}
          onSearch={setSearchQuery}
          onAdd={() => handleOpenModal()}
          onEdit={handleOpenModal}
          onDeactivate={handleDeactivate}
          permissionPrefix="customers"
          searchPlaceholder="Search customers by name or email..."
        />
      </div>

      <MasterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      >
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">GST Number</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                  type="text"
                  placeholder="27AAAAA0000A1Z5"
                  value={formData.gst_number}
                  onChange={(e) => setFormData({...formData, gst_number: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                  type="email"
                  placeholder="contact@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                  type="text"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
            </div>
          </div>

          {/* Address Block */}
          <div className="space-y-4 pt-4 border-t border-slate-800/50">
            <div className="flex items-center gap-2">
              <MapPin className="text-emerald-500 w-5 h-5" />
              <h3 className="font-bold text-white">Billing Address</h3>
            </div>
            <textarea 
              placeholder="Street Address..."
              value={formData.billing_address.street}
              onChange={(e) => setFormData({...formData, billing_address: {...formData.billing_address, street: e.target.value}})}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 h-24"
            />
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" placeholder="City"
                value={formData.billing_address.city}
                onChange={(e) => setFormData({...formData, billing_address: {...formData.billing_address, city: e.target.value}})}
                className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 text-white"
              />
              <input 
                type="text" placeholder="State"
                value={formData.billing_address.state}
                onChange={(e) => setFormData({...formData, billing_address: {...formData.billing_address, state: e.target.value}})}
                className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 text-white"
              />
            </div>
          </div>
        </div>
      </MasterModal>
    </div>
  );
}
