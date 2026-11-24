import React, { useState, useEffect } from 'react';
import { analyzeRoute } from '../services/geminiService';
import { ArrowLeft, Loader2, AlertCircle, MapPin, Calendar, Clock } from 'lucide-react';

interface Props {
  lang: string;
  params: {
    destination: string;
    period: string;
    duration?: number;
    isUncertain?: boolean;
  };
  onBack: () => void;
}

const LABELS: Record<string, any> = {
  en: {
    loading: 'Analyzing destination...', error: 'Analysis failed. Please go back and try again.',
    back: 'Back', destination: 'Destination', period: 'Best Period', duration: 'Suggested Duration',
    days: 'days', uncertain: 'Location uncertain — showing best match',
    estTotal: 'EST. TOTAL', flights: 'Flights', stay: 'Accommodation',
    food: 'Food', transport: 'Transport', extras: 'Extras',
    survival: 'Survival Intel', weather: 'Weather', reliability: 'Reliability',
    water: 'Water', safety: 'Safety', cash: 'Cash', language: 'Language',
    laundry: 'Laundry', internet: 'Internet', electricity: 'Electricity',
    safeWater: 'Safe to Drink', unsafeWater: 'Not Safe',
    smartOptimizer: 'Smart Optimizer', sweetSpot: 'Sweet Spot',
    savingsStrategy: 'Savings Strategy', weeklySavings: 'Est. Weekly Savings',
  },
  it: {
    loading: 'Analizzando la destinazione...', error: 'Analisi fallita. Torna indietro e riprova.',
    back: 'Indietro', destination: 'Destinazione', period: 'Periodo Migliore', duration: 'Durata Suggerita',
    days: 'giorni', uncertain: 'Posizione incerta — mostro la corrispondenza migliore',
    estTotal: 'TOT. STIMATO', flights: 'Voli', stay: 'Alloggio',
    food: 'Cibo', transport: 'Trasporti', extras: 'Extra',
    survival: 'Intel Sopravvivenza', weather: 'Meteo', reliability: 'Affidabilità',
    water: 'Acqua', safety: 'Sicurezza', cash: 'Contante', language: 'Lingua',
    laundry: 'Lavanderia', internet: 'Internet', electricity: 'Elettricità',
    safeWater: 'Potabile', unsafeWater: 'Non Potabile',
    smartOptimizer: 'Smart Optimizer', sweetSpot: 'Sweet Spot',
    savingsStrategy: 'Strategia Risparmio', weeklySavings: 'Risparmio Settimanale',
  },
};

export const VisionResultView: React.FC<Props> = ({ lang, params, onBack }) => {
  const t = LABELS[lang] || LABELS.en;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const raw = await analyzeRoute(
          'traveler location',
          params.destination,
          params.period,
          'USD',
          params.duration || 7,
          lang
        );
        const parsed = JSON.parse(raw);
        setData(parsed);
      } catch (e) {
        setError(t.error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
      <Loader2 className="animate-spin" size={40} />
      <p className="font-bold">{t.loading}</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-red-400 p-8 text-center">
      <AlertCircle size={40} />
      <p className="font-bold">{error}</p>
      <button onClick={onBack} className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold">{t.back}</button>
    </div>
  );

  if (!data) return null;

  const costs = data.costs || {};
  const logistics = data.logistics || {};
  const total = (costs.flights || 0) + (costs.stay || 0) + (costs.food || 0) + (costs.transport || 0) + (costs.extras || 0);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto">
      <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-6">

        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold transition-colors">
          <ArrowLeft size={18} /> {t.back}
        </button>

        {params.isUncertain && (
          <div className="flex items-center gap-3 p-4 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20 text-sm font-bold">
            <AlertCircle size={18} /> {t.uncertain}
          </div>
        )}

        {/* Header */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-500/10 rounded-2xl flex items-center justify-center">
              <MapPin size={20} className="text-amber-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{params.destination}</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={14} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.period}</span>
              </div>
              <p className="text-sm font-black text-slate-900 dark:text-white">{params.period}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={14} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.duration}</span>
              </div>
              <p className="text-sm font-black text-slate-900 dark:text-white">{params.duration || 7} {t.days}</p>
            </div>
          </div>
        </div>

        {/* Cost Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-xl border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">{t.estTotal}</h3>
          <div className="text-4xl font-black text-slate-900 dark:text-white mb-4">${total.toLocaleString()}</div>
          <div className="space-y-2">
            {[
              { label: t.flights, value: costs.flights },
              { label: t.stay, value: costs.stay },
              { label: t.food, value: costs.food },
              { label: t.transport, value: costs.transport },
              { label: t.extras, value: costs.extras },
            ].map(item => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{item.label}</span>
                <span className="font-black text-slate-900 dark:text-white">${item.value?.toLocaleString() || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Logistics */}
        {logistics.weather && (
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">{t.survival}</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t.weather, value: logistics.weather?.tempRange },
                { label: t.reliability, value: `${logistics.reliability?.score}/100` },
                { label: t.water, value: logistics.water?.potable ? t.safeWater : t.unsafeWater },
                { label: t.safety, value: logistics.safety?.level },
                { label: t.cash, value: logistics.cashDependency?.level },
                { label: t.language, value: logistics.language?.englishLevel },
                { label: t.laundry, value: logistics.laundry?.cost },
                { label: t.internet, value: logistics.internet?.quality },
                { label: t.electricity, value: logistics.electricity?.plugType },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{item.value || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sweet Spot */}
        {logistics.sweetSpot && (
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-xl border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">{t.sweetSpot}</span>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-2">{logistics.sweetSpot?.bestPeriod}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{logistics.sweetSpot?.reason}</p>
          </div>
        )}

        {/* Savings Strategy */}
        {logistics.savingsStrategy && (
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{t.savingsStrategy}</h3>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 mb-4 text-center">
              <p className="text-3xl font-black text-emerald-500">${logistics.savingsStrategy?.weeklySavings}</p>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">{t.weeklySavings}</p>
            </div>
            <div className="space-y-3">
              {logistics.savingsStrategy?.strategies?.map((s: any, i: number) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">{s.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
