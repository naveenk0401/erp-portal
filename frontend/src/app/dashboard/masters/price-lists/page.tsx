'use client';

import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import MasterTable from '@/components/MasterTable';
import MasterModal from '@/components/MasterModal';
import { priceListApi, itemApi } from '@/lib/masters-api';

interface PriceListEntry {
  item_id: string;
  price: number;
}

interface PriceList {
  _id: string;
  name: string;
  item_prices: PriceListEntry[];
}

export default function PriceListsPage() {
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    item_prices: PriceListEntry[];
  }>({ name: '', item_prices: [] });

  const fetchPriceLists = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await priceListApi.list();
      setPriceLists(response.data);
    } catch (err: any) { console.error(err); }
    finally { setIsLoading(false); }
  }, []);

  const fetchItems = React.useCallback(async () => {
    try {
      const response = await itemApi.list();
      setItems(response.data);
    } catch (err: any) { console.error(err); }
  }, []);

  useEffect(() => { fetchPriceLists(); fetchItems(); }, [fetchPriceLists, fetchItems]);

  const handleSubmit = async () => {
    try {
      await priceListApi.create(formData);
      setIsModalOpen(false);
      fetchPriceLists();
    } catch (err: any) { alert('Failed'); }
  };

  const addPriceRow = () => {
    setFormData({
      ...formData,
      item_prices: [...formData.item_prices, { item_id: '', price: 0 }]
    });
  };

  const columns = [
    { 
      key: 'name', label: 'Price List Name',
      render: (row: PriceList) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500"><ClipboardList className="w-5 h-5" /></div>
          <span className="font-bold text-white">{row.name}</span>
        </div>
      )
    },
    { 
      key: 'item_prices', label: 'Items Covered',
      render: (row: PriceList) => <span className="text-slate-500 font-bold">{row.item_prices.length} Items</span>
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="mb-10 flex items-center gap-3">
          <div className="h-2 w-8 bg-indigo-500 rounded-full"></div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Price Lists</h1>
        </div>
        <MasterTable columns={columns} data={priceLists} isLoading={isLoading} onSearch={()=>{}} onAdd={() => setIsModalOpen(true)} onEdit={()=>{}} onDeactivate={()=>{}} permissionPrefix="price_lists" />
      </div>
      <MasterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Price List" onSubmit={handleSubmit}>
        <div className="space-y-6">
          <input type="text" placeholder="Price List name..." value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 text-white" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-500 uppercase">Item Pricing</h3>
              <button onClick={addPriceRow} className="text-xs font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1"><Plus className="w-4 h-4" /> Add Item</button>
            </div>
            
            {formData.item_prices.map((row, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <select 
                  value={row.item_id}
                  onChange={(e) => {
                    const next = [...formData.item_prices];
                    next[idx].item_id = e.target.value;
                    setFormData({...formData, item_prices: next});
                  }}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm"
                >
                  <option value="">Select Item</option>
                  {items.map((item: any) => <option key={item._id} value={item._id}>{item.name}</option>)}
                </select>
                <input 
                  type="number"
                  value={row.price}
                  onChange={(e) => {
                    const next = [...formData.item_prices];
                    next[idx].price = Number(e.target.value);
                    setFormData({...formData, item_prices: next});
                  }}
                  className="w-32 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      </MasterModal>
    </div>
  );
}
