import React, { useState } from 'react';
import { Download, FileText, Copy, Check, ChevronDown } from 'lucide-react';

interface ExportToolsProps {
  onExport: (format: 'pdf' | 'txt' | 'copy') => Promise<void>;
  labels: {
    export: string;
    pdf: string;
    txt: string;
    copy: string;
  };
}

export const generateTextContent = (data: any, params: any, scaledCosts: any, symbol: string, currentDays: number, logistics: any, labels: any) => {
  const hasWarning = data?.destinationWarning?.type === 'inaccessible' || data?.destinationWarning?.type === 'advisory';
  const warningText = hasWarning ? `\n\n⚠️ ${data.destinationWarning.type.toUpperCase()} WARNING\n${data.destinationWarning.message}${data.destinationWarning.type === 'inaccessible' ? `\nNote: This report is based on ${data.destinationWarning.alternativeDestination} as an accessible gateway.` : ''}` : '';
  
  return `CLEARVOYAGE REPORT: ${params.destination}\n${'='.repeat(50)}${warningText}\n\nTRIP DETAILS\nOrigin: ${params.origin}\nDestination: ${data?.destinationWarning?.alternativeDestination || params.destination}\nPeriod: ${params.period}\nDuration: ${currentDays} days\n\nFINANCIAL ESTIMATE\nTotal: ${symbol}${Object.values(scaledCosts).reduce((a: any, b: any) => a + b, 0).toLocaleString()}\n- Flights: ${symbol}${scaledCosts.flights.toLocaleString()}\n- Stay: ${symbol}${scaledCosts.stay.toLocaleString()}\n- Food: ${symbol}${scaledCosts.food.toLocaleString()}\n- Transport: ${symbol}${scaledCosts.transport.toLocaleString()}\n- Extras: ${symbol}${scaledCosts.extras.toLocaleString()}\n\nLOGISTICS HUB\nWeather: ${logistics.weather?.tempRange}\nReliability: ${logistics.reliability?.score}/100\nWater: ${logistics.water?.potable ? labels.safeWater : labels.unsafeWater}\n\nTIME MATCH\n${logistics.timeMatch?.chosenPeriodAnalysis}\nCrowds: ${logistics.timeMatch?.crowdScore}/10\n\nSMART OPTIMIZER: ${logistics.timeMatch?.smartOptimizer?.period} (+${logistics.timeMatch?.smartOptimizer?.savingsPercent}%)\n${logistics.timeMatch?.smartOptimizer?.reason}\n\nSWEET SPOT: ${logistics.sweetSpot?.bestPeriod}\n${logistics.sweetSpot?.reason}\n\nSURVIVAL LOGISTICS\nCash: ${logistics.cashDependency?.level} — ${logistics.cashDependency?.description}\nEnglish: ${logistics.language?.englishLevel} — ${logistics.language?.description}${logistics.language?.localLanguages ? ` [${logistics.language.localLanguages.replace(/;/g, ' ·')}]` : ''}\nLaundry: ${logistics.laundry?.cost} — ${logistics.laundry?.description}\nInternet: ${logistics.internet?.quality} — ${logistics.internet?.description}\nSafety: ${logistics.safety?.level} — ${logistics.safety?.description}\nElectricity: ${logistics.electricity?.plugType} — ${logistics.electricity?.voltage}\nWater: ${logistics.water?.potable ? labels.safeWater : labels.unsafeWater} — ${logistics.water?.description}\n\nSAVINGS STRATEGY (${symbol}${logistics.savingsStrategy?.weeklySavings}/week)\n${logistics.savingsStrategy?.strategies?.map((s: any) => `• [${s.category}] ${s.title}: ${s.description}`).join('\n')}`;
};

export const ExportTools: React.FC<ExportToolsProps> = ({ onExport, labels }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleExport = async (format: 'pdf' | 'txt' | 'copy') => {
    setLoading(format);
    setIsOpen(false);
    try {
      await onExport(format);
      if (format === 'copy') {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } finally {
      setLoading(null);
    }
  };

  const options = [
    { key: 'pdf' as const, label: labels.pdf, icon: Download },
    { key: 'txt' as const, label: labels.txt, icon: FileText },
    { key: 'copy' as const, label: labels.copy, icon: copied ? Check : Copy },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl text-sm font-bold transition-all shadow-sm"
      >
        <Download size={16} />
        {labels.export}
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 min-w-[160px] animate-in fade-in zoom-in-95 duration-150">
            {options.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handleExport(key)}
                disabled={loading !== null}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <Icon size={15} className={key === 'copy' && copied ? 'text-emerald-500' : 'text-slate-400'} />
                {loading === key ? '...' : label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
