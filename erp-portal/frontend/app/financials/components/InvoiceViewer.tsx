import { Download, X } from 'lucide-react';
import { Invoice } from '@/types/finance';
import { toast } from 'sonner';
import api from '@/lib/api';

interface InvoiceViewerProps {
  invoice: Invoice;
  onClose: () => void;
}

export default function InvoiceViewer({ invoice, onClose }: InvoiceViewerProps) {
  const handleDownload = async () => {
    try {
       const response = await api.get(`/finance/invoices/${invoice._id || invoice.id}/pdf`, { responseType: 'blob' });
       const url = window.URL.createObjectURL(new Blob([response.data]));
       const link = document.createElement('a');
       link.href = url;
       link.setAttribute('download', `invoice_${invoice.invoice_number || 'download'}.pdf`);
       document.body.appendChild(link);
       link.click();
       link.parentNode?.removeChild(link);
       toast.success('Invoice PDF downloaded!');
    } catch (error) {
       console.error("PDF Download failed", error);
       toast.error("Failed to download PDF. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-[2.5rem] p-10 max-w-3xl w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
         <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      invoice.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      invoice.status === 'overdue' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {invoice.status}
             </span>
             <span className="text-slate-400 font-bold text-xs">{invoice.invoice_number || 'INV-PREVIEW'}</span>
            </div>
            <h3 className="text-4xl font-black text-slate-900 tracking-tight">{invoice.to_company?.name || invoice.client_name}</h3>
            <p className="text-slate-400 text-sm font-medium mt-1">{invoice.to_company?.address || 'No Address Provided'}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full">
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
               {invoice.items?.map((item: any, i:number) => (
                 <tr key={i}>
                   <td className="p-4">{item.description || 'Service Charge'}</td>
                   <td className="p-4 text-right">{item.rate?.toLocaleString() || (invoice.amount! / (item.quantity || 1)).toLocaleString()}</td>
                   <td className="p-4 text-right">{item.quantity || 1}</td>
                   <td className="p-4 text-right">{(item.rate * item.quantity).toLocaleString() || invoice.amount?.toLocaleString()}</td>
                 </tr>
               ))}
             </tbody>
           </table>
           <div className="bg-slate-50/50 p-4 border-t border-slate-100 flex justify-end">
              <div className="text-right space-y-1">
                <div className="flex justify-between gap-12 text-slate-500 text-xs"><span>Subtotal:</span> <span>₹{(invoice.subtotal || invoice.amount || 0).toLocaleString()}</span></div>
                <div className="flex justify-between gap-12 text-slate-500 text-xs"><span>Tax (18%):</span> <span>₹{(invoice.tax_total || ((invoice.amount || 0) * 0.18) || 0).toLocaleString()}</span></div>
                <div className="flex justify-between gap-12 text-slate-900 font-black text-lg pt-2 border-t border-slate-200 mt-2"><span>Total:</span> <span>₹{(invoice.grand_total || invoice.amount || 0).toLocaleString()}</span></div>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={handleDownload}
            className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Download size={18} /> Download PDF Invoice
          </button>
          <button onClick={onClose} className="flex-1 py-4 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all">Close Viewer</button>
        </div>
      </div>
    </div>
  );
}
