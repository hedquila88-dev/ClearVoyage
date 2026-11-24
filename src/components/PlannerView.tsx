import React, { useState, useRef } from 'react';
import { Calendar, ArrowRight, Plane, Loader2, Locate, Clock, MapPin, Sparkles, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { findDestinations } from '../services/geminiService';
import { DestinationSuggestion } from '../types';
import { DestinationCard } from './PlannerWidgets';
import { CalendarPicker } from './CalendarPicker';
import { BudgetMatchIcon } from './Sidebar';

const MOCK_CITIES = [
  "London, UK", "New York, USA", "Paris, France", "Tokyo, Japan",
  "Rome, Italy", "Dubai, UAE", "Singapore", "Barcelona, Spain",
  "Los Angeles, USA", "Sydney, Australia", "Berlin, Germany",
  "Amsterdam, Netherlands", "Bangkok, Thailand", "Istanbul, Turkey",
  "Seoul, South Korea", "Hong Kong", "Milan, Italy", "Lisbon, Portugal"
];

const TRANSLATIONS: Record<string, any> = {
  en: {
    subtitle: "Reverse Discovery Engine",
    budget: "Total Budget", from: "Starting From", days: "Duration (Days)", when: "When?",
    find: "Find Adventures", loading: "Scouting locations...",
    required: "Please fill all fields", geoError: "Geolocation not supported",
    geoFail: "Failed to locate", geoDenied: "Location denied", genError: "Failed to find destinations",
    resultsTitle: "We found these gems for you",
    showMore: "Show More", noMore: "No more matches",
    searchMode: "Search Mode",
    strict: "Strict", flexible: "Flexible", inspirational: "Inspirational",
    strictDesc: "Up to budget", flexibleDesc: "Around budget", inspirationalDesc: "Open budget",
    placeholders: { from: "e.g. London", budget: "e.g. 1000", days: "e.g. 7", when: "e.g. Next Month, Summer" }
  },
  it: {
    subtitle: "Motore di Scoperta Inverso",
    budget: "Budget Totale", from: "Partenza Da", days: "Durata (Giorni)", when: "Quando?",
    find: "Trova Avventure", loading: "Cercando destinazioni...",
    required: "Compila tutti i campi", geoError: "Geolocalizzazione non supportata",
    geoFail: "Impossibile localizzare", geoDenied: "Posizione negata", genError: "Impossibile trovare destinazioni",
    resultsTitle: "Abbiamo trovato queste gemme per te",
    showMore: "Mostra Altri", noMore: "Nessun altro risultato",
    searchMode: "Modalità Ricerca",
    strict: "Preciso", flexible: "Flessibile", inspirational: "Ispirazionale",
    strictDesc: "Fino al budget", flexibleDesc: "Intorno al budget", inspirationalDesc: "Budget aperto",
    placeholders: { from: "es. Milano", budget: "es. 1000", days: "es. 7", when: "es. Estate, Natale" }
  },
  fr: {
    subtitle: "Moteur de Découverte Inversé",
    budget: "Budget Total", from: "Au Départ De", days: "Durée (Jours)", when: "Quand ?",
    find: "Trouver des Aventures", loading: "Recherche en cours...",
    required: "Remplissez tous les champs", geoError: "Non supporté",
    geoFail: "Échec localisation", geoDenied: "Accès refusé", genError: "Erreur de recherche",
    resultsTitle: "Voici ce que nous avons trouvé",
    showMore: "Voir Plus", noMore: "Plus de résultats",
    searchMode: "Mode Recherche",
    strict: "Strict", flexible: "Flexible", inspirational: "Inspirationnel",
    strictDesc: "Dans le budget", flexibleDesc: "Autour du budget", inspirationalDesc: "Budget ouvert",
    placeholders: { from: "ex. Paris", budget: "ex. 1000", days: "ex. 7", when: "ex. Été, Le mois prochain" }
  },
  es: {
    subtitle: "Motor de Descubrimiento Inverso",
    budget: "Presupuesto Total", from: "Saliendo De", days: "Duración (Días)", when: "¿Cuándo?",
    find: "Buscar Aventuras", loading: "Buscando...",
    required: "Completa todos los campos", geoError: "No soportado",
    geoFail: "Fallo ubicación", geoDenied: "Acceso denegado", genError: "Error de búsqueda",
    resultsTitle: "Encontramos estas joyas",
    showMore: "Mostrar Más", noMore: "Sin más resultados",
    searchMode: "Modo Búsqueda",
    strict: "Estricto", flexible: "Flexible", inspirational: "Inspiracional",
    strictDesc: "Hasta el presupuesto", flexibleDesc: "Cerca del presupuesto", inspirationalDesc: "Presupuesto abierto",
    placeholders: { from: "ej. Madrid", budget: "ej. 1000", days: "ej. 7", when: "ej. Verano" }
  },
  zh: {
    subtitle: "反向探索引擎",
    budget: "总预算", from: "出发地", days: "时长 (天)", when: "何时出发？",
    find: "寻找冒险", loading: "正在搜寻...",
    required: "请填写所有字段", geoError: "不支持地理定位",
    geoFail: "定位失败", geoDenied: "定位被拒绝", genError: "无法找到目的地",
    resultsTitle: "为你发现的宝藏目的地",
    showMore: "显示更多", noMore: "没有更多结果",
    searchMode: "搜索模式",
    strict: "精确", flexible: "灵活", inspirational: "启发",
    strictDesc: "不超预算", flexibleDesc: "约等于预算", inspirationalDesc: "开放预算",
    placeholders: { from: "例如：北京", budget: "例如：5000", days: "例如：7", when: "例如：夏天，下个月" }
  },
  ja: {
    subtitle: "逆引き探索エンジン",
    budget: "总予算", from: "出発地", days: "期間 (日)", when: "時期",
    find: "冒険を探す", loading: "場所を探しています...",
    required: "すべての項目を入力してください", geoError: "位置情報はサポートされていません",
    geoFail: "特定できませんでした", geoDenied: "位置情報が拒否されました", genError: "目的地が見つかりませんでした",
    resultsTitle: "あなたにおすすめの場所",
    showMore: "もっと見る", noMore: "これ以上の結果はありません",
    searchMode: "検索モード",
    strict: "厳密", flexible: "柔軟", inspirational: "インスピレーション",
    strictDesc: "予算以内", flexibleDesc: "予算前後", inspirationalDesc: "オープン予算",
    placeholders: { from: "例: 東京", budget: "例: 100000", days: "例: 7", when: "例: 夏、来月" }
  }
};

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CHF', 'AUD', 'INR', 'SGD'];

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', CHF: 'Fr', AUD: 'A$', INR: '₹', SGD: 'S$'
};

const ITEMS_PER_PAGE = 5;

interface PlannerViewProps {
  lang: string;
  onPlanTrip?: (destination: string, origin: string, period: string, currency: string, budget?: number, duration?: number, estimatedCosts?: any, fromBudget?: boolean) => void;
  onSaveResults?: (results: any, formValues: any) => void;
  savedResults?: any;
  savedFormValues?: { budget: string; currency: string; duration: string; origin: string; period: string; mode: 'strict' | 'flexible' | 'inspirational'; };
}

export const PlannerView: React.FC<PlannerViewProps> = ({ lang, onPlanTrip, onSaveResults, savedResults, savedFormValues }) => {
  const [budget, setBudget] = useState(savedFormValues?.budget || '');
  const [origin, setOrigin] = useState(savedFormValues?.origin || '');
  const [duration, setDuration] = useState(savedFormValues?.duration || '7');
  const [period, setPeriod] = useState(savedFormValues?.period || '');
  const [currency, setCurrency] = useState(savedFormValues?.currency || 'EUR');
  const [mode, setMode] = useState<'strict' | 'flexible' | 'inspirational'>(savedFormValues?.mode || 'strict');
  const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const suggestionClickRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [results, setResults] = useState<DestinationSuggestion[]>(savedResults || []);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [searched, setSearched] = useState(!!savedResults);
  const [error, setError] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  const handleOriginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setOrigin(val);
    if (val.length > 0) {
      const filtered = MOCK_CITIES.filter(c => c.toLowerCase().includes(val.toLowerCase()));
      setOriginSuggestions(filtered);
      setShowOriginSuggestions(filtered.length > 0);
    } else { setShowOriginSuggestions(false); }
  };

  const selectOrigin = (city: string) => {
    suggestionClickRef.current = true;
    setOrigin(city);
    setShowOriginSuggestions(false);
  };

  const handleUseCurrentLocation = async () => {
    setGeoLoading(true);
    setError(null);
    const fetchIpLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (!res.ok) throw new Error('IP Service unavailable');
        const data = await res.json();
        if (data.city && data.country_name) setOrigin(`${data.city}, ${data.country_name}`);
        else throw new Error('Location not found');
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
          const city = geo.address?.city || geo.address?.town || geo.address?.village || '';
          const country = geo.address?.country || '';

          const isGreaterLondon = latitude >= 51.28 && latitude <= 51.70 && longitude >= -0.51 && longitude <= 0.33;
          const displayCity = isGreaterLondon ? 'London' : city;

          if (displayCity) setOrigin(`${displayCity}, ${country}`);
          else await fetchIpLocation();
        } catch { await fetchIpLocation(); }
        finally { setGeoLoading(false); }
      },
      async () => { await fetchIpLocation(); },
      { timeout: 5000 }
    );
  };

  const handleDiscover = async () => {
    if (!budget || !origin || !duration || !period) { setError(t.required); return; }
    setLoading(true); setError(null); setResults([]); setVisibleCount(ITEMS_PER_PAGE);
    try {
      const raw = await findDestinations(origin, parseInt(budget), currency, period, parseInt(duration), lang, mode);
      let parsed: DestinationSuggestion[] = [];
      try {
        parsed = JSON.parse(raw);
      } catch {
        setError(t.genError);
        return;
      }
      if (!Array.isArray(parsed) || parsed.length === 0) {
        setError(t.genError);
        return;
      }
      setResults(parsed);
      setSearched(true);
      onSaveResults?.(parsed, { budget, currency, duration, origin, period, mode });
    } catch (err: any) {
      console.error('FIND DESTINATIONS FAILED:', err);
      setError(t.genError);
    } finally {
      setLoading(false);
    }
  };

  const modes = [
    { key: 'strict' as const, label: t.strict, desc: t.strictDesc },
    { key: 'flexible' as const, label: t.flexible, desc: t.flexibleDesc },
    { key: 'inspirational' as const, label: t.inspirational, desc: t.inspirationalDesc },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans">
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40 shrink-0">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-3">
          <BudgetMatchIcon className="w-6 h-6" /> Budget Match
        </h2>
      </header>

      <div className="flex-1 overflow-y-auto relative w-full">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-rose-50/50 to-transparent dark:from-rose-950/20 pointer-events-none" />
        <div className="w-full max-w-2xl space-y-8 relative pt-8 md:pt-12 pb-24 md:pb-20 mx-auto px-4 md:px-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 dark:shadow-black/40 border border-slate-100 dark:border-slate-800">
            <div className="flex flex-col gap-4 mb-4">

              {/* Budget + Valuta */}
              <div className="group relative">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest ml-4 mb-2 block text-slate-400 group-focus-within:text-rose-500">{t.budget}</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1 cursor-pointer">
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full">
                      {CURRENCIES.map(c => <option key={c} value={c}>{c} ({CURRENCY_SYMBOLS[c] || c})</option>)}
                    </select>
                    <span className="text-xl font-black text-slate-400 group-hover:text-rose-500 transition-colors pointer-events-none">{symbol}</span>
                    <ChevronDown size={12} className="text-slate-300 pointer-events-none" />
                  </div>
                  <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)}
                    className="w-full h-16 pl-14 pr-6 bg-slate-50 dark:bg-slate-950/50 border-2 border-transparent hover:bg-slate-100 dark:hover:bg-slate-900 focus:border-rose-400 focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none font-black text-2xl text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-700 transition-all"
                    placeholder={t.placeholders.budget} />
                </div>
              </div>

              {/* Duration */}
              <div className="group relative">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest ml-4 mb-2 block text-slate-400 group-focus-within:text-rose-500">{t.days}</label>
                <div className="relative flex items-center">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 z-10" size={20} />
                  <input type="text" inputMode="numeric" pattern="[0-9]*" value={duration} onChange={(e) => { const val = e.target.value.replace(/[^0-9]/g, ''); setDuration(val || '1'); }}
                    className="w-full h-16 pl-12 pr-24 bg-slate-50 dark:bg-slate-950/50 border-2 border-transparent hover:bg-slate-100 dark:hover:bg-slate-900 focus:border-rose-400 focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none font-bold text-xl text-slate-800 dark:text-white transition-all"
                    placeholder="7" />
                  <div className="absolute right-3 flex gap-2">
                    <button type="button" onClick={() => setDuration(d => String(Math.max(1, Number(d) - 1)))}
                      className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-slate-600 dark:text-white font-black text-lg flex items-center justify-center transition-all">−</button>
                    <button type="button" onClick={() => setDuration(d => String(Number(d) + 1))}
                      className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-slate-600 dark:text-white font-black text-lg flex items-center justify-center transition-all">+</button>
                  </div>
                </div>
              </div>

              {/* Starting From */}
              <div className="group relative">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest ml-4 mb-2 block text-slate-400 group-focus-within:text-rose-500">{t.from}</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 z-10" size={20} />
                  <input type="text" value={origin} onChange={handleOriginChange}
                    onBlur={() => setTimeout(() => !suggestionClickRef.current && setShowOriginSuggestions(false), 200)}
                    className="w-full h-16 pl-12 pr-14 bg-slate-50 dark:bg-slate-950/50 border-2 border-transparent hover:bg-slate-100 dark:hover:bg-slate-900 focus:border-rose-400 focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none font-bold text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-700 transition-all truncate"
                    placeholder={t.placeholders.from} />
                  <button onClick={handleUseCurrentLocation} disabled={geoLoading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-800 transition-all disabled:opacity-50">
                    {geoLoading ? <Loader2 size={18} className="animate-spin" /> : <Locate size={18} />}
                  </button>
                  {showOriginSuggestions && originSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden max-h-60 overflow-y-auto">
                      {originSuggestions.map((city, idx) => (
                        <div key={idx} onMouseDown={() => selectOrigin(city)}
                          className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-sm font-bold text-slate-700 dark:text-white transition-colors border-b border-slate-50 dark:border-slate-700 last:border-0 flex items-center gap-3">
                          <MapPin size={14} className="text-slate-400" />{city}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* When */}
              <div className="group relative">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest ml-4 mb-2 block text-slate-400 group-focus-within:text-rose-500">{t.when}</label>
                <div className="relative">
                  <Calendar 
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 z-20 cursor-pointer hover:text-rose-400 transition-colors" 
                    size={20} 
                    onClick={() => setShowCalendar(!showCalendar)}
                  />
                  <input type="text" value={period} onChange={(e) => setPeriod(e.target.value)}
                    className="w-full h-16 pl-12 pr-6 bg-slate-50 dark:bg-slate-950/50 border-2 border-transparent hover:bg-slate-100 dark:hover:bg-slate-900 focus:border-rose-400 focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none font-bold text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-700 transition-all"
                    placeholder={t.placeholders.when} />
                  {showCalendar && (
                    <CalendarPicker 
                      selectedDate={period} 
                      onSelect={(date) => { setPeriod(date); setShowCalendar(false); }} 
                      onClose={() => setShowCalendar(false)} 
                      language={lang} 
                    />
                  )}
                </div>
              </div>

            </div>

            <div className="mb-4">
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <SlidersHorizontal size={12} /> {t.searchMode}
              </p>
              <div className="grid grid-cols-3 gap-1 md:gap-2">
                {modes.map(m => (
                  <button key={m.key} onClick={() => setMode(m.key)}
                    className={`py-2 md:py-3 px-1 md:px-2 rounded-2xl text-[9px] md:text-xs font-black transition-all border-2 flex flex-col items-center gap-0.5 md:gap-1 ${
                      mode === m.key
                        ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-rose-300'
                    }`}>
                    <span className="uppercase tracking-wider truncate w-full text-center">{m.label}</span>
                    <span className={`text-[8px] md:text-[10px] font-medium truncate w-full text-center ${mode === m.key ? 'text-rose-100' : 'text-slate-400'}`}>{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleDiscover} disabled={loading}
              className="w-full h-20 mt-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 active:scale-[0.99] text-white rounded-2xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-rose-500/20 disabled:opacity-50 disabled:pointer-events-none group">
              {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <>{t.find} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </div>

          {error && <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl text-center font-bold text-sm border border-red-500/20">{error}</div>}

          {results.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 my-8">
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.resultsTitle}</span>
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
              </div>
              <div className="grid grid-cols-1 gap-6 pb-8">
                {results.slice(0, visibleCount).map((suggestion, idx) => (
                  <DestinationCard 
                    key={idx} 
                    suggestion={suggestion} 
                    currency={symbol} 
                    budget={Number(budget)} 
                    lang={lang}
                    onSelect={() => onPlanTrip?.(
                      `${suggestion.city}, ${suggestion.country}`,
                      origin,
                      period,
                      currency,
                      suggestion.totalCost,
                      parseInt(duration),
                      {
                        flights: suggestion.flightCost,
                        accommodation: suggestion.accommodationCost,
                        food: suggestion.foodCost,
                        transport: suggestion.transportCost,
                        extras: suggestion.extrasCost
                      },
                      true
                    )}
                  />
                ))}
              </div>
              {visibleCount < results.length ? (
                <button onClick={() => setVisibleCount(v => v + ITEMS_PER_PAGE)}
                  className="w-full py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center gap-2 transition-all">
                  ↓ {t.showMore}
                </button>
              ) : searched && results.length > 0 && (
                <p className="text-center text-sm font-bold text-slate-400 py-4">{t.noMore}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
