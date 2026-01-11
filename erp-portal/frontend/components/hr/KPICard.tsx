import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color?: string;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, trend, trendType, icon, color = 'blue' }) => {
  const colorClasses: any = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colorClasses[color]} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${
            trendType === 'positive' ? 'bg-emerald-50 text-emerald-600' : 
            trendType === 'negative' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'
          }`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{title}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
};
