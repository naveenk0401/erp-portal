'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Box, Ruler, DollarSign, ShieldCheck } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import MasterTable from '@/components/MasterTable';
import MasterModal from '@/components/MasterModal';
import { itemApi, categoryApi, taxApi } from '@/lib/masters-api';

interface Item {
  _id: string;
  name: string;
  item_type: string;
  category_id?: string;
  sku?: string;
  unit: string;
  sale_price: number;
  purchase_price: number;
  tax_ids?: string[];
  track_inventory: boolean;
  is_active: boolean;
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [taxes, setTaxes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    item_type: string;
    category_id: string;
    sku: string;
    unit: string;
    sale_price: number;
    purchase_price: number;
    tax_ids: string[];
    track_inventory: boolean;
  }>({
    name: '',
    item_type: 'PRODUCT',
    category_id: '',
    sku: '',
    unit: 'PCS',
    sale_price: 0,
    purchase_price: 0,
    tax_ids: [],
    track_inventory: false
  });

  const fetchItems = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await itemApi.list({ search: searchQuery });
      setItems(response.data);
    } catch (err: any) { console.error(err); }
    finally { setIsLoading(false); }
  }, [searchQuery]);

  const fetchSupportData = React.useCallback(async () => {
    try {
      const [catRes, taxRes] = await Promise.all([
        categoryApi.list(),
        taxApi.list()
      ]);
      setCategories(catRes.data);
      setTaxes(taxRes.data);
    } catch (err: any) { console.error(err); }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchSupportData();
  }, [fetchItems, fetchSupportData]);

  const handleOpenModal = (item: Item | null = null) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        name: item.name,
        item_type: item.item_type,
        category_id: item.category_id || '',
        sku: item.sku || '',
        unit: item.unit,
        sale_price: item.sale_price,
        purchase_price: item.purchase_price,
        tax_ids: item.tax_ids || [],
        track_inventory: item.track_inventory
      });
    } else {
      setSelectedItem(null);
      setFormData({
        name: '', item_type: 'PRODUCT', category_id: '',
        sku: '', unit: 'PCS', sale_price: 0, purchase_price: 0,
        tax_ids: [], track_inventory: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (selectedItem) {
        await itemApi.update(selectedItem._id, formData);
      } else {
        await itemApi.create(formData);
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (err: any) { alert(err.response?.data?.detail || 'Error'); }
    finally { setIsSubmitting(false); }
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Item Details',
      render: (row: Item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white">{row.name}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{row.item_type} • {row.unit}</div>
          </div>
        </div>
      )
    },
    { key: 'sku', label: 'SKU' },
    { 
      key: 'sale_price', 
      label: 'Price',
      render: (row: Item) => <span className="text-emerald-400 font-bold">₹{row.sale_price.toLocaleString()}</span>
    },
    { 
      key: 'track_inventory', 
      label: 'Inventory',
      render: (row: Item) => (
        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
          row.track_inventory ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-800 text-slate-500'
        }`}>
          {row.track_inventory ? 'Tracked' : 'Off'}
        </span>
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
              <div className="h-2 w-8 bg-blue-500 rounded-full"></div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Catalog & Items</h1>
            </div>
            <p className="text-slate-400 font-medium">Manage your products, services, and inventory tracking</p>
          </div>
        </div>

        <MasterTable 
          columns={columns} data={items} isLoading={isLoading}
          onSearch={setSearchQuery} onAdd={() => handleOpenModal()}
          onEdit={handleOpenModal} onDeactivate={async (row: Item) => {
            if(confirm('Deactivate?')) { await itemApi.deactivate(row._id); fetchItems(); }
          }}
          permissionPrefix="items" searchPlaceholder="Search catalog..."
        />
      </div>

      <MasterModal
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        title={selectedItem ? 'Edit Item' : 'New Item'}
        onSubmit={handleSubmit} isLoading={isSubmitting}
      >
        <div className="space-y-6">
          <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-2xl w-max mb-4">
            {['PRODUCT', 'SERVICE'].map(type => (
              <button
                key={type}
                onClick={() => setFormData({...formData, item_type: type})}
                className={`px-6 py-2 rounded-xl text-xs font-black tracking-widest transition-all ${
                  formData.item_type === type ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Item Name</label>
            <div className="relative">
              <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input 
                type="text" placeholder="Item name..."
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">SKU / Code</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                  type="text" placeholder="SKU001"
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Unit</label>
              <div className="relative">
                <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                  type="text" placeholder="PCS"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Sale Price (₹)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                  type="number"
                  value={formData.sale_price}
                  onChange={(e) => setFormData({...formData, sale_price: Number(e.target.value)})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Purchase Price (₹)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                  type="number"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData({...formData, purchase_price: Number(e.target.value)})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white"
                />
              </div>
            </div>
          </div>

          {formData.item_type === 'PRODUCT' && (
            <div className="flex items-center justify-between p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-blue-500 w-5 h-5" />
                <div>
                  <div className="text-sm font-bold text-white">Track Inventory</div>
                  <div className="text-[11px] text-slate-500 font-medium">Keep track of stock levels for this product</div>
                </div>
              </div>
              <input 
                type="checkbox"
                checked={formData.track_inventory}
                onChange={(e) => setFormData({...formData, track_inventory: e.target.checked})}
                className="w-6 h-6 rounded-lg bg-slate-900 border-slate-800 text-emerald-500 focus:ring-emerald-500/40"
              />
            </div>
          )}
        </div>
      </MasterModal>
    </div>
  );
}
