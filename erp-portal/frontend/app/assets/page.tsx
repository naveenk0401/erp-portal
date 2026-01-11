'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  HardDrive, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Laptop, 
  Cpu, 
  Smartphone, 
  Key,
  ShieldCheck,
  Calendar,
  RefreshCcw,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function AssetsPage() {
  const { user } = useAuthStore();
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState('all');

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/operations/assets');
      setAssets(response.data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (asset.serial_number || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = activeType === 'all' || asset.type.toLowerCase() === activeType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const getAssetIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'laptop': return <Laptop size={18} />;
      case 'phone': return <Smartphone size={18} />;
      case 'peripheral': return <Cpu size={18} />;
      case 'license': return <Key size={18} />;
      default: return <HardDrive size={18} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'assigned': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'maintenance': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'lost': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const stats = {
    total: assets.length,
    assigned: assets.filter(a => a.status === 'assigned').length,
    available: assets.filter(a => a.status === 'available').length,
    maintenance: assets.filter(a => a.status === 'maintenance').length
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 md:p-10 overflow-y-auto max-h-screen custom-scrollbar">
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={14} className="text-blue-500" />
              <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">Asset Inventory & Lifecycle</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Enterprise Assets</h2>
            <p className="text-slate-500 font-bold mt-1 opacity-80 uppercase text-[10px] tracking-widest">Global Hardware & Software Resource Ledger</p>
          </div>
          <div className="flex gap-3">
             <button onClick={fetchAssets} className="bg-white border-2 border-slate-100 text-slate-700 p-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
              <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-xs hover:bg-slate-800 shadow-xl transition-all flex items-center gap-2">
              <Plus size={16} /> Register Asset
            </button>
          </div>
        </header>

        {/* 1. Asset Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <StatCard title="Total Inventory" value={stats.total.toString()} icon={<HardDrive size={20} />} color="blue" />
          <StatCard title="Assigned Assets" value={stats.assigned.toString()} icon={<CheckCircle2 size={20} />} color="emerald" />
          <StatCard title="In Stock" value={stats.available.toString()} icon={<Clock size={20} />} color="purple" />
          <StatCard title="Maintenance" value={stats.maintenance.toString()} icon={<AlertTriangle size={20} />} color="amber" />
        </div>

        {/* 2. Inventory Management */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl w-fit">
              {['all', 'Laptop', 'Phone', 'License'].map(type => (
                <button 
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Serial, Model or ID..." 
                  className="pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 w-full lg:w-72"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-colors">
                <Filter size={18} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center">
                <div className="animate-spin text-blue-500 mb-4 flex justify-center"><RefreshCcw size={32} /></div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Accessing Secure Asset Vault...</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Asset Detail</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Serial Number</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned To</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredAssets.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center opacity-30 italic font-bold text-slate-400">
                        No assets found matching the current criteria.
                      </td>
                    </tr>
                  )}
                  {filteredAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl ${getStatusColor(asset.status)} transition-colors group-hover:bg-slate-900 group-hover:text-white`}>
                            {getAssetIcon(asset.type)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{asset.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: #{asset.id.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{asset.type}</span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-mono font-bold text-slate-600 tracking-tighter">{asset.serial_number || '---'}</p>
                      </td>
                      <td className="px-8 py-6">
                        {asset.assigned_to ? (
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center text-[8px] font-black text-blue-600">
                                {asset.assigned_to_name ? asset.assigned_to_name[0] : 'U'}
                             </div>
                             <p className="text-xs font-bold text-slate-700">{asset.assigned_to_name || 'Assigned'}</p>
                          </div>
                        ) : (
                          <p className="text-xs font-black text-slate-300 uppercase italic">Unassigned</p>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(asset.status)}`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100'
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
      <div className={`p-4 rounded-2xl ${colors[color]} border`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
        <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
      </div>
    </div>
  );
}
