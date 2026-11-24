import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { RouteMasterView } from './components/RouteMasterView';
import { PlannerView } from './components/PlannerView';
import { VisionView } from './components/VisionView';
import { HelpView } from './components/HelpView';
import { TripPlanResultView } from './components/TripPlanResultView';
import { VisionResultView } from './components/VisionResultView';
import { ViewMode } from './types';
import { Moon, Sun, Key } from 'lucide-react';
import { ApiKeyModal } from './components/ApiKeyModal';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.HOME);
  const [lang, setLang] = useState('en');
  const [lastView, setLastView] = useState<ViewMode | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [fromBudgetMatch, setFromBudgetMatch] = useState(false);
  const [plannerResults, setPlannerResults] = useState<any>(null);
  const [savedFormValues, setSavedFormValues] = useState<any>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (savedTheme === 'light') {
        setIsDarkMode(false);
        document.documentElement.classList.remove('dark');
      } else if (savedTheme === 'dark' || prefersDark) {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    } catch (e) {
      console.warn('LocalStorage not accessible', e);
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      try { localStorage.setItem('theme', 'dark'); } catch (e) {}
    } else {
      document.documentElement.classList.remove('dark');
      try { localStorage.setItem('theme', 'light'); } catch (e) {}
    }
  };

  const [tripParams, setTripParams] = useState<{
    destination: string;
    origin: string;
    period: string;
    currency: string;
    budget: number;
    duration: number;
    estimatedCosts?: any;
  } | null>(null);

  const [visionParams, setVisionParams] = useState<{
    destination: string;
    period: string;
    duration?: number;
    isUncertain?: boolean;
  } | null>(null);

  const handlePlanTrip = (
    destination: string, 
    origin: string, 
    period: string, 
    currency: string, 
    budget?: number, 
    duration?: number, 
    estimatedCosts?: any,
    fromBudget?: boolean
  ) => {
    setTripParams({ destination, origin, period, currency, budget: budget || 0, duration: duration || 7, estimatedCosts });
    setFromBudgetMatch(!!fromBudget);
    setLastView(currentView);
    setCurrentView(ViewMode.TRIP_RESULT);
  };

  const handleSavePlannerResults = (results: any, formValues: any) => {
    setPlannerResults(results);
    setSavedFormValues(formValues);
  };

  const handleVisionPlan = (destination: string, period: string, duration?: number, isUncertain?: boolean, origin?: string, currency?: string) => {
    if (origin && currency) {
      handlePlanTrip(destination, origin, period, currency, 0, duration);
      return;
    }
    setVisionParams({ destination, period, duration: duration || 7, isUncertain });
    setLastView(ViewMode.VISION);
    setCurrentView(ViewMode.VISION_RESULT);
  };

  const renderView = () => {
    switch (currentView) {
      case ViewMode.HOME:
        return <HomeView onNavigate={setCurrentView} lang={lang} />;
      case ViewMode.ROUTE_MASTER:
        return <RouteMasterView lang={lang} onPlanTrip={handlePlanTrip} />;
      case ViewMode.CHAT:
        return (
          <PlannerView 
            lang={lang} 
            onPlanTrip={(dest, orig, per, cur, bud, dur, costs) => handlePlanTrip(dest, orig, per, cur, bud, dur, costs, true)} 
            onSaveResults={handleSavePlannerResults}
            savedResults={plannerResults}
            savedFormValues={savedFormValues}
          />
        );
      case ViewMode.VISION:
        return <VisionView lang={lang} onPlanTrip={handlePlanTrip} />;
      case ViewMode.HELP:
        return <HelpView lang={lang} />;
      case ViewMode.TRIP_RESULT:
        return tripParams ? (
          <TripPlanResultView 
            lang={lang} 
            params={tripParams} 
            onBack={() => {
              if (fromBudgetMatch) {
                setCurrentView(ViewMode.CHAT);
              } else {
                setCurrentView(lastView || ViewMode.CHAT);
              }
            }}
            showBackToResults={fromBudgetMatch}
          />
        ) : null;
      case ViewMode.VISION_RESULT:
        return visionParams ? (
          <VisionResultView lang={lang} params={visionParams} onBack={() => setCurrentView(ViewMode.VISION)} />
        ) : null;
      default:
        return <HomeView onNavigate={setCurrentView} lang={lang} />;
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} lang={lang} />
      <main className="flex-1 flex flex-col min-w-0 relative">
        <div className="absolute top-4 right-4 z-[100] flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsApiKeyModalOpen(true)}
            className="p-1.5 bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="API Key Setup (Dual Provider)"
          >
            <Key size={14} />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
            className="relative flex items-center w-12 h-6 bg-slate-100 dark:bg-slate-800 rounded-full p-1 transition-all duration-300 cursor-pointer border border-slate-200 dark:border-slate-700 shadow-inner group/theme overflow-hidden"
            title={isDarkMode ? 'Switch to Bright Mode' : 'Switch to Dark Mode'}>
            <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none opacity-40">
              <Sun size={10} className="text-orange-500" />
              <Moon size={10} className="text-indigo-400" />
            </div>
            <div className={`relative z-10 w-4 h-4 bg-white dark:bg-slate-900 rounded-full shadow-md flex items-center justify-center transition-all duration-300 transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}>
              {isDarkMode ? <Moon size={10} className="text-indigo-400 animate-in zoom-in duration-300" /> : <Sun size={10} className="text-orange-500 animate-in zoom-in duration-300" />}
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent opacity-0 group-hover/theme:opacity-100 transition-opacity pointer-events-none" />
          </button>
          <select value={lang} onChange={(e) => setLang(e.target.value)}
            className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 outline-none shadow-sm cursor-pointer">
            <option value="en">EN</option>
            <option value="it">IT</option>
            <option value="fr">FR</option>
            <option value="es">ES</option>
            <option value="zh">ZH</option>
            <option value="ja">JA</option>
          </select>
        </div>
        {renderView()}
      </main>
      <ApiKeyModal 
        isOpen={isApiKeyModalOpen} 
        onClose={() => setIsApiKeyModalOpen(false)} 
        lang={lang} 
      />
    </div>
  );
};

export default App;
