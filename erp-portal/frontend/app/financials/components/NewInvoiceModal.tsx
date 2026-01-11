import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Invoice } from '@/types/finance';

interface NewInvoiceModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewInvoiceModal({ onClose, onSuccess }: NewInvoiceModalProps) {
  const [invoiceForm, setInvoiceForm] = useState<Omit<Invoice, '_id'>>({
    from_company: { name: 'ERP Systems Ltd', address: 'Tech Park, Bangalore', gst: '29ABCDE1234F1Z5', contact_person: 'Admin', email: 'accounts@erp.com' },
    to_company: { name: '', address: '', gst: '', contact_person: '', email: '' },
    items: [{ description: '', hsn_sac: '', quantity: 1, rate: 0, tax_rate: 18 }],
    payment_details: { bank_name: '', account_no: '', ifsc: '', mode: 'Bank Transfer' },
    order_details: { po_number: '', po_date: new Date().toISOString().split('T')[0] },
    due_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const addItem = () => {
    setInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, { description: '', hsn_sac: '', quantity: 1, rate: 0, tax_rate: 18 }]
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...invoiceForm.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setInvoiceForm({ ...invoiceForm, items: newItems });
  };

  const removeItem = (index: number) => {
     setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));   
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/finance/invoices', invoiceForm);
      onSuccess();
      toast.success('Invoice issued successfully! 🚀');
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice. Please check the details.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-[2rem] p-8 max-w-4xl w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">New B2B Invoice</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleCreateInvoice} className="space-y-8">
          {/* To Company Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest bg-slate-50 p-3 rounded-xl border border-slate-100">Bill To (Client)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Company Name" required className="input-field" value={invoiceForm.to_company.name} onChange={e => setInvoiceForm({...invoiceForm, to_company: {...invoiceForm.to_company, name: e.target.value}})} />
              <input type="text" placeholder="GSTIN" className="input-field" value={invoiceForm.to_company.gst} onChange={e => setInvoiceForm({...invoiceForm, to_company: {...invoiceForm.to_company, gst: e.target.value}})} />
              <input type="text" placeholder="Contact Person" className="input-field" value={invoiceForm.to_company.contact_person} onChange={e => setInvoiceForm({...invoiceForm, to_company: {...invoiceForm.to_company, contact_person: e.target.value}})} />
              <input type="email" placeholder="Email" className="input-field" value={invoiceForm.to_company.email} onChange={e => setInvoiceForm({...invoiceForm, to_company: {...invoiceForm.to_company, email: e.target.value}})} />
              <textarea placeholder="Legal Address" rows={2} className="input-field col-span-2" value={invoiceForm.to_company.address} onChange={e => setInvoiceForm({...invoiceForm, to_company: {...invoiceForm.to_company, address: e.target.value}})} />
            </div>
          </div>

          {/* Order Meta */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">PO Number</label>
              <input type="text" className="input-field" value={invoiceForm.order_details.po_number} onChange={e => setInvoiceForm({...invoiceForm, order_details: {...invoiceForm.order_details, po_number: e.target.value}})} />
            </div>
            <div>
              <label className="label">PO Date</label>
              <input type="date" className="input-field" value={invoiceForm.order_details.po_date} onChange={e => setInvoiceForm({...invoiceForm, order_details: {...invoiceForm.order_details, po_date: e.target.value}})} />
            </div>
            <div>
              <label className="label">Due Date</label>
              <input type="date" required className="input-field" value={invoiceForm.due_date} onChange={e => setInvoiceForm({...invoiceForm, due_date: e.target.value})} />
            </div>
          </div>

          {/* Line Items */}
          <div>
             <div className="flex justify-between items-center mb-2">
               <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Line Items</h4>
               <button type="button" onClick={addItem} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"><Plus size={14}/> Add Item</button>
             </div>
             <div className="space-y-2">
                {invoiceForm.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <div className="col-span-4"><input type="text" placeholder="Description" className="input-field-sm" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} /></div>
                    <div className="col-span-2"><input type="text" placeholder="HSN" className="input-field-sm" value={item.hsn_sac} onChange={e => updateItem(idx, 'hsn_sac', e.target.value)} /></div>
                    <div className="col-span-1"><input type="number" placeholder="Qty" className="input-field-sm" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseFloat(e.target.value))} /></div>
                    <div className="col-span-2"><input type="number" placeholder="Rate" className="input-field-sm" value={item.rate} onChange={e => updateItem(idx, 'rate', parseFloat(e.target.value))} /></div>
                    <div className="col-span-1 text-right text-xs font-bold text-slate-500">{(item.quantity * item.rate).toLocaleString()}</div>
                    <div className="col-span-1 text-center"><button type="button" onClick={() => removeItem(idx)} className="text-rose-500 hover:bg-rose-50 p-1 rounded-full"><X size={14}/></button></div>
                  </div>
                ))}
             </div>
             <div className="flex justify-end mt-4 text-right">
               <div className="bg-slate-900 text-white p-4 rounded-xl min-w-[200px]">
                 <p className="text-xs font-medium opacity-70">Total Estimated</p>
                 <p className="text-xl font-bold">₹{invoiceForm.items.reduce((acc, i) => acc + (i.quantity * i.rate * 1.18), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
               </div>
             </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95">Issue Invoice</button>
          </div>
        </form>
        <style jsx>{`
        .input-field {
          @apply w-full border-none p-3 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-slate-900 text-sm;
        }
        .input-field-sm {
           @apply w-full border-none p-2 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium text-slate-700 text-xs;
        }
        .label {
          @apply block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1;
        }
      `}</style>
      </div>
    </div>
  );
}
