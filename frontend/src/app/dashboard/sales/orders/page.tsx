'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Plus, 
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Activity
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { salesApi } from '@/lib/sales-api';
import { useRouter } from 'next/navigation';

export default function SalesOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await salesApi.getSalesOrders();
      setOrders(response.data);
    } catch (err: any) {
      console.error('Failed to fetch orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      case 'CONFIRMED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'CANCELLED': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  const filteredOrders = orders.filter(o => 
    o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-2 w-8 bg-emerald-500 rounded-full"></div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Sales Orders</h1>
            </div>
            <p className="text-slate-400 font-medium">Manage confirmed customer orders</p>
          </div>
        </div>

        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search by order number or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e293b]/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <div key={i} className="h-24 bg-[#1e293b]/20 border border-slate-800/50 rounded-2xl animate-pulse" />)
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div 
                key={order._id}
                className="group p-6 bg-[#1e293b]/30 border border-slate-800/60 rounded-3xl hover:border-emerald-500/30 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white font-bold text-lg">{order.order_number}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-slate-400 font-medium text-sm">{order.customer_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-12">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total</p>
                    <p className="text-xl font-black text-white">₹{order.grand_total.toLocaleString()}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-emerald-500 transition-colors" />
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center opacity-30">
              <Briefcase className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-bold">No orders found</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
