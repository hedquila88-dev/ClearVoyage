import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Moon, Sun, ArrowRight, MapPin, Plane, Loader2, AlertCircle, Locate } from 'lucide-react';
import { getTravelLogistics, getCityNameFromCoords } from './services/geminiService';
import { TravelLogistics } from './types';
import CostChart from './components/CostChart';
import SurvivalLogistics from './components/SurvivalLogistics';
import OptimizationCards from './components/OptimizationCards';
import CalendarPicker from './components/CalendarPicker';
import SavingsStrategyCard from './components/SavingsStrategyCard';




const MOCK_CITIES = [
  "London, UK", "New York, USA", "Paris, France", "Tokyo, Japan",
  "Rome, Italy", "Dubai, UAE", "Singapore", "Barcelona, Spain",
  "Los Angeles, USA", "Sydney, Australia", "Berlin, Germany",
  "Amsterdam, Netherlands", "Bangkok, Thailand", "Istanbul, Turkey",
  "Seoul, South Korea", "Hong Kong", "Milan, Italy", "Lisbon, Portugal"
];




const FLAGS: Record<string, string> = {
  en: '🇬🇧',
  it: '🇮🇹',
  fr: '🇫🇷',
  es: '🇪🇸'
};




const TRANSLATIONS = {
  en: {
    subtitle: "Minimalist Travel Logistics",
    from: "From",
    to: "To",
    period: "Period",
    generate: "Generate Analysis",
    loading: "Generating...",
    required: "Required",
    short: "Too short",
    geoError: "Geolocation is not supported by your browser",
    geoFail: "Failed to determine city from location",
    geoDenied: "Location access denied or unavailable",
    genError: "Failed to generate plan",
    flights: "Flights",
    stay: "Stay",
    food: "Food",
    transport: "Transport",
    extras: "Extras/SIM",
    water: "Water",
    money: "Cash",
    languageLabel: "Language",
    laundry: "Laundry",
    timeMatch: "Time Match",
    yourDates: "Your Dates",
    crowds: "Crowds",
    optimizer: "Smart Optimizer",
    savings: "Savings",
    sweetSpot: "Sweet Spot",
    bestAlt: "Best Alternative",
    weather: "Weather",
    reliability: "Transport Reliability",
    tapWater: "Tap Water",
    totalEst: "TOTAL EST.",
    safe: "Safe",
    hubTitle: "Logistics Hub & Optimization",
    stratTitle: "Savings Strategy",
    stratSave: "Weekly Savings",
    stratSub: "Optimizing food and stay with our suggestions.",
    copy: "Copy Report",
    saveTxt: "Save Text",
    savePdf: "Save PDF",
    copied: "Copied!",
    generating: "Generating...",
    export: "Export",
    placeholders: {
      from: "e.g. London, JFK",
      to: "e.g. Tokyo, Kyoto",
      period: "e.g. Next week, August"
    }
  },
  it: {
    subtitle: "Logistica di Viaggio Minimalista",
    from: "Da",
    to: "A",
    period: "Periodo",
    generate: "Genera Analisi",
    loading: "Generazione...",
    required: "Richiesto",
    short: "Troppo corto",
    geoError: "Geolocalizzazione non supportata",
    geoFail: "Impossibile determinare la città",
    geoDenied: "Accesso alla posizione negato",
    genError: "Impossibile generare il piano",
    flights: "Voli",
    stay: "Alloggio",
    food: "Cibo",
    transport: "Trasporti",
    extras: "Extra/SIM",
    water: "Acqua",
    money: "Contanti",
    languageLabel: "Lingua",
    laundry: "Lavanderia",
    timeMatch: "Match Temporale",
    yourDates: "Tue Date",
    crowds: "Folla",
    optimizer: "Ottimizzatore Smart",
    savings: "Risparmio",
    sweetSpot: "Periodo Ideale",
    bestAlt: "Migliore Alternativa",
    weather: "Meteo",
    reliability: "Affidabilità Trasporti",
    tapWater: "Acqua Rubinetto",
    totalEst: "TOTALE STIM.",
    safe: "Sicura",
    hubTitle: "Hub Logistico & Ottimizzazione",
    stratTitle: "Strategia di Risparmio",
    stratSave: "Risparmio Settimanale",
    stratSub: "Ottimizzando cibo e alloggio con i nostri suggerimenti.",
    copy: "Copia Report",
    saveTxt: "Salva TXT",
    savePdf: "Salva PDF",
    copied: "Copiato!",
    generating: "Generazione...",
    export: "Esporta",
    placeholders: {
      from: "es. Londra, FCO",
      to: "es. Tokyo, Kyoto",
      period: "es. Prossima settimana, Agosto"
    }
  },
  fr: {
    subtitle: "Logistique de Voyage Minimaliste",
    from: "De",
    to: "À",
    period: "Période",
    generate: "Générer l'Analyse",
    loading: "Génération...",
    required: "Requis",
    short: "Trop court",
    geoError: "Géolocalisation non supportée",
    geoFail: "Impossible de déterminer la ville",
    geoDenied: "Accès refusé",
    genError: "Erreur de génération",
    flights: "Vols",
    stay: "Hébergement",
    food: "Nourriture",
    transport: "Transport",
    extras: "Extras/SIM",
    water: "Eau",
    money: "Argent",
    languageLabel: "Langue",
    laundry: "Laverie",
    timeMatch: "Correspondance",
    yourDates: "Vos Dates",
    crowds: "Foule",
    optimizer: "Optimiseur Smart",
    savings: "Économies",
    sweetSpot: "Moment Idéal",
    bestAlt: "Alternative",
    weather: "Météo",
    reliability: "Fiabilité Transports",
    tapWater: "Eau Robinet",
    totalEst: "TOTAL EST.",
    safe: "Sûre",
    hubTitle: "Hub Logistique & Optimisation",
    stratTitle: "Stratégie d'Économie",
    stratSave: "Économies Hebdo",
    stratSub: "Optimisation nourriture et logement.",
    copy: "Copier",
    saveTxt: "Sauver TXT",
    savePdf: "Sauver PDF",
    copied: "Copié!",
    generating: "Génération...",
    export: "Exporter",
    placeholders: {
      from: "ex. Paris, CDG",
      to: "ex. Tokyo, Kyoto",
      period: "ex. Semaine prochaine, Août"
    }
  },
  es: {
    subtitle: "Logística de Viaje Minimalista",
    from: "Desde",
    to: "A",
    period: "Período",
    generate: "Generar Análisis",
    loading: "Generando...",
    required: "Requerido",
    short: "Muy corto",
    geoError: "Geolocalización no soportada",
    geoFail: "Fallo al determinar ciudad",
    geoDenied: "Acceso denegado",
    genError: "Fallo al generar plan",
    flights: "Vuelos",
    stay: "Alojamiento",
    food: "Comida",
    transport: "Transporte",
    extras: "Extras/SIM",
    water: "Agua",
    money: "Efectivo",
    languageLabel: "Idioma",
    laundry: "Lavandería",
    timeMatch: "Coincidencia",
    yourDates: "Tus Fechas",
    crowds: "Multitud",
    optimizer: "Optimizador",
    savings: "Ahorro",
    sweetSpot: "Punto Ideal",
    bestAlt: "Mejor Alternativa",
    weather: "Clima",
    reliability: "Fiabilidad Transp.",
    tapWater: "Agua Grifo",
    totalEst: "TOTAL EST.",
    safe: "Segura",
    hubTitle: "Centro Logístico y Optimización",
    stratTitle: "Estrategia de Ahorro",
    stratSave: "Ahorro Semanal",
    stratSub: "Optimizando comida y alojamiento.",
    copy: "Copiar",
    saveTxt: "Guardar TXT",
    savePdf: "Guardar PDF",
    copied: "¡Copiado!",
    generating: "Generando...",
    export: "Exportar",
    placeholders: {
      from: "ej. Madrid, MAD",
      to: "ej. Tokio, Kioto",
      period: "ej. Próxima semana, Agosto"
    }
  }
};




export default function App() {
  const [inputDestination, setInputDestination] = useState('');
  const [inputDeparture, setInputDeparture] = useState('');
  const [inputPeriod, setInputPeriod] = useState('');
  const [inputCurrency, setInputCurrency] = useState('USD');
  const [inputLang, setInputLang] = useState('en');
 
  const [showLangMenu, setShowLangMenu] = useState(false);
 
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);




  const [departureSuggestions, setDepartureSuggestions] = useState<string[]>([]);
  const [showDepartureSuggestions, setShowDepartureSuggestions] = useState(false);
 
  const [fieldErrors, setFieldErrors] = useState<{
    destination: string | null;
    departure: string | null;
    period: string | null;
  }>({
    destination: null,
    departure: null,
    period: null
  });




  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [data, setData] = useState<TravelLogistics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);




  const suggestionClickRef = useRef(false);




  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);




  const t = TRANSLATIONS[inputLang as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;




  const validate = (value: string, type: 'text' | 'period' = 'text') => {
    if (!value.trim()) return t.required;
    if (type === 'text' && value.trim().length < 2) return t.short;
    return null;
  };




  const handleDestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputDestination(val);
   
    if (fieldErrors.destination) {
      setFieldErrors(prev => ({ ...prev, destination: null }));
    }




    if (val.length > 0) {
      const filtered = MOCK_CITIES.filter(c => c.toLowerCase().includes(val.toLowerCase()));
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };




  const selectSuggestion = (city: string) => {
    suggestionClickRef.current = true;
    setInputDestination(city);
    setShowSuggestions(false);
    setFieldErrors(prev => ({ ...prev, destination: null }));
  };




  const handleDepartureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputDeparture(val);




    if (fieldErrors.departure) {
      setFieldErrors(prev => ({ ...prev, departure: null }));
    }




    if (val.length > 0) {
      const filtered = MOCK_CITIES.filter(c => c.toLowerCase().includes(val.toLowerCase()));
      setDepartureSuggestions(filtered);
      setShowDepartureSuggestions(filtered.length > 0);
    } else {
      setShowDepartureSuggestions(false);
    }
  };




  const selectDepartureSuggestion = (city: string) => {
    suggestionClickRef.current = true;
    setInputDeparture(city);
    setShowDepartureSuggestions(false);
    setFieldErrors(prev => ({ ...prev, departure: null }));
  };




  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError(t.geoError);
      return;
    }




    setGeoLoading(true);
    if (error) setError(null);
   
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const city = await getCityNameFromCoords(latitude, longitude, inputLang);
          setInputDeparture(city);
          setFieldErrors(prev => ({ ...prev, departure: null }));
        } catch (err) {
          setError(t.geoFail);
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        console.error(err);
        setGeoLoading(false);
        setError(t.geoDenied);
      }
    );
  };




  const handleGenerate = async () => {
    const destError = validate(inputDestination);
    const depError = validate(inputDeparture);
    const periodError = validate(inputPeriod, 'period');
   
    setFieldErrors({
      destination: destError,
      departure: depError,
      period: periodError
    });




    if (destError || depError || periodError) return;




    setLoading(true);
    setError(null);
    try {
      const result = await getTravelLogistics(inputDestination, inputDeparture, inputPeriod, inputCurrency, inputLang);
      setData(result);
    } catch (e: any) {
      setError(e.message || t.genError);
    } finally {
      setLoading(false);
    }
  };




  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex justify-center p-6 font-sans selection:bg-emerald-500/30`}>
     
      {/* Absolute Navigation */}
      <div className="absolute top-6 left-6 z-50">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>




      <div className="absolute top-6 right-6 z-50 flex gap-2">
         <select
           value={inputCurrency}
           onChange={(e) => setInputCurrency(e.target.value)}
           className="h-10 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs font-black text-slate-600 dark:text-slate-300 shadow-sm outline-none focus:border-emerald-500"
           aria-label="Select currency"
         >
           <option value="GBP">GBP (£)</option>
           <option value="USD">USD ($)</option>
           <option value="EUR">EUR (€)</option>
           <option value="JPY">JPY (¥)</option>
         </select>
         
         <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              onBlur={() => setTimeout(() => setShowLangMenu(false), 200)}
              className="h-10 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center gap-2 shadow-sm outline-none focus:border-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Select language"
              aria-haspopup="listbox"
              aria-expanded={showLangMenu}
            >
              <span className="text-lg leading-none">{FLAGS[inputLang]}</span>
              <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase">{inputLang}</span>
            </button>
           
            {showLangMenu && (
              <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2" role="listbox">
                {Object.entries(FLAGS).map(([code, flag]) => (
                  <button
                    key={code}
                    role="option"
                    aria-selected={inputLang === code}
                    onMouseDown={() => setInputLang(code)}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors ${inputLang === code ? 'bg-slate-50 dark:bg-slate-800' : ''}`}
                  >
                    <span className="text-2xl leading-none">{flag}</span>
                    <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase">{code}</span>
                  </button>
                ))}
              </div>
            )}
         </div>
      </div>




      <div className="w-full max-w-[540px] space-y-8 relative pt-12">
       
        {/* Header */}
        <div className="text-center space-y-2 mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white">
            ClearVoyage<span className="text-emerald-500">.</span>
          </h1>
          <p className="text-slate-400 dark:text-slate-500 font-medium text-sm tracking-wide uppercase">
            {t.subtitle}
          </p>
        </div>




        {/* Inputs Stack */}
        <div className="space-y-4">
           
            {/* Departure */}
            <div className="group relative">
                <label id="departure-label" htmlFor="departure-input" className={`text-[10px] font-black uppercase tracking-widest ml-4 mb-2 block transition-colors ${fieldErrors.departure ? 'text-red-500' : 'text-slate-400 group-focus-within:text-emerald-500'}`}>{t.from}</label>
                <div className="relative">
                  <Plane className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 ${fieldErrors.departure ? 'text-red-500' : 'text-slate-400 group-focus-within:text-emerald-500'}`} size={20} />
                  <input
                    id="departure-input"
                    type="text"
                    value={inputDeparture}
                    onChange={handleDepartureChange}
                    onBlur={() => {
                        setTimeout(() => {
                            if (suggestionClickRef.current) {
                                suggestionClickRef.current = false;
                                return;
                            }
                            setShowDepartureSuggestions(false);
                            setFieldErrors(prev => ({ ...prev, departure: validate(inputDeparture) }));
                        }, 200);
                    }}
                    placeholder={t.placeholders.from}
                    className={`w-full h-16 pl-12 pr-14 rounded-2xl border-2 transition-all duration-300 outline-none font-bold shadow-sm placeholder:text-slate-300 dark:placeholder:text-slate-600 ${
                      fieldErrors.departure
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/10 text-red-900 dark:text-red-100 focus:border-red-600'
                        : 'bg-white dark:bg-slate-900/50 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100'
                    }`}
                    aria-labelledby="departure-label"
                    aria-invalid={!!fieldErrors.departure}
                    aria-required="true"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={showDepartureSuggestions}
                    aria-controls="departure-listbox"
                  />
                 
                  <button
                    onClick={handleUseCurrentLocation}
                    disabled={geoLoading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50 z-30"
                    title="Use current location"
                    aria-label="Use current location"
                  >
                    {geoLoading ? <Loader2 size={18} className="animate-spin" /> : <Locate size={18} />}
                  </button>




                  {fieldErrors.departure && (
                    <div className="absolute right-14 top-1/2 -translate-y-1/2 z-20 animate-in fade-in slide-in-from-right-4 pointer-events-none" role="alert">
                      <div className="bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                        <span>{fieldErrors.departure}</span>
                      </div>
                    </div>
                  )}
                  {showDepartureSuggestions && departureSuggestions.length > 0 && !fieldErrors.departure && (
                    <div
                        id="departure-listbox"
                        role="listbox"
                        className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-white/5 z-50 overflow-hidden max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2"
                    >
                        {departureSuggestions.map((city, idx) => (
                            <div
                              key={idx}
                              role="option"
                              aria-selected="false"
                              onMouseDown={() => selectDepartureSuggestion(city)}
                              className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-sm font-bold text-slate-700 dark:text-white transition-colors border-b border-slate-50 dark:border-white/5 last:border-0"
                            >
                                {city}
                            </div>
                        ))}
                    </div>
                  )}
                </div>
            </div>




            {/* Destination */}
            <div className="group relative">
                <label id="destination-label" htmlFor="destination-input" className={`text-[10px] font-black uppercase tracking-widest ml-4 mb-2 block transition-colors ${fieldErrors.destination ? 'text-red-500' : 'text-slate-400 group-focus-within:text-emerald-500'}`}>{t.to}</label>
                <div className="relative">
                  <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 ${fieldErrors.destination ? 'text-red-500' : 'text-slate-400 group-focus-within:text-emerald-500'}`} size={20} />
                  <input
                    id="destination-input"
                    type="text"
                    value={inputDestination}
                    onChange={handleDestChange}
                    onBlur={() => {
                        setTimeout(() => {
                            if (suggestionClickRef.current) {
                                suggestionClickRef.current = false;
                                return;
                            }
                            setShowSuggestions(false);
                            setFieldErrors(prev => ({ ...prev, destination: validate(inputDestination) }));
                        }, 200);
                    }}
                    placeholder={t.placeholders.to}
                    className={`w-full h-16 pl-12 pr-4 rounded-2xl border-2 transition-all duration-300 outline-none font-bold shadow-sm placeholder:text-slate-300 dark:placeholder:text-slate-600 ${
                      fieldErrors.destination
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/10 text-red-900 dark:text-red-100 focus:border-red-600'
                        : 'bg-white dark:bg-slate-900/50 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100'
                    }`}
                    aria-labelledby="destination-label"
                    aria-invalid={!!fieldErrors.destination}
                    aria-required="true"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={showSuggestions}
                    aria-controls="destination-listbox"
                  />
                  {fieldErrors.destination && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 animate-in fade-in slide-in-from-right-4 pointer-events-none" role="alert">
                      <div className="bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                        <span>{fieldErrors.destination}</span>
                      </div>
                    </div>
                  )}
                  {showSuggestions && suggestions.length > 0 && !fieldErrors.destination && (
                    <div id="destination-listbox" role="listbox" className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-white/5 z-50 overflow-hidden max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                        {suggestions.map((city, idx) => (
                            <div
                              key={idx}
                              role="option"
                              aria-selected="false"
                              onMouseDown={() => selectSuggestion(city)}
                              className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-sm font-bold text-slate-700 dark:text-white transition-colors border-b border-slate-50 dark:border-white/5 last:border-0"
                            >
                                {city}
                            </div>
                        ))}
                    </div>
                  )}
                </div>
            </div>




            {/* Period */}
            <div className="group relative">
                <label id="period-label" htmlFor="period-input" className={`text-[10px] font-black uppercase tracking-widest ml-4 mb-2 block transition-colors duration-300 ${fieldErrors.period ? 'text-red-500' : 'text-slate-400 group-focus-within:text-emerald-500'}`}>{t.period}</label>
                <div className="relative">
                    <Calendar className={`absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:scale-110 transition-all duration-300 z-10 ${fieldErrors.period ? 'text-red-500' : 'text-slate-400 group-focus-within:text-emerald-500'}`} size={20} />
                    <input
                        id="period-input"
                        type="text"
                        value={inputPeriod}
                        onChange={(e) => {
                          setInputPeriod(e.target.value);
                          if (fieldErrors.period) setFieldErrors(prev => ({ ...prev, period: null }));
                        }}
                        onBlur={() => setFieldErrors(prev => ({ ...prev, period: validate(inputPeriod, 'period') }))}
                        onClick={() => setShowCalendar(true)}
                        placeholder={t.placeholders.period}
                        autoComplete="off"
                        className={`w-full h-16 pl-12 pr-4 rounded-2xl border-2 transition-all duration-300 outline-none font-bold shadow-sm placeholder:font-medium placeholder:text-slate-400 ${
                          fieldErrors.period
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/10 text-red-900 dark:text-red-100 focus:border-red-600'
                            : 'bg-white dark:bg-slate-900/50 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-[6px] focus:ring-emerald-500/20 focus:shadow-xl focus:shadow-emerald-500/10 focus:-translate-y-1 text-slate-700 dark:text-white'
                        }`}
                        aria-labelledby="period-label"
                        aria-invalid={!!fieldErrors.period}
                        aria-required="true"
                        aria-haspopup="dialog"
                        aria-expanded={showCalendar}
                    />
                    {fieldErrors.period && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 animate-in fade-in slide-in-from-right-4 pointer-events-none" role="alert">
                        <div className="bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                          <span>{fieldErrors.period}</span>
                        </div>
                      </div>
                    )}
                </div>
                {showCalendar && (
                    <CalendarPicker
                        selectedDate={inputPeriod}
                        onSelect={(date) => {
                          setInputPeriod(date);
                          setShowCalendar(false);
                          setFieldErrors(prev => ({ ...prev, period: null }));
                        }}
                        onClose={() => setShowCalendar(false)}
                        language={inputLang}
                    />
                )}
            </div>




            <button
                onClick={handleGenerate}
                disabled={loading}
                aria-busy={loading}
                className="w-full h-16 mt-6 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:pointer-events-none"
            >
                {loading ? <Loader2 className="animate-spin" /> : <>{t.generate} <ArrowRight size={20} /></>}
            </button>
        </div>




        {/* Results */}
        {error && (
            <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl text-center font-bold text-sm" role="alert">
                {error}
            </div>
        )}




        {data && (
            <div id="results-container" className="space-y-8 animate-in slide-in-from-bottom-8 fade-in duration-700">
                <CostChart
                  data={data.costs}
                  total={data.costs.flights + data.costs.accommodation + data.costs.food + data.costs.transport + data.costs.extras}
                  localTotal={0}
                  userSymbol={data.userCurrency.symbol}
                  localSymbol={data.localCurrency.symbol}
                  labels={[t.flights, t.stay, t.food, t.transport, t.extras]}
                  totalLabel={t.totalEst}
                  fullData={data}
                  exportLabels={{
                    copy: t.copy,
                    saveTxt: t.saveTxt,
                    savePdf: t.savePdf,
                    copied: t.copied,
                    generating: t.generating,
                    menuLabel: t.export
                  }}
                />
                <SurvivalLogistics
                   data={data.survival}
                   labels={{ water: t.water, money: t.money, languageLabel: t.languageLabel, laundry: t.laundry }}
                />
                <OptimizationCards
                   data={data}
                   labels={{
                     timeMatchTitle: t.timeMatch,
                     chosenPeriodTitle: t.yourDates,
                     crowdingLabel: t.crowds,
                     smartOptimizerTitle: t.optimizer,
                     savingsLabel: t.savings,
                     sweetSpotTitle: t.sweetSpot,
                     bestPeriodLabel: t.bestAlt,
                     weather: t.weather,
                     reliability: t.reliability,
                     drinkingWater: t.tapWater,
                     hubTitle: t.hubTitle,
                     safeWaterStatus: t.safe
                   }}
                />
                {data.savingsStrategy && (
                  <SavingsStrategyCard
                    data={data.savingsStrategy}
                    currencySymbol={data.userCurrency.symbol}
                    labels={{
                      title: t.stratTitle,
                      weeklySavings: t.stratSave,
                      weeklySubtitle: t.stratSub
                    }}
                  />
                )}
            </div>
        )}
      </div>
    </div>
  );
}