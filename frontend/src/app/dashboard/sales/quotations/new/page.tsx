'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  ArrowLeft,
  Trash2,
  Calendar,
  User as UserIcon,
  Package,
  Calculator
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { salesApi } from '@/lib/sales-api';
import { itemApi, customerApi, taxApi } from '@/lib/masters-api';
import { useRouter } from 'next/navigation';

export default function NewQuotationPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [taxes, setTaxes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    customer_id: '',
    items: [{ item_id: '', qty: 1, price: 0, tax_ids: [] as string[] }],
    valid_until: '',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, itemRes, taxRes] = await Promise.all([
          customerApi.list(),
          itemApi.list(),
          taxApi.list()
        ]);
        setCustomers(custRes.data);
        setItems(itemRes.data);
        setTaxes(taxRes.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item_id: '', qty: 1, price: 0, tax_ids: [] }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    (newItems[index] as any)[field] = value;
    
    // If selecting an item, auto-fill price and taxes
    if (field === 'item_id') {
      const selectedItem = items.find(i => i._id === value);
      if (selectedItem) {
        newItems[index].price = selectedItem.sale_price || 0;
        newItems[index].tax_ids = selectedItem.tax_ids || [];
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let taxTotal = 0;

    formData.items.forEach(item => {
      const lineSubtotal = item.qty * item.price;
      subtotal += lineSubtotal;
      
      item.tax_ids.forEach(taxId => {
        const tax = taxes.find(t => t._id === taxId);
        if (tax) {
          taxTotal += (lineSubtotal * (tax.rate / 100));
        }
      });
    });

    return { subtotal, taxTotal, total: subtotal + taxTotal };
  };

  const { subtotal, taxTotal, total } = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_id || formData.items.some(i => !i.item_id)) {
      alert('Please fill all required fields');
      return;
    }
    
    setIsLoading(true);
    try {
      await salesApi.createQuotation(formData);
      router.push('/dashboard/sales/quotations');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error creating quotation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <Sidebar />
      
      <div className="flex-1 p-8 overflow-y-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-6 font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </button>

        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-3xl font-black text-white tracking-tight">Create Quotation</h1>
            <button 
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Save Quotation'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Form Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Customer and Date */}
              <div className="bg-[#1e293b]/30 border border-slate-800/60 p-8 rounded-[2rem] space-y-6">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <UserIcon size={16} />
                   </div>
                   <h3 className="text-white font-bold">Customer Selection</h3>
                </div>
                
                <div className="space-y-4">
                  <select 
                    value={formData.customer_id}
                    onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500/40 appearance-none font-medium"
                  >
                    <option value="">Select Customer</option>
                    {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Valid Until</label>
                       <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                          <input 
                            type="date"
                            value={formData.valid_until}
                            onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-blue-500/40"
                          />
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="bg-[#1e293b]/30 border border-slate-800/60 p-8 rounded-[2rem]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <Package size={16} />
                    </div>
                    <h3 className="text-white font-bold">Line Items</h3>
                  </div>
                  <button 
                    type="button" onClick={addItem}
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-400 font-bold text-xs uppercase tracking-widest"
                  >
                    <Plus className="w-4 h-4" />
                    Add line
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 p-4 bg-slate-950/40 rounded-2xl border border-slate-800/40 relative group">
                      <div className="col-span-12 md:col-span-5">
                         <select 
                           value={item.item_id}
                           onChange={(e) => updateItem(index, 'item_id', e.target.value)}
                           className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm"
                         >
                           <option value="">Select Item</option>
                           {items.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
                         </select>
                      </div>
                      <div className="col-span-4 md:col-span-2">
                         <input 
                           type="number" placeholder="Qty"
                           value={item.qty}
                           onChange={(e) => updateItem(index, 'qty', Number(e.target.value))}
                           className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm"
                         />
                      </div>
                      <div className="col-span-5 md:col-span-3">
                         <input 
                           type="number" placeholder="Price"
                           value={item.price}
                           onChange={(e) => updateItem(index, 'price', Number(e.target.value))}
                           className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm"
                         />
                      </div>
                      <div className="col-span-3 md:col-span-2 flex items-center justify-end">
                         <button 
                           type="button" onClick={() => removeItem(index)}
                           className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Summary */}
            <div className="lg:col-span-1">
               <div className="bg-[#1e293b]/30 border border-slate-800/60 p-8 rounded-[2rem] sticky top-10 space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Calculator size={16} />
                    </div>
                    <h3 className="text-white font-bold">Summary</h3>
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between items-center text-sm font-medium text-slate-400">
                        <span>Subtotal</span>
                        <span className="text-white font-bold">₹{subtotal.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm font-medium text-slate-400">
                        <span>Tax Total</span>
                        <span className="text-white font-bold">₹{taxTotal.toLocaleString()}</span>
                     </div>
                     <div className="h-px bg-slate-800/60 my-2" />
                     <div className="flex justify-between items-center">
                        <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Grand Total</span>
                        <span className="text-2xl font-black text-emerald-400">₹{total.toLocaleString()}</span>
                     </div>
                  </div>

                  <div className="pt-4">
                     <textarea 
                       placeholder="Additional notes or terms..."
                       value={formData.notes}
                       onChange={(e) => setFormData({...formData, notes: e.target.value})}
                       className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white text-xs min-h-[120px]"
                     />
                  </div>
               </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
