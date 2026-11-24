import React from 'react';
import { Lightbulb, Utensils, ShoppingBag, Bed, Bus, Ticket, CircleDollarSign } from 'lucide-react';
import { TravelLogistics } from '../types';

interface Props {
  data: TravelLogistics['savingsStrategy'] & { weeklySavingsLocal?: string };
  currencySymbol: string;
  labels: {
    title: string;
    weeklySavings: string;
    weeklySubtitle: string;
  };
}

const SavingsStrategyCard: React.FC<Props> = ({ data, currencySymbol, labels }) => {
  if (!data) return null;
  const cleanSymbol = currencySymbol ? currencySymbol.replace(/['\"]/g, '') : '';

  const getIcon = (category: string) => {
    switch (category) {
      case 'FOOD': return <Utensils size={18} className="text-emerald-500" />;
      case 'TRANSPORT': return <Bus size={18} className="text-emerald-500" />;
      case 'LODGING': return <Bed size={18} className="text-emerald-500" />;
      case 'SHOPPING': return <ShoppingBag size={18} className="text-emerald-500" />;
      case 'ACTIVITIES': return <Ticket size={18} className="text-emerald-500" />;
      default: return <Lightbulb size={18} className="text-emerald-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800/40 rounded-[32px] p-8 border border-slate-100 dark:border-white/5 shadow-sm">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">{labels.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{labels.weeklySubtitle}</p>
        </div>
        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
          <CircleDollarSign size={24} />
        </div>
      </div>

      <div className="mb-8">
        <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{labels.weeklySavings}</p>
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-slate-900 dark:text-white">{cleanSymbol}{data.weeklySavings}</span>
          </div>
          {data.weeklySavingsLocal && (
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1 uppercase tracking-wider">{data.weeklySavingsLocal}</span>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        {data.strategies.map((s, idx) => (
          <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 transition-all hover:border-emerald-500/30">
            <div className="shrink-0 mt-0.5">
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                {getIcon(s.category)}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-tight mb-1">{s.title}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{s.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavingsStrategyCard;
