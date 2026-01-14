'use client';

import React from 'react';
import { X, Loader2 } from 'lucide-react';

interface MasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export default function MasterModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  isLoading = false,
  submitLabel = "Save Changes"
}: MasterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-[#1e293b] border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
              <div className="h-1 w-12 bg-emerald-500 rounded-full mt-2" />
            </div>
            <button 
              onClick={onClose}
              className="p-3 bg-slate-800/50 text-slate-400 rounded-2xl hover:bg-slate-800 hover:text-white transition-all transform hover:rotate-90"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {children}
          </div>

          <div className="mt-10 flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 px-8 py-4 bg-slate-800/50 text-slate-400 rounded-2xl hover:bg-slate-800 hover:text-white transition-all font-bold"
            >
              Cancel
            </button>
            <button 
              onClick={onSubmit}
              disabled={isLoading}
              className="flex-[2] px-8 py-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 font-bold flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
