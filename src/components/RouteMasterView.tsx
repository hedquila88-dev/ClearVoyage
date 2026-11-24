import React, { useState, useRef } from 'react';
import { analyzeRoute } from '../services/geminiService';
import { TravelLogistics } from '../types';
import CostChart from './CostChart';
import OptimizationCards from './OptimizationCards';
import SavingsStrategyCard from './SavingsStrategyCard';
import SurvivalLogistics from './SurvivalLogistics';
import { ExportTools } from './ExportTools';
import { MapPin, Calendar, Loader2, ArrowRight, Wallet, Plane, Locate, ChevronDown } from 'lucide-react';
import { RouteMasterIcon } from './Sidebar';
import { CalendarPicker } from './CalendarPicker';

const MOCK_CITIES = [
  "London, UK", "New York, USA", "Paris, France", "Tokyo, Japan",
  "Rome, Italy", "Dubai, UAE", "Singapore", "Barcelona, Spain",
  "Los Angeles, USA", "Sydney, Australia", "Berlin, Germany",
  "Amsterdam, Netherlands", "Bangkok, Thailand", "Istanbul, Turkey",
  "Seoul, South Korea", "Hong Kong", "Milan, Italy", "Lisbon, Portugal"
];

interface RouteMasterProps { 
  lang: string; 
  onPlanTrip?: (destination: string, origin: string, period: string, currency: string, budget?: number, duration?: number, estimatedCosts?: any) => void;
}

const RM_TRANSLATIONS: Record<string, any> = {
  en: {
    title: 'Route Master', subtitle: 'Precision exploration for the pragmatic voyager.',
    from: "From", to: "To", period: "Period", currency: "Currency",
    generate: "Generate Analysis", loading: "Analyzing...",
    required: "Required", short: "Too short",
    geoError: "Geolocation not supported", geoFail: "Failed to determine city",
    geoDenied: "Location access denied", genError: "Analysis failed. Please try again.",
    placeholders: { from: "e.g. London, Tokyo", to: "e.g. Tokyo, Kyoto", period: "e.g. Next week, August" },
    report: "Analysis Report",
    costs: { flights: 'Flights', stay: 'Stay', food: 'Food', transport: 'Transport', extras: 'Extras', total: 'Est. Total' },
    optCards: { hub: 'Logistics Hub & Optimization', timeMatch: 'Time Match', chosen: 'Your Dates', crowd: 'Crowds', optimizer: 'Smart Optimizer', savings: 'Savings', sweet: 'Sweet Spot', best: 'Best Alternative', weather: 'Weather', reliability: 'Transport Reliability', water: 'Water Potability' },
    surv: { water: 'Tap Water', money: 'Cash Dependency', lang: 'English Level', laundry: 'Laundry' },
    savings: { title: 'Savings Strategy', sub: 'Potential savings', val: 'Est. Weekly Savings' },
    export: 'Export', exportPdf: 'PDF', exportTxt: 'TXT', exportCopy: 'Copy',
    safeWater: 'Safe to Drink', unsafeWater: 'Not Safe',
  },
  it: {
    title: 'Route Master', subtitle: 'Esplorazione precisa per il viaggiatore pragmatico.',
    from: "Da", to: "A", period: "Periodo", currency: "Valuta",
    generate: "Genera Analisi", loading: "Analizzando...",
    required: "Richiesto", short: "Troppo corto",
    geoError: "Geolocalizzazione non supportata", geoFail: "Impossibile determinare la città",
    geoDenied: "Accesso negato", genError: "Analisi fallita. Riprova.",
    placeholders: { from: "es. Milano, Roma", to: "es. Tokyo, Kyoto", period: "es. Prossima settimana, Agosto" },
    report: "Report Analisi",
    costs: { flights: 'Voli', stay: 'Alloggio', food: 'Cibo', transport: 'Trasporti', extras: 'Extra', total: 'Totale Stimato' },
    optCards: { hub: 'Hub Logistico & Ottimizzazione', timeMatch: 'Time Match', chosen: 'Le Tue Date', crowd: 'Folla', optimizer: 'Smart Optimizer', savings: 'Risparmio', sweet: 'Sweet Spot', best: 'Alternativa Migliore', weather: 'Meteo', reliability: 'Affidabilità Trasporti', water: 'Potabilità Acqua' },
    surv: { water: 'Acqua Rubinetto', money: 'Uso Contante', lang: 'Livello Inglese', laundry: 'Lavanderia' },
    savings: { title: 'Strategia Risparmio', sub: 'Risparmio potenziale', val: 'Risparmio Settimanale' },
    export: 'Esporta', exportPdf: 'PDF', exportTxt: 'TXT', exportCopy: 'Copia',
    safeWater: 'Potabile', unsafeWater: 'Non Potabile',
  },
};

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CHF', 'AUD', 'INR', 'SGD'];

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', CHF: 'Fr', AUD: 'A$', INR: '₹', SGD: 'S$'
};

export const RouteMasterView: React.FC<RouteMasterProps> = ({ lang, onPlanTrip }) => {
  const [inputDestination, setInputDestination] = useState('');
  const [inputDeparture, setInputDeparture] = useState('');
  const [inputPeriod, setInputPeriod] = useState('');
  const [inputCurrency, setInputCurrency] = useState('EUR');
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDays, setCurrentDays] = useState(7);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [departureSuggestions, setDepartureSuggestions] = useState<string[]>([]);
  const [showDepartureSuggestions, setShowDepartureSuggestions] = useState(false);
  const suggestionClickRef = useRef(false);
  const [fieldErrors, setFieldErrors] = useState<{ destination: string | null; departure: string | null; period: string | null }>({ destination: null, departure: null, period: null });
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const reportRef = React.useRef<HTMLDivElement>(null);

  const t = RM_TRANSLATIONS[lang] || RM_TRANSLATIONS.en;
  const symbol = CURRENCY_SYMBOLS[inputCurrency] || inputCurrency;

  const validate = (value: string) => {
    if (!value.trim()) return t.required;
    if (value.trim().length < 2) return t.short;
    return null;
  };

  const handleDestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputDestination(val);
    if (fieldErrors.destination) setFieldErrors(prev => ({ ...prev, destination: null }));
    if (val.length > 0) {
      const filtered = MOCK_CITIES.filter(c => c.toLowerCase().includes(val.toLowerCase()));
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else { setShowSuggestions(false); }
  };

  const selectSuggestion = (city: string) => { suggestionClickRef.current = true; setInputDestination(city); setShowSuggestions(false); setFieldErrors(prev => ({ ...prev, destination: null })); };

  const handleDepartureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputDeparture(val);
    if (fieldErrors.departure) setFieldErrors(prev => ({ ...prev, departure: null }));
    if (val.length > 0) {
      const filtered = MOCK_CITIES.filter(c => c.toLowerCase().includes(val.toLowerCase()));
      setDepartureSuggestions(filtered);
      setShowDepartureSuggestions(filtered.length > 0);
    } else { setShowDepartureSuggestions(false); }
  };

  const selectDepartureSuggestion = (city: string) => { suggestionClickRef.current = true; setInputDeparture(city); setShowDepartureSuggestions(false); setFieldErrors(prev => ({ ...prev, departure: null })); };

  const handleUseCurrentLocation = async () => {
    setGeoLoading(true);
    setError(null);
    const fetchIpLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (!res.ok) throw new Error('IP Service unavailable');
        const ipData = await res.json();
        if (ipData.city && ipData.country_name) {
          setInputDeparture(`${ipData.city}, ${ipData.country_name}`);
          setFieldErrors(prev => ({ ...prev, departure: null }));
        } else throw new Error('Location not found');
      } catch { setError(t.geoFail); }
      finally { setGeoLoading(false); }
    };
    if (!navigator.geolocation) { await fetchIpLocation(); return; }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const geo = await res.json();
          const city = geo.address?.city || geo.address?.town || geo.address?.village || geo.address?.county || '';
          const country = geo.address?.country || '';
          // Fix per Greater London — Nominatim restituisce borough invece di London
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const isGreaterLondon = lat >= 51.28 && lat <= 51.70 && lon >= -0.51 && lon <= 0.33;
          const displayCity = isGreaterLondon ? 'London' : city;
          if (displayCity) { setInputDeparture(`${displayCity}, ${country}`); setFieldErrors(prev => ({ ...prev, departure: null })); }
          else await fetchIpLocation();
        } catch { await fetchIpLocation(); }
        finally { setGeoLoading(false); }
      },
      async () => { await fetchIpLocation(); },
      { timeout: 5000 }
    );
  };

  const handleCalculate = async () => {
    const destError = validate(inputDestination);
    const depError = validate(inputDeparture);
    const periodError = validate(inputPeriod);
    setFieldErrors({ destination: destError, departure: depError, period: periodError });
    if (destError || depError || periodError) return;
    setLoading(true); setError(null); setData(null);
    try {
      const raw = await analyzeRoute(inputDeparture, inputDestination, inputPeriod, inputCurrency, currentDays, lang);
      const parsed = JSON.parse(raw);
      setData(parsed);
      if (onPlanTrip) {
        onPlanTrip(inputDestination, inputDeparture, inputPeriod, inputCurrency, 0, currentDays);
      }
    } catch (err: any) { 
      console.error("Analysis Error:", err);
      setError(err.message || t.genError); 
    }
    finally { setLoading(false); }
  };

  const handleExport = async (format: 'pdf' | 'txt' | 'copy') => {
    if (!data) return;
    const costs = data.costs || {};
    const logistics = data.logistics || {};
    const total = (costs.flights || 0) + (costs.stay || 0) + (costs.food || 0) + (costs.transport || 0) + (costs.extras || 0);
    const textContent = `CLEARVOYAGE REPORT: ${inputDestination}\n${'='.repeat(50)}\n\nTarget Period: ${logistics.timeMatch?.chosenPeriodAnalysis || inputPeriod}\nTotal Estimate: ${symbol}${total.toLocaleString()}\n- Flights: ${symbol}${costs.flights || 0}\n- Accommodation: ${symbol}${costs.stay || 0}\n- Food: ${symbol}${costs.food || 0}\n- Transport: ${symbol}${costs.transport || 0}\n- Extras: ${symbol}${costs.extras || 0}\n\nElectricity: ${logistics.electricity?.plugType} - ${logistics.electricity?.voltage}\nWater: ${logistics.water?.potable ? t.safeWater : t.unsafeWater} - ${logistics.water?.description}\nSafety: ${logistics.safety?.level} - ${logistics.safety?.description}\nCash: ${logistics.cashDependency?.level} - ${logistics.cashDependency?.description}\nLanguage: ${logistics.language?.englishLevel} - ${logistics.language?.description}\nInternet: ${logistics.internet?.quality} - ${logistics.internet?.description}\nLaundry: ${logistics.laundry?.cost} - ${logistics.laundry?.description}\n\nSweet Spot: ${logistics.sweetSpot?.bestPeriod} (${logistics.sweetSpot?.reason})\nSavings: +${logistics.timeMatch?.smartOptimizer?.savingsPercent}% in ${logistics.timeMatch?.smartOptimizer?.period}\n\nSAVINGS STRATEGY (${symbol}${logistics.savingsStrategy?.weeklySavings}/week)\n${logistics.savingsStrategy?.strategies?.map((s: any) => `• [${s.category}] ${s.title}: ${s.description}`).join('\n')}`;

    if (format === 'txt') {
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `ClearVoyage_${inputDestination.replace(/[^a-z0-9]/gi, '_')}.txt`;
      a.click(); URL.revokeObjectURL(url);
    } else if (format === 'copy') {
      await navigator.clipboard.writeText(textContent);
    } else if (format === 'pdf') {
      const element = reportRef.current;
      if (!element) return;
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#0f172a' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ClearVoyage_${inputDestination.replace(/[^a-z0-9]/gi, '_')}.pdf`);
    }
  };

  const mappedLogistics = data ? {
    destination: inputDestination, period: inputPeriod,
    userCurrency: { code: inputCurrency, symbol },
    localCurrency: { code: inputCurrency, symbol },
    costs: { flights: data.costs?.flights || 0, accommodation: data.costs?.stay || 0, food: data.costs?.food || 0, transport: data.costs?.transport || 0, extras: data.costs?.extras || 0 },
    survival: {
      electricity: { status: data.logistics?.electricity?.plugType || '', details: `${data.logistics?.electricity?.voltage}, ${data.logistics?.electricity?.frequency}` },
      tapWater: { status: data.logistics?.water?.potable ? t.safeWater : t.unsafeWater, details: data.logistics?.water?.description || '' },
      safety: { status: data.logistics?.safety?.level || '', details: data.logistics?.safety?.description || '' },
      cashDependency: { status: data.logistics?.cashDependency?.level || '', details: data.logistics?.cashDependency?.description || '' },
      englishLevel: { status: data.logistics?.language?.englishLevel || '', details: data.logistics?.language?.description || '' },
      laundry: { cost: data.logistics?.laundry?.cost || '', details: data.logistics?.laundry?.description || '' },
      internet: { status: data.logistics?.internet?.quality || '', details: data.logistics?.internet?.description || '' },
    },
    timeMatch: { crowdScore: data.logistics?.timeMatch?.crowdScore || 5, chosenPeriodAnalysis: data.logistics?.timeMatch?.chosenPeriodAnalysis || '', smartOptimizer: { period: data.logistics?.timeMatch?.smartOptimizer?.period || '', reason: data.logistics?.timeMatch?.smartOptimizer?.reason || '', savingsPercent: data.logistics?.timeMatch?.smartOptimizer?.savingsPercent || 0 } },
    sweetSpot: { bestPeriod: data.logistics?.sweetSpot?.bestPeriod || '', reason: data.logistics?.sweetSpot?.reason || '' },
    weather: { tempRange: data.logistics?.weather?.tempRange || '', condition: data.logistics?.weather?.description || '' },
    reliability: { score: data.logistics?.reliability?.score || 0 },
    savingsStrategy: { weeklySavings: data.logistics?.savingsStrategy?.weeklySavings || 0, strategies: data.logistics?.savingsStrategy?.strategies || [] },
  } : null;

  const inputClass = (hasError: boolean) => `w-full h-16 pl-12 pr-6 rounded-2xl border-2 transition-all duration-300 outline-none font-bold shadow-sm placeholder:text-slate-300 dark:placeholder:text-slate-600 ${hasError ? 'border-red-500 bg-red-50 dark:bg-red-900/10 text-red-900 dark:text-red-100' : 'bg-slate-50 dark:bg-slate-950/50 border-transparent hover:bg-slate-100 dark:hover:bg-slate-900 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-white'}`;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans overflow-y-auto relative">
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center px-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40 shrink-0">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-3">
          <RouteMasterIcon className="w-6 h-6" /> Route Master
        </h2>
      </header>

      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-950/20 pointer-events-none" />

      <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-12 relative space-y-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 dark:shadow-black/40 border border-slate-100 dark:border-slate-800">
          <div className="flex flex-col gap-4">
            <div className="group relative">
              <label className={`text-[10px] font-black uppercase tracking-widest ml-4 mb-2 block transition-colors ${fieldErrors.departure ? 'text-red-500' : 'text-slate-400 group-focus-within:text-emerald-500'}`}>{t.from}</label>
              <div className="relative">
                <Plane className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 ${fieldErrors.departure ? 'text-red-500' : 'text-slate-400 group-focus-within:text-emerald-500'}`} size={20} />
                <input type="text" value={inputDeparture} onChange={handleDepartureChange}
                  onBlur={() => setTimeout(() => !suggestionClickRef.current && setShowDepartureSuggestions(false), 200)}
                  placeholder={t.placeholders.from} className={inputClass(!!fieldErrors.departure)} />
                <button onClick={handleUseCurrentLocation} disabled={geoLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-400 hover:text-emerald-500 hover:bg-white dark:hover:bg-slate-800 transition-all disabled:opacity-50 z-30">
                  {geoLoading ? <Loader2 size={18} className="animate-spin" /> : <Locate size={18} />}
                </button>
                {showDepartureSuggestions && departureSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden max-h-60 overflow-y-auto">
                    {departureSuggestions.map((city, idx) => (
                      <div key={idx} onMouseDown={() => selectDepartureSuggestion(city)} className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-sm font-bold text-slate-700 dark:text-white transition-colors border-b border-slate-50 dark:border-slate-700 last:border-0">{city}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="group relative">
              <label className={`text-[10px] font-black uppercase tracking-widest ml-4 mb-2 block transition-colors ${fieldErrors.destination ? 'text-red-500' : 'text-slate-400 group-focus-within:text-emerald-500'}`}>{t.to}</label>
              <div className="relative">
                <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 ${fieldErrors.destination ? 'text-red-500' : 'text-slate-400 group-focus-within:text-emerald-500'}`} size={20} />
                <input type="text" value={inputDestination} onChange={handleDestChange}
                  onBlur={() => setTimeout(() => !suggestionClickRef.current && setShowSuggestions(false), 200)}
                  placeholder={t.placeholders.to} className={inputClass(!!fieldErrors.destination)} />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden max-h-60 overflow-y-auto">
                    {suggestions.map((city, idx) => (
                      <div key={idx} onMouseDown={() => selectSuggestion(city)} className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-sm font-bold text-slate-700 dark:text-white transition-colors border-b border-slate-50 dark:border-slate-700 last:border-0">{city}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group relative">
                <label className={`text-[10px] font-black uppercase tracking-widest ml-4 mb-2 block transition-colors ${fieldErrors.period ? 'text-red-500' : 'text-slate-400 group-focus-within:text-emerald-500'}`}>{t.period}</label>
                <div className="relative">
                  <Calendar 
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-20 cursor-pointer ${fieldErrors.period ? 'text-red-500' : 'text-slate-400 group-focus-within:text-emerald-500 hover:text-emerald-400'}`} 
                    size={20} 
                    onClick={() => setShowCalendar(prev => !prev)}
                  />
                  <input type="text" value={inputPeriod} onChange={(e) => setInputPeriod(e.target.value)}
                    placeholder={t.placeholders.period}
                    className={inputClass(!!fieldErrors.period)} />
                  {showCalendar && (
                    <CalendarPicker selectedDate={inputPeriod}
                      onSelect={(date) => { setInputPeriod(date); setShowCalendar(false); setFieldErrors(prev => ({ ...prev, period: null })); }}
                      onClose={() => setShowCalendar(false)} language={lang} />
                  )}
                </div>
              </div>
              <div className="group relative">
                <label className="text-[10px] font-black uppercase tracking-widest ml-4 mb-2 block text-slate-400 group-focus-within:text-emerald-500">{t.currency}</label>
                <div className="relative">
                  <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-slate-400 group-focus-within:text-emerald-500" size={20} />
                  <select value={inputCurrency} onChange={(e) => setInputCurrency(e.target.value)}
                    className="w-full h-16 pl-12 pr-8 appearance-none bg-slate-50 dark:bg-slate-950/50 border-2 border-transparent hover:bg-slate-100 dark:hover:bg-slate-900 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none font-bold text-slate-800 dark:text-white transition-all duration-300 shadow-sm">
                    {CURRENCIES.map(c => <option key={c} value={c}>{c} ({CURRENCY_SYMBOLS[c] || c})</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>
          </div>

          <button onClick={handleCalculate} disabled={loading || !inputDestination || !inputPeriod || !inputDeparture}
            className="w-full h-20 mt-6 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-white rounded-2xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 disabled:pointer-events-none group">
            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <>{t.generate} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
          </button>
        </div>

        {error && <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl text-center font-bold text-sm border border-red-500/20">{error}</div>}

        {data && mappedLogistics && (
          <div ref={reportRef} className="space-y-6 pb-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.report}</span>
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
              </div>
              <div className="ml-4">
                <ExportTools onExport={handleExport} labels={{ export: t.export, pdf: t.exportPdf, txt: t.exportTxt, copy: t.exportCopy }} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CostChart
                costs={{ flights: data.costs?.flights || 0, accommodation: data.costs?.stay || 0, food: data.costs?.food || 0, transport: data.costs?.transport || 0, extras: data.costs?.extras || 0 }}
                currency={symbol} initialDays={currentDays} onDurationChange={setCurrentDays}
                labels={{ estTotal: t.costs.total, flights: t.costs.flights, stay: t.costs.stay, food: t.costs.food, transport: t.costs.transport, extras: t.costs.extras, duration: 'Duration', days: 'Days', exportTitle: t.export, exportPdf: t.exportPdf, exportTxt: t.exportTxt, exportCopy: t.exportCopy }}
              />
              <div className="space-y-6">
                <OptimizationCards data={mappedLogistics}
                  labels={{ hubTitle: t.optCards.hub, timeMatchTitle: t.optCards.timeMatch, chosenPeriodTitle: t.optCards.chosen, crowdingLabel: t.optCards.crowd, smartOptimizerTitle: t.optCards.optimizer, savingsLabel: t.optCards.savings, sweetSpotTitle: t.optCards.sweet, bestPeriodLabel: t.optCards.best, weather: t.optCards.weather, reliability: t.optCards.reliability, drinkingWater: t.optCards.water, safeWaterStatus: mappedLogistics.survival.tapWater.status }}
                />
                {mappedLogistics.savingsStrategy && (
                  <SavingsStrategyCard data={mappedLogistics.savingsStrategy} currencySymbol={symbol}
                    labels={{ title: t.savings.title, weeklySubtitle: t.savings.sub, weeklySavings: t.savings.val }}
                  />
                )}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">{t.surv.water} / {t.surv.money}</h3>
              <SurvivalLogistics
                data={{ water: mappedLogistics.survival.tapWater.status + ' — ' + mappedLogistics.survival.tapWater.details, money: mappedLogistics.survival.cashDependency.status + ' — ' + mappedLogistics.survival.cashDependency.details, language: mappedLogistics.survival.englishLevel.status + ' — ' + mappedLogistics.survival.englishLevel.details, laundry: mappedLogistics.survival.laundry.cost + ' — ' + mappedLogistics.survival.laundry.details }}
                labels={{ water: t.surv.water, money: t.surv.money, languageLabel: t.surv.lang, laundry: t.surv.laundry }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
