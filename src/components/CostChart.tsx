import React, { useState } from 'react';
import { TravelCosts } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  costs: TravelCosts;
  currency: string;
  labels: {
    estTotal: string;
    flights: string;
    stay: string;
    food: string;
    transport: string;
    extras: string;
    duration: string;
    days: string;
    exportTitle: string;
    exportPdf: string;
    exportTxt: string;
    exportCopy: string;
  };
  onDurationChange?: (days: number) => void;
  initialDays?: number;
  onExport?: (format: 'pdf' | 'txt' | 'copy') => void;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

const CostChart: React.FC<Props> = ({ costs, currency, labels, onDurationChange, initialDays = 7, onExport }) => {
  const [days, setDays] = useState(initialDays);
  const cleanSymbol = currency ? currency.replace(/['\"]/g, '') : '';

  const scaledCosts = {
    flights: costs.flights,
    stay: Math.round((costs.accommodation / initialDays) * days),
    food: Math.round((costs.food / initialDays) * days),
    transport: Math.round((costs.transport / initialDays) * days),
    extras: Math.round((costs.extras / initialDays) * days),
  };

  const total = Object.values(scaledCosts).reduce((a, b) => a + b, 0);

  const data = [
    { name: labels.flights, value: scaledCosts.flights, color: COLORS[0] },
    { name: labels.stay, value: scaledCosts.stay, color: COLORS[1] },
    { name: labels.food, value: scaledCosts.food, color: COLORS[2] },
    { name: labels.transport, value: scaledCosts.transport, color: COLORS[3] },
    { name: labels.extras, value: scaledCosts.extras, color: COLORS[4] },
  ];

  const handleDaysChange = (newDays: number) => {
    setDays(newDays);
    onDurationChange?.(newDays);
  };

  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-[32px] p-8 shadow-xl border border-slate-100 dark:border-white/5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500">
              <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <h3 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">{labels.estTotal}</h3>
        </div>
        {onExport && (
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl text-sm font-bold transition-all border border-slate-200 dark:border-slate-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              {labels.exportTitle}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50 min-w-[140px]">
              {['pdf', 'txt', 'copy'].map((fmt) => (
                <button key={fmt} onClick={() => onExport(fmt as 'pdf' | 'txt' | 'copy')}
                  className="w-full px-4 py-2.5 text-left text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors uppercase tracking-wide">
                  {fmt === 'pdf' ? labels.exportPdf : fmt === 'txt' ? labels.exportTxt : labels.exportCopy}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="relative w-56 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={3} dataKey="value" strokeWidth={0}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${cleanSymbol}${Number(value).toLocaleString()}`} contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: 'white' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{cleanSymbol}{total.toLocaleString()}</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{labels.estTotal}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-8">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">{item.name}</span>
            </div>
            <span className="text-sm font-black text-slate-900 dark:text-white">{cleanSymbol}{item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-100 dark:border-white/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{labels.duration}</span>
          </div>
          <span className="text-sm font-black text-slate-900 dark:text-white">{days} {labels.days}</span>
        </div>
        <input type="range" min={1} max={30} value={days} onChange={(e) => handleDaysChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-emerald-500" />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-slate-400">1</span>
          <span className="text-[10px] text-slate-400">30</span>
        </div>
      </div>
    </div>
  );
};

export default CostChart;
