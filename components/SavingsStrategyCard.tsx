import React from 'react';
import { Lightbulb, Utensils, ShoppingBag, Bed, Bus, Ticket, CircleDollarSign } from 'lucide-react';
import { TravelLogistics } from '../types';

interface Props {
  data: TravelLogistics['savingsStrategy'];
  currencySymbol: string;
  labels: {
    title: string;
    weeklySavings: string;
    weeklySubtitle: string;
  };
}

const SavingsStrategyCard: React.FC<Props> = ({ data, currencySymbol, labels }) => {
  
  const cleanSymbol = currencySymbol ? currencySymbol.replace(/['"]/g, '') : '';

  const getIcon = (category: string) => {
    switch (category) {
      case 'FOOD': return <Utensils size={18} className="text-emerald-500" />;
      case 'TRANSPORT': return <Bus size={18} className="text-emerald-500" />; 
      case 'LODGING': return <Bed size={18} className="text-emerald-500" />;
      case 'SHOPPING': return <ShoppingBag size={18} className="text-emerald-500" />;
      case 'ENTERTAINMENT': return <Ticket size={18} className="text-emerald-500" />;
      default: return <CircleDollarSign size={18} className="text-emerald-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-[32px] p-8 shadow-xl border border-slate-100 dark:border-white/5 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-100">
      <div className="flex items-center gap-4 mb-8">
         <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <Lightbulb className="text-emerald-500" size={24} />
         </div>
         <h3 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">{labels.title}</h3>
      </div>

      {/* Weekly Savings Banner */}
      <div className="bg-emerald-50/80 dark:bg-emerald-900/20 rounded-[24px] p-6 mb-8 border border-emerald-100 dark:border-emerald-500/10 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
           <div className="bg-white dark:bg-[#0f172a] rounded-2xl px-6 py-5 shadow-sm min-w-[120px] text-center border border-emerald-100/50 dark:border-emerald-500/20">
              <span className="text-3xl font-black text-emerald-500 tracking-tight block">
                {cleanSymbol}{data.weeklySavings}
              </span>
           </div>
           <div className="text-center sm:text-left">
              <h4 className="text-slate-900 dark:text-white font-bold text-lg mb-1">{labels.weeklySavings}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xs mx-auto sm:mx-0">
                {labels.weeklySubtitle}
              </p>
           </div>
        </div>
        {/* Decorative Circles */}
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-200/20 rounded-full blur-2xl"></div>
        <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-emerald-200/20 rounded-full blur-2xl"></div>
      </div>

      {/* Dynamic Strategies List */}
      <div className="space-y-4">
        {data.strategies.map((strategy, idx) => (
            <div key={idx} className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-6 border border-slate-100 dark:border-white/5 hover:border-emerald-500/20 transition-colors">
            <div className="flex items-center gap-3 mb-2">
                {getIcon(strategy.category)}
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    {strategy.title}
                </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                {strategy.description}
            </p>
            </div>
        ))}
      </div>
    </div>
  );
};

export default SavingsStrategyCard;