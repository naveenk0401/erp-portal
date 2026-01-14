'use client';

import React from 'react';
import { Search, Filter, Plus, Edit2, Trash2, Power, Eye } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  render?: (row: any) => React.ReactNode;
}

interface MasterTableProps {
  columns: Column[];
  data: any[];
  isLoading: boolean;
  onSearch: (query: string) => void;
  onAdd: () => void;
  onEdit: (row: any) => void;
  onView?: (row: any) => void;
  onDeactivate: (row: any) => void;
  searchPlaceholder?: string;
  addLabel?: string;
  permissionPrefix: string;
}

export default function MasterTable({
  columns,
  data,
  isLoading,
  onSearch,
  onAdd,
  onEdit,
  onView,
  onDeactivate,
  searchPlaceholder = "Search...",
  addLabel = "Add New",
  permissionPrefix
}: MasterTableProps) {
  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input 
            type="text"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-[#1e293b]/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all font-medium"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-[#1e293b]/50 border border-slate-800 text-slate-400 rounded-xl hover:text-white hover:border-slate-700 transition-all">
            <Filter className="w-5 h-5" />
            <span className="font-bold text-sm">Filters</span>
          </button>
          
          <button 
            onClick={onAdd}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 font-bold text-sm"
          >
            <Plus className="w-5 h-5" />
            <span>{addLabel}</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-[#1e293b]/20 border border-slate-800/50 rounded-3xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/50">
                {columns.map((col) => (
                  <th key={col.key} className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {col.label}
                  </th>
                ))}
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-6"><div className="h-4 bg-slate-800 rounded w-24"></div></td>
                    ))}
                    <td className="px-6 py-6"><div className="h-4 bg-slate-800 rounded w-16 ml-auto"></div></td>
                  </tr>
                ))
              ) : data.length > 0 ? (
                data.map((row) => (
                  <tr key={row._id} className="group hover:bg-slate-800/30 transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-6 text-sm font-medium text-slate-300">
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                    <td className="px-6 py-6">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onView && (
                          <button onClick={() => onView(row)} className="p-2 text-slate-400 hover:text-white transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => onEdit(row)} className="p-2 text-slate-400 hover:text-emerald-400 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDeactivate(row)} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-20 text-center text-slate-600 font-medium">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
