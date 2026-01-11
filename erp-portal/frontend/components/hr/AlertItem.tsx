import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Clock, User, AlertTriangle, Flame } from 'lucide-react';

interface AlertItemProps {
  title: string;
  description: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  category: string;
}

export const AlertItem: React.FC<AlertItemProps> = ({ title, description, reason, severity, timestamp, category }) => {
  const [expanded, setExpanded] = useState(false);

  const severityStyles = {
    low: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    medium: 'bg-amber-50 text-amber-700 border-amber-100',
    high: 'bg-rose-50 text-rose-700 border-rose-100',
  };

  const severityIcons = {
    low: <AlertCircle size={18} className="text-emerald-500" />,
    medium: <AlertTriangle size={18} className="text-amber-500" />,
    high: <Flame size={18} className="text-rose-500" />,
  };

  return (
    <div className={`rounded-2xl border transition-all mb-3 ${severityStyles[severity]}`}>
      <div 
        className="p-4 flex items-center gap-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="bg-white/50 p-2 rounded-xl shadow-sm">
          {severityIcons[severity]}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{category}</span>
            <span className="text-[9px] font-bold opacity-60 flex items-center gap-1">
              <Clock size={10} /> {timestamp}
            </span>
          </div>
          <p className="text-sm font-black tracking-tight">{title}</p>
          <p className="text-xs font-medium opacity-80">{description}</p>
        </div>
        <button className="p-1 hover:bg-white/20 rounded-lg transition-colors">
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-black/5 animate-in slide-in-from-top-2">
          <div className="bg-white/30 p-3 rounded-xl">
            <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Root Cause / Recommendation</p>
            <p className="text-xs font-bold leading-relaxed">{reason}</p>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="flex-1 bg-white/80 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors">Acknowledge</button>
            <button className="flex-1 bg-slate-900 text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors">Take Action</button>
          </div>
        </div>
      )}
    </div>
  );
};
