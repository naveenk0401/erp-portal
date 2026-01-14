'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ArrowLeft,
  Calendar,
  User as UserIcon,
  Package,
  Send,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { salesApi, Quotation } from '@/lib/sales-api';
import { useRouter, useParams } from 'next/navigation';

export default function QuotationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuotation = async () => {
      setIsLoading(true);
      try {
        const response = await salesApi.getQuotation(id);
        setQuotation(response.data);
      } catch (err: any) {
        console.error('Failed to fetch quotation', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchQuotation();
    }
  }, [id]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      case 'SENT': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'ACCEPTED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'REJECTED': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT': return <Send className="w-4 h-4" />;
      case 'ACCEPTED': return <CheckCircle2 className="w-4 h-4" />;
      case 'REJECTED': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex">
        <Sidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex">
        <Sidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-slate-700" />
            <h3 className="text-xl font-bold text-white mb-2">Quotation not found</h3>
            <button 
              onClick={() => router.back()}
              className="text-blue-500 hover:text-blue-400"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

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

        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-black text-white tracking-tight">{quotation.quote_number}</h1>
                <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${getStatusStyle(quotation.status)}`}>
                  {getStatusIcon(quotation.status)}
                  {quotation.status}
                </span>
              </div>
              <p className="text-slate-400 font-medium">Quotation Details</p>
            </div>
          </div>

          {/* Customer & Date Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#1e293b]/30 border border-slate-800/60 p-6 rounded-[2rem]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                  <UserIcon size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Customer</p>
                  <p className="text-lg font-bold text-white">{quotation.customer_name}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1e293b]/30 border border-slate-800/60 p-6 rounded-[2rem]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Created Date</p>
                  <p className="text-lg font-bold text-white">
                    {new Date(quotation.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-[#1e293b]/30 border border-slate-800/60 p-8 rounded-[2rem] mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Package size={16} />
              </div>
              <h3 className="text-white font-bold">Line Items</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-3 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">Item</th>
                    <th className="text-right py-3 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">Qty</th>
                    <th className="text-right py-3 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">Price</th>
                    <th className="text-right py-3 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">Tax</th>
                    <th className="text-right py-3 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items.map((item, index) => (
                    <tr key={index} className="border-b border-slate-800/40">
                      <td className="py-4 px-4">
                        <div className="font-bold text-white">{item.name}</div>
                        <div className="text-xs text-slate-500">{item.unit}</div>
                      </td>
                      <td className="py-4 px-4 text-right text-white font-medium">{item.qty}</td>
                      <td className="py-4 px-4 text-right text-white font-medium">₹{item.price.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right text-white font-medium">₹{item.tax_amount.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right text-white font-bold">₹{item.line_total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-6 pt-6 border-t border-slate-800/60">
              <div className="flex justify-end">
                <div className="w-80 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium">Subtotal</span>
                    <span className="text-white font-bold">₹{quotation.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium">Tax Total</span>
                    <span className="text-white font-bold">₹{quotation.tax_total.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-slate-800/60" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Grand Total</span>
                    <span className="text-2xl font-black text-emerald-400">₹{quotation.grand_total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quotation.notes && (
            <div className="bg-[#1e293b]/30 border border-slate-800/60 p-6 rounded-[2rem]">
              <h3 className="text-white font-bold mb-3">Notes</h3>
              <p className="text-slate-400">{quotation.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
