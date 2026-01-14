import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Clock, Minus, Plus } from 'lucide-react';
import ExportTools from './ExportTools';
import { TravelLogistics } from '../types';

interface Props {
  data: {
    flights: number;
    accommodation: number;
    food: number;
    transport: number;
    extras: number;
  };
  total: number;
  localTotal: number;
  userSymbol: string;
  localSymbol: string;
  labels: string[];
  totalLabel: string;
  fullData: TravelLogistics;
  exportLabels?: {
    copy: string;
    saveTxt: string;
    savePdf: string;
    copied: string;
    generating: string;
    menuLabel: string;
  };
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const CostChart: React.FC<Props> = ({ data, userSymbol, labels = [], totalLabel, fullData, exportLabels }) => {
  const [days, setDays] = useState(7);
  
  const safeLabels = labels.length >= 5 ? labels : ['FLIGHTS', 'ACCOMMODATION', 'FOOD', 'TRANSPORT', 'EXTRAS/SIM'];
  const cleanSymbol = userSymbol ? userSymbol.replace(/['"]/g, '') : '';

  // Calculate costs based on days (Flights are fixed, others are weekly rates scaled to days)
  const calculateCost = (baseWeeklyCost: number, isFixed: boolean = false) => {
    if (isFixed) return baseWeeklyCost;
    return (baseWeeklyCost / 7) * days;
  };

  const currentData = {
    flights: calculateCost(data.flights, true),
    accommodation: calculateCost(data.accommodation),
    food: calculateCost(data.food),
    transport: calculateCost(data.transport),
    extras: calculateCost(data.extras),
  };

  const currentTotal = Object.values(currentData).reduce((a, b) => a + b, 0);

  const chartData = [
    { name: safeLabels[0], value: currentData.flights, color: COLORS[0] },
    { name: safeLabels[1], value: currentData.accommodation, color: COLORS[1] },
    { name: safeLabels[2], value: currentData.food, color: COLORS[2] },
    { name: safeLabels[3], value: currentData.transport, color: COLORS[3] },
    { name: safeLabels[4], value: currentData.extras, color: COLORS[4] },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    // Allow 0 and empty string (which defaults to 0 to prevent locked input)
    if (!isNaN(val) && val >= 0 && val <= 365) {
      setDays(val);
    } else if (e.target.value === '') {
        setDays(0);
    }
  };

  return (
    <div className="flex flex-col gap-8">
        <div className="flex flex-row items-center justify-center gap-6 py-2 px-1">
            {/* Chart Section */}
            <div className="h-40 w-40 relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="transparent"
                    isAnimationActive={false}
                    >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-1">
                    {cleanSymbol}{currentTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[8px] text-slate-500 dark:text-slate-400 font-black tracking-widest uppercase leading-none">{totalLabel}</span>
                </div>
            </div>

            {/* Details Section - Right aligned list */}
            <div className="flex flex-col gap-3 flex-1 min-w-0 max-w-[200px]">
                {chartData.map((item, i) => (
                <div key={i} className="flex items-center justify-between w-full group">
                    <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                    <div className="w-2 h-2 rounded-full shrink-0 transition-transform group-hover:scale-125" style={{ backgroundColor: item.color }}></div>
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate">{item.name}</span>
                    </div>
                    <span className="text-sm font-black text-slate-900 dark:text-white shrink-0 tabular-nums ml-2">
                    {cleanSymbol}{item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                </div>
                ))}
            </div>
        </div>

        {/* Inline Export Tools - Placed above Duration Selector */}
        {fullData && (
          <ExportTools 
              data={fullData}
              elementId="results-container"
              variant="inline"
              labels={exportLabels || {
                 copy: 'Copy',
                 saveTxt: 'Save TXT',
                 savePdf: 'Save PDF',
                 copied: 'Copied',
                 generating: 'Generating',
                 menuLabel: 'Export'
              }}
          />
        )}

        {/* Duration Selector Bar - HIDDEN IN PDF */}
        <div 
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 flex items-center justify-between gap-4 border border-slate-100 dark:border-white/5 shadow-sm"
            data-html2canvas-ignore="true"
        >
            <div className="flex items-center gap-3 text-slate-400">
                <Clock size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Duration</span>
            </div>
            
            <div className="flex-1 px-2">
                 <input 
                    type="range" 
                    min="0" 
                    max="30" 
                    value={days} 
                    onChange={(e) => setDays(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                 />
            </div>

            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-2 py-1 border border-slate-100 dark:border-white/5">
                <input 
                    type="number" 
                    min="0" 
                    max="365"
                    value={days}
                    onChange={handleInputChange}
                    className="w-12 bg-transparent text-center font-black text-slate-900 dark:text-white outline-none text-sm"
                />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-1">Days</span>
            </div>
        </div>
    </div>
  );
};

export default CostChart;