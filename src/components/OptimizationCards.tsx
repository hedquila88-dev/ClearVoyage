import React from 'react';
import { Calendar, Zap, Sun, TrendingUp, Droplets } from 'lucide-react';
import { TravelLogistics } from '../types';

interface Props {
  data: TravelLogistics;
  labels: {
    timeMatchTitle: string;
    chosenPeriodTitle: string;
    crowdingLabel: string;
    smartOptimizerTitle: string;
    savingsLabel: string;
    sweetSpotTitle: string;
    bestPeriodLabel: string;
    weather: string;
    reliability: string;
    drinkingWater: string;
    hubTitle: string;
    safeWaterStatus: string;
  };
}

const OptimizationCards: React.FC<Props> = ({ data, labels }) => {
  const { timeMatch, sweetSpot, weather, reliability } = data;

  return (
    <div className="space-y-6">
      {/* INTEGRATED LOGISTICS & OPTIMIZATION HUB */}
      <div className="bg-[#0f172a] rounded-[32px] p-8 shadow-2xl border border-white/5">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Zap className="text-emerald-500" size={24} />
          </div>
          <h3 className="text-white text-xl font-bold tracking-tight">{labels.hubTitle}</h3>
        </div>

        {/* SUMMARY STATS GRID - MERGED PART */}
        <div className="grid grid-cols-3 gap-3 mb-8">
           <div className="p-4 bg-slate-800/40 rounded-2xl border border-white/5 text-center">
              <Sun size={16} className="text-amber-500 mx-auto mb-2" />
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{labels.weather}</p>
              <p className="text-[11px] font-black text-white">{weather.tempRange}</p>
           </div>
           <div className="p-4 bg-slate-800/40 rounded-2xl border border-white/5 text-center">
              <TrendingUp size={16} className="text-blue-400 mx-auto mb-2" />
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{labels.reliability}</p>
              <p className="text-[11px] font-black text-white">
                {Math.round(reliability.score <= 1 ? reliability.score * 100 : reliability.score)}/100
              </p>
           </div>
           <div className="p-4 bg-slate-800/40 rounded-2xl border border-white/5 text-center">
              <Droplets size={16} className="text-cyan-400 mx-auto mb-2" />
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{labels.drinkingWater}</p>
              <p className="text-[11px] font-black text-white">{labels.safeWaterStatus}</p>
           </div>
        </div>

        <div className="mb-4">
          <h4 className="text-white text-sm font-black mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-amber-500" />
            {labels.timeMatchTitle}
          </h4>
        </div>

        {/* CHOSEN PERIOD ANALYSIS */}
        <div className="bg-slate-700/40 rounded-3xl p-6 mb-6 border border-white/5">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{labels.chosenPeriodTitle}</span>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              {labels.crowdingLabel}: {timeMatch.crowdScore}/10
            </span>
          </div>
          <p className="text-sm text-slate-100 font-medium leading-relaxed opacity-90">
            {timeMatch.chosenPeriodAnalysis}
          </p>
        </div>

        {/* SMART OPTIMIZER WINDOW */}
        <div className="bg-[#1e293b]/50 rounded-3xl p-6 mb-6 border border-emerald-500/10 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-emerald-400" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
              {labels.smartOptimizerTitle}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="max-w-[70%]">
              <h4 className="text-white text-3xl font-black mb-2">{timeMatch.smartOptimizer.period}</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                {timeMatch.smartOptimizer.reason}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{labels.savingsLabel}</p>
              <p className="text-3xl font-black text-emerald-400">+{timeMatch.smartOptimizer.savingsPercent}%</p>
            </div>
          </div>
        </div>

        {/* SWEET SPOT / BEST ALTERNATIVE (Moved Inside) */}
        <div className="bg-[#1e293b]/50 rounded-3xl p-6 border border-white/5">
          <div className="flex items-center gap-2 mb-4">
             <Calendar size={16} className="text-emerald-400" />
             <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
               {labels.sweetSpotTitle}
             </span>
          </div>
          
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
            {labels.bestPeriodLabel}
          </span>
          <h4 className="text-white text-xl font-black mb-2">{sweetSpot.bestPeriod}</h4>
          <p className="text-sm text-slate-300 font-medium leading-relaxed opacity-90">
            {sweetSpot.reason}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OptimizationCards;