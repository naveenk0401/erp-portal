import { Dispatch, SetStateAction } from 'react';

interface PeriodSelectorProps {
  selected: string;
  onChange: Dispatch<SetStateAction<string>>;
}

export default function PeriodSelector({ selected, onChange }: PeriodSelectorProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-1 flex">
      {['year', 'month', 'week'].map((p) => (
        <button 
          key={p}
          onClick={() => onChange(p)}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selected === p ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
