import React from 'react';
import { DestinationSuggestion } from '../types';
import { MapPin, Plane, Hotel, Star, Thermometer, ChevronRight } from 'lucide-react';

interface DestinationCardProps {
  suggestion: DestinationSuggestion;
  currency: string;
  budget: number;
  lang?: string;
  onSelect?: (suggestion: DestinationSuggestion) => void;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({ suggestion, currency, budget, lang = 'en', onSelect }) => {
  const remaining = budget - suggestion.totalCost;
  const isOver = remaining < 0;

  return (
    <div 
      onClick={() => onSelect?.(suggestion)}
      className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${onSelect ? 'cursor-pointer hover:border-rose-300 dark:hover:border-rose-700' : ''} group`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <MapPin size={10} /> {suggestion.country}
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{suggestion.city}</h3>
          </div>
        </div>

        {/* EST + REMAINING */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500">EST.: <span className="text-slate-800 dark:text-white">{currency}{suggestion.totalCost.toLocaleString()}</span></span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${isOver ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
            {isOver ? 'EXCEEDED' : 'REMAINING'}: {currency}{Math.abs(remaining).toLocaleString()}
          </span>
        </div>

        {/* Travel / Stay / Living */}
        <div className="flex items-center gap-4 mb-3 py-2 border-y border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs">
            <Plane size={12} className="text-blue-400" />
            <span className="text-slate-500 dark:text-slate-400">Travel:</span>
            <span className="font-bold text-slate-800 dark:text-white">{currency}{suggestion.flightCost.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Hotel size={12} className="text-purple-400" />
            <span className="text-slate-500 dark:text-slate-400">Stay:</span>
            <span className="font-bold text-slate-800 dark:text-white">{currency}{suggestion.accommodationCost.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Living:</span>
            <span className="font-bold text-slate-800 dark:text-white">{currency}{(suggestion.foodCost + suggestion.transportCost + suggestion.extrasCost).toLocaleString()}</span>
          </div>
        </div>

        {/* Citazione */}
        <div className="border-l-2 border-rose-300 dark:border-rose-700 pl-3 mb-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">{suggestion.reason}</p>
        </div>

        {/* Highlights */}
        <div className="mb-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Highlights</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestion.highlights.map((h, i) => (
              <span key={i} className="flex items-center gap-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full">
                <Star size={8} className="text-amber-400 fill-amber-400" /> {h}
              </span>
            ))}
          </div>
        </div>

        {/* Temperatura + freccia */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Thermometer size={12} /> {suggestion.weather}
          </div>
          <ChevronRight size={16} className="text-slate-300 group-hover:text-rose-500 transition-all duration-300" />
        </div>
      </div>
    </div>
  );
};
