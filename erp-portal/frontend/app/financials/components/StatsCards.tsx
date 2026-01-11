import { TrendingUp, IndianRupee, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatsCards({ stats }: { stats: any }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
          <TrendingUp size={80} />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Company Net Worth</p>
        <div className="flex items-end gap-3 mb-1">
          <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{stats.net_worth}</h4>
          <span className={`flex items-center font-black text-xs mb-1.5 ${stats.net_worth_trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {stats.net_worth_trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {Math.abs(stats.net_worth_trend)}%
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
          <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{stats.cashflow}</h4>
          <span className={`flex items-center font-black text-xs mb-1.5 ${stats.cashflow_trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {stats.cashflow_trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {Math.abs(stats.cashflow_trend)}%
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
          <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{stats.operating_margin}</h4>
          <span className={`flex items-center font-black text-xs mb-1.5 ${stats.operating_margin_trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {stats.operating_margin_trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {Math.abs(stats.operating_margin_trend)}%
          </span>
        </div>
        <p className="text-[10px] font-bold text-slate-400">Efficiency: {stats.efficiency_indicator}</p>
      </div>
    </div>
  );
}
