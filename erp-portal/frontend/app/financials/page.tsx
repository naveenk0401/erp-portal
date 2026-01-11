'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Toaster, toast } from 'sonner';
import { TrendingUp, Construction, IndianRupee, PieChart, ArrowUpRight, ArrowDownRight, Plus, X, Search, Eye, Download } from 'lucide-react';
import api from '@/lib/api';

export default function FinancialHealthPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('year'); // year, month, week
  const [invoiceForm, setInvoiceForm] = useState({
    from_company: { name: 'ERP Systems Ltd', address: 'Tech Park, Bangalore', gst: '29ABCDE1234F1Z5', contact_person: 'Admin', email: 'accounts@erp.com' },
    to_company: { name: '', address: '', gst: '', contact_person: '', email: '' },
    items: [{ description: '', hsn_sac: '', quantity: 1, rate: 0, tax_rate: 18 }],
    payment_details: { bank_name: '', account_no: '', ifsc: '', mode: 'Bank Transfer' },
    order_details: { po_number: '', po_date: new Date().toISOString().split('T')[0] },
    due_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, invoicesRes] = await Promise.all([
        api.get(`/finance/summary?period=${selectedPeriod}`),
        api.get('/finance/invoices')
      ]);
      setStats(summaryRes.data);
      setInvoices(invoicesRes.data);
    } catch (error) {
      console.error('Error fetching finance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

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
      setShowInvoiceModal(false);
      // Reset form to defaults
      setInvoiceForm({
        from_company: { name: 'ERP Systems Ltd', address: 'Tech Park, Bangalore', gst: '29ABCDE1234F1Z5', contact_person: 'Admin', email: 'accounts@erp.com' },
        to_company: { name: '', address: '', gst: '', contact_person: '', email: '' },
        items: [{ description: '', hsn_sac: '', quantity: 1, rate: 0, tax_rate: 18 }],
        payment_details: { bank_name: '', account_no: '', ifsc: '', mode: 'Bank Transfer' },
        order_details: { po_number: '', po_date: new Date().toISOString().split('T')[0] },
        due_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      await fetchData(); 
      toast.success('Invoice issued successfully! 🚀');
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice. Please check the details.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 md:p-10 overflow-y-auto max-h-screen custom-scrollbar">
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200 pb-8">
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
          <div className="flex gap-3 items-center">
            <div className="bg-white border border-slate-200 rounded-2xl p-1 flex">
               {['year', 'month', 'week'].map((p) => (
                 <button 
                  key={p}
                  onClick={() => setSelectedPeriod(p)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedPeriod === p ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   {p}
                 </button>
               ))}
            </div>
            <button 
              onClick={async () => {
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
              }}
              className="bg-white border-2 border-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex items-center gap-2"
            >
              <Download size={18} /> Audit
            </button>
            <button 
              onClick={() => setShowInvoiceModal(true)}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                  <TrendingUp size={80} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Company Net Worth</p>
                <div className="flex items-end gap-3 mb-1">
                  <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{stats?.net_worth}</h4>
                  <span className={`flex items-center font-black text-xs mb-1.5 ${stats?.net_worth_trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {stats?.net_worth_trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {Math.abs(stats?.net_worth_trend)}%
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-400">vs Last Fiscal Year</p>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                  <IndianRupee size={80} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Revenue</p>
                <div className="flex items-end gap-3 mb-1">
                  <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{stats?.cashflow}</h4>
                  <span className={`flex items-center font-black text-xs mb-1.5 ${stats?.cashflow_trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {stats?.cashflow_trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {Math.abs(stats?.cashflow_trend)}%
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-400">Gross Inflow YTD</p>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                  <PieChart size={80} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Operating Margin</p>
                <div className="flex items-end gap-3 mb-1">
                  <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{stats?.operating_margin}</h4>
                  <span className={`flex items-center font-black text-xs mb-1.5 ${stats?.operating_margin_trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {stats?.operating_margin_trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {Math.abs(stats?.operating_margin_trend)}%
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-400">Efficiency: {stats?.efficiency_indicator}</p>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <h3 className="font-black text-slate-900 tracking-tight text-xl">Recent Invoices</h3>
                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-widest">{invoices.length} Records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Client</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Due Date</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                           <p className="font-black text-slate-900 text-sm">{inv.to_company?.name || inv.client_name || 'N/A'}</p>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-slate-600">
                          ₹{(inv.grand_total || inv.amount || 0).toLocaleString()}
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            inv.status === 'overdue' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                            'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-xs font-bold text-slate-400">
                          {new Date(inv.due_date).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-6">
                          <button 
                            onClick={() => setSelectedInvoice(inv)}
                            className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-blue-600 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all active:scale-95"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {invoices.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold text-sm">No invoices found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        {/* Create Modal */}
        {showInvoiceModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-[2rem] p-8 max-w-4xl w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">New B2B Invoice</h3>
                <button onClick={() => setShowInvoiceModal(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full">
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
                  <button type="button" onClick={() => setShowInvoiceModal(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50">Cancel</button>
                  <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95">Issue Invoice</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-[2.5rem] p-10 max-w-3xl w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
               <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                     <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            selectedInvoice.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            selectedInvoice.status === 'overdue' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                            'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                            {selectedInvoice.status}
                   </span>
                   <span className="text-slate-400 font-bold text-xs">{selectedInvoice.invoice_number || 'INV-PREVIEW'}</span>
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">{selectedInvoice.to_company?.name || selectedInvoice.client_name}</h3>
                  <p className="text-slate-400 text-sm font-medium mt-1">{selectedInvoice.to_company?.address || 'No Address Provided'}</p>
                </div>
                <button onClick={() => setSelectedInvoice(null)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <div className="border rounded-2xl border-slate-100 overflow-hidden mb-8">
                 <table className="w-full text-left text-sm">
                   <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider">
                     <tr>
                        <th className="p-4">Description</th>
                        <th className="p-4 text-right">Rate</th>
                        <th className="p-4 text-right">Qty</th>
                        <th className="p-4 text-right">Amount</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                     {selectedInvoice.items?.map((item: any, i:number) => (
                       <tr key={i}>
                         <td className="p-4">{item.description || 'Service Charge'}</td>
                         <td className="p-4 text-right">{item.rate?.toLocaleString() || (selectedInvoice.amount / (item.quantity || 1)).toLocaleString()}</td>
                         <td className="p-4 text-right">{item.quantity || 1}</td>
                         <td className="p-4 text-right">{(item.rate * item.quantity).toLocaleString() || selectedInvoice.amount.toLocaleString()}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
                 <div className="bg-slate-50/50 p-4 border-t border-slate-100 flex justify-end">
                    <div className="text-right space-y-1">
                      <div className="flex justify-between gap-12 text-slate-500 text-xs"><span>Subtotal:</span> <span>₹{(selectedInvoice.subtotal || selectedInvoice.amount || 0).toLocaleString()}</span></div>
                      <div className="flex justify-between gap-12 text-slate-500 text-xs"><span>Tax (18%):</span> <span>₹{(selectedInvoice.tax_total || (selectedInvoice.amount * 0.18) || 0).toLocaleString()}</span></div>
                      <div className="flex justify-between gap-12 text-slate-900 font-black text-lg pt-2 border-t border-slate-200 mt-2"><span>Total:</span> <span>₹{(selectedInvoice.grand_total || selectedInvoice.amount || 0).toLocaleString()}</span></div>
                    </div>
                 </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={async () => {
                     try {
                        const response = await api.get(`/finance/invoices/${selectedInvoice._id || selectedInvoice.id}/pdf`, { responseType: 'blob' });
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `invoice_${selectedInvoice.invoice_number || 'download'}.pdf`);
                        document.body.appendChild(link);
                        link.click();
                        link.parentNode?.removeChild(link);
                        toast.success('Invoice PDF downloaded!');
                     } catch (error) {
                        console.error("PDF Download failed", error);
                        toast.error("Failed to download PDF. Please try again.");
                     }
                  }}
                  className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Download size={18} /> Download PDF Invoice
                </button>
                <button onClick={() => setSelectedInvoice(null)} className="flex-1 py-4 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all">Close Viewer</button>
              </div>
            </div>
          </div>
        )}

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
      </main>
    </div>
  );
}
