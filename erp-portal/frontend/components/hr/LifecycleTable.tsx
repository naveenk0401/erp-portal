import React from 'react';
import { ExternalLink, User } from 'lucide-react';

interface LifecycleItem {
  id: string;
  name: string;
  type: 'Onboarding' | 'Probation' | 'Confirmation' | 'Exit';
  date: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Warning';
}

interface LifecycleTableProps {
  items: LifecycleItem[];
  title: string;
}

export const LifecycleTable: React.FC<LifecycleTableProps> = ({ items, title }) => {
  const statusColors: any = {
    Pending: 'bg-slate-100 text-slate-600',
    'In Progress': 'bg-blue-50 text-blue-600',
    Completed: 'bg-emerald-50 text-emerald-600',
    Warning: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-full">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{title}</h3>
        <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Type</th>
              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <User size={14} />
                    </div>
                    <span className="text-xs font-bold text-slate-900">{item.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-bold text-slate-500">{item.type}</td>
                <td className="px-6 py-4 text-xs font-bold text-slate-400">{item.date}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${statusColors[item.status]}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">No pending actions</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
