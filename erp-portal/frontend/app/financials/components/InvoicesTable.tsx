import { Eye } from 'lucide-react';
import { Invoice } from '@/types/finance';

interface InvoicesTableProps {
  invoices: Invoice[];
  onView: (invoice: Invoice) => void;
}

export default function InvoicesTable({ invoices, onView }: InvoicesTableProps) {
  return (
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
              <tr key={inv._id || inv.id} className="hover:bg-slate-50/50 transition-colors group">
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
                    onClick={() => onView(inv)}
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
  );
}
