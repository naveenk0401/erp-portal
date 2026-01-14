'use client';

import React, { useState, useEffect } from 'react';
import { Folder } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import MasterTable from '@/components/MasterTable';
import MasterModal from '@/components/MasterModal';
import { categoryApi } from '@/lib/masters-api';

interface Category {
  _id: string;
  name: string;
  parent_category_id?: string | null;
  is_active: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', parent_category_id: null });

  const fetchCategories = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await categoryApi.list({ search: searchQuery });
      setCategories(response.data);
    } catch (err: any) { console.error(err); }
    finally { setIsLoading(false); }
  }, [searchQuery]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await categoryApi.create(formData);
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) { alert(err.response?.data?.detail || 'Error'); }
    finally { setIsSubmitting(false); }
  };

  const columns = [
    { 
      key: 'name', label: 'Category Name',
      render: (row: Category) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
            <Folder className="w-5 h-5" />
          </div>
          <span className="font-bold text-white">{row.name}</span>
        </div>
      )
    },
    { 
      key: 'is_active', label: 'Status',
      render: (row: Category) => <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Active</span>
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="mb-10 flex items-center gap-3">
          <div className="h-2 w-8 bg-orange-500 rounded-full"></div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Item Categories</h1>
        </div>
        <MasterTable columns={columns} data={categories} isLoading={isLoading} onSearch={setSearchQuery} onAdd={() => setIsModalOpen(true)} onEdit={()=>{}} onDeactivate={async (row: Category) => { if(confirm('Delete Category?')) { try{ await categoryApi.delete(row._id); fetchCategories(); } catch(e: any){ alert(e.response?.data?.detail); } } }} permissionPrefix="categories" />
      </div>
      <MasterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Category" onSubmit={handleSubmit} isLoading={isSubmitting}>
        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category Name</label>
          <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 text-white" />
        </div>
      </MasterModal>
    </div>
  );
}
