import React, { useState } from 'react';
import { ViewMode } from '../types';
import { Map, MapPin, Banknote, Camera, Sparkles, Calendar, Coins, CircleHelp, Menu, ChevronLeft, Home, Route, Eye, Zap } from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  lang: string;
}

const SIDEBAR_TRANSLATIONS: Record<string, any> = {
  en: { home: 'Home', route: 'Route Master', budget: 'Budget Match', vision: 'Visual Trip', help: 'Help', power: 'Powered by' },
  it: { home: 'Home', route: 'Route Master', budget: 'Budget Match', vision: 'Visual Trip', help: 'Aiuto', power: 'Powered by' },
  fr: { home: 'Accueil', route: 'Maître d\'Itinéraire', budget: 'Budget Match', vision: 'Voyage Visuel', help: 'Aide', power: 'Propulsé par' },
  es: { home: 'Inicio', route: 'Ruta Maestra', budget: 'Budget Match', vision: 'Viaje Visual', help: 'Ayuda', power: 'Con tecnología' },
  zh: { home: '首页', route: '路线大师', budget: '预算匹配', vision: '视觉旅行', help: '帮助', power: '技术支持' },
  ja: { home: 'ホーム', route: 'ルートマスター', budget: '预算マッチ', vision: 'ビジュアル旅', help: 'ヘルプ', power: '提供' }
};

export const BudgetMatchIcon: React.FC<{ className?: string; size?: number | string }> = ({ className, size }) => {
  const style = size ? { width: size, height: size } : {};
  const defaultClasses = (!size && (!className || !className.includes('w-'))) ? 'w-6 h-6' : '';
  return (
    <div className={`${defaultClasses} ${className || ''} relative flex items-center justify-center`} style={style}>
      <Banknote className="absolute bottom-0 right-0 w-[70%] h-[70%] text-emerald-400" strokeWidth={2} />
      <MapPin className="absolute top-0 left-0 w-[70%] h-[70%] text-rose-500 fill-rose-500/20" strokeWidth={2} />
    </div>
  );
};

export const RouteMasterIcon: React.FC<{ className?: string; size?: number | string }> = ({ className, size }) => {
  const style = size ? { width: size, height: size } : {};
  const defaultClasses = (!size && (!className || !className.includes('w-'))) ? 'w-6 h-6' : '';
  return (
    <div className={`${defaultClasses} ${className || ''} relative flex items-center justify-center`} style={style}>
      <Map className="absolute bottom-0 left-0 w-[75%] h-[75%] text-emerald-500 opacity-80" strokeWidth={1.5} />
      <Route className="absolute top-0 right-0 w-[75%] h-[75%] text-violet-400" strokeWidth={2} />
    </div>
  );
};

export const VisualTripIcon: React.FC<{ className?: string; size?: number | string }> = ({ className, size }) => {
  const style = size ? { width: size, height: size } : {};
  const defaultClasses = (!size && (!className || !className.includes('w-'))) ? 'w-6 h-6' : '';
  return (
    <div className={`${defaultClasses} ${className || ''} relative flex items-center justify-center`} style={style}>
      <Camera className="w-[85%] h-[85%]" strokeWidth={2} />
      <Sparkles className="absolute -top-1 -right-1 w-[45%] h-[45%] text-amber-400 fill-amber-400" strokeWidth={2} />
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, lang }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  React.useEffect(() => {
    setIsCollapsed(true);
  }, [currentView]);

  const t = SIDEBAR_TRANSLATIONS[lang] || SIDEBAR_TRANSLATIONS.en;

  const navItems = [
    { id: ViewMode.HOME, label: t.home, icon: Home },
    { id: ViewMode.ROUTE_MASTER, label: t.route, icon: RouteMasterIcon },
    { id: ViewMode.CHAT, label: t.budget, icon: BudgetMatchIcon },
    { id: ViewMode.VISION, label: t.vision, icon: VisualTripIcon },
    { id: ViewMode.HELP, label: t.help, icon: CircleHelp },
  ];

  return (
    <aside className={`${isCollapsed ? 'w-[52px]' : 'w-52'} bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0 transition-all duration-300 ease-in-out`}>
      <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-4'} border-b border-slate-800`}>
        <div className={`flex items-center gap-2 ${isCollapsed ? 'hidden' : 'flex'}`}>
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-1.5 rounded-lg">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">ClearVoyage</span>
        </div>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className={`flex-1 ${isCollapsed ? 'px-1' : 'p-3'} py-3 space-y-1 overflow-y-auto`}>
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button key={item.id} onClick={() => { onViewChange(item.id); setIsCollapsed(true); }}
              className={`w-full flex items-center gap-3 ${isCollapsed ? 'p-1.5' : 'p-3'} rounded-xl transition-all duration-200 group relative
                ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                ${isCollapsed ? 'justify-center' : ''}`}>
              <div className={`${isCollapsed ? `w-8 h-8 flex items-center justify-center rounded-lg ${isActive ? 'bg-white/10' : 'bg-slate-800'}` : ''}`}>
                <item.icon size={20} className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              </div>
              {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none border border-slate-700">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      <div className={`${isCollapsed ? 'px-1' : 'p-4'} py-4 border-t border-slate-800 ${isCollapsed ? 'flex justify-center' : ''}`}>
        {!isCollapsed ? (
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{t.power}</p>
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs">
              <Zap size={14} className="text-amber-400 fill-amber-400" />
              Google Gemini
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400">
            <Zap size={16} className="fill-amber-400" />
          </div>
        )}
      </div>
    </aside>
  );
};
