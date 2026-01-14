import React from 'react';
import { Droplet, CreditCard, Languages, Shirt } from 'lucide-react';

interface Props {
  data: {
    water: string;
    money: string;
    language: string;
    laundry: string;
  };
  labels: {
    water: string;
    money: string;
    languageLabel: string;
    laundry: string;
  };
}

const SurvivalLogistics: React.FC<Props> = ({ data, labels }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-6 rounded-[32px] bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 flex flex-col gap-3">
        <div className="w-10 h-10 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-2xl shadow-sm"><Droplet size={20} /></div>
        <div><h4 className="font-black text-xs text-slate-800 dark:text-white mb-1 uppercase tracking-wider">{labels.water}</h4><p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">{data.water}</p></div>
      </div>
      
      <div className="p-6 rounded-[32px] bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 flex flex-col gap-3">
        <div className="w-10 h-10 flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-2xl shadow-sm"><CreditCard size={20} /></div>
        <div><h4 className="font-black text-xs text-slate-800 dark:text-white mb-1 uppercase tracking-wider">{labels.money}</h4><p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">{data.money}</p></div>
      </div>
      
      <div className="p-6 rounded-[32px] bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 flex flex-col gap-3">
        <div className="w-10 h-10 flex items-center justify-center bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-2xl shadow-sm"><Languages size={20} /></div>
        <div><h4 className="font-black text-xs text-slate-800 dark:text-white mb-1 uppercase tracking-wider">{labels.languageLabel}</h4><p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">{data.language}</p></div>
      </div>
      
      <div className="p-6 rounded-[32px] bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 flex flex-col gap-3">
        <div className="w-10 h-10 flex items-center justify-center bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-2xl shadow-sm"><Shirt size={20} /></div>
        <div><h4 className="font-black text-xs text-slate-800 dark:text-white mb-1 uppercase tracking-wider">{labels.laundry}</h4><p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">{data.laundry}</p></div>
      </div>
    </div>
  );
};

export default SurvivalLogistics;