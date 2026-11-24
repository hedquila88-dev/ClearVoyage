import React from 'react';
import { ViewMode } from '../types';
import { RouteMasterIcon, BudgetMatchIcon, VisualTripIcon } from './Sidebar';
import { CircleHelp, ArrowRight, Zap } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (view: ViewMode) => void;
  lang: string;
}

const HOME_TRANSLATIONS: Record<string, any> = {
  en: { welcome: 'Welcome to ClearVoyage', subtitle: 'Your meticulous travel logistics assistant.', select: 'Select a tool to begin', routeTitle: 'Route Master', routeDesc: 'Analyze logistics, calculate costs, and check survival stats for specific trips.', budgetTitle: 'Budget Match', budgetDesc: 'Reverse search engine. Find destinations that fit your budget and dates.', visionTitle: 'Visual Trip', visionDesc: 'Identify landmarks and locations from photos using AI Vision.', helpTitle: 'Help Center', helpDesc: 'Guides and system configuration assistance.', start: 'Start' },
  it: { welcome: 'Benvenuto su ClearVoyage', subtitle: 'Il tuo assistente meticoloso per la logistica di viaggio.', select: 'Seleziona uno strumento per iniziare', routeTitle: 'Route Master', routeDesc: 'Analizza logistica, calcola costi e controlla statistiche di sopravvivenza.', budgetTitle: 'Budget Match', budgetDesc: 'Motore di ricerca inverso. Trova destinazioni adatte al tuo budget.', visionTitle: 'Visual Trip', visionDesc: 'Identifica monumenti e luoghi dalle foto usando la Visione AI.', helpTitle: 'Centro Aiuto', helpDesc: 'Guide e assistenza per la configurazione del sistema.', start: 'Avvia' },
  fr: { welcome: 'Bienvenue sur ClearVoyage', subtitle: 'Votre assistant méticuleux de logistique de voyage.', select: 'Sélectionnez un outil pour commencer', routeTitle: "Maître d'Itinéraire", routeDesc: 'Analysez la logistique, calculez les coûts et vérifiez les statistiques.', budgetTitle: 'Budget Match', budgetDesc: 'Moteur de recherche inversé. Trouvez des destinations selon votre budget.', visionTitle: 'Voyage Visuel', visionDesc: "Identifiez des monuments à partir de photos grâce à l'IA.", helpTitle: "Centre d'Aide", helpDesc: 'Guides et assistance à la configuration du sistema.', start: 'Démarrer' },
  es: { welcome: 'Bienvenido a ClearVoyage', subtitle: 'Tu asistente meticuloso de logística de viajes.', select: 'Selecciona una herramienta para comenzar', routeTitle: 'Ruta Maestra', routeDesc: 'Analiza logística, calcula costos y estadísticas de supervivencia.', budgetTitle: 'Budget Match', budgetDesc: 'Motor de búsqueda inversa. Encuentra destinos que se ajusten a tu presupuesto.', visionTitle: 'Viaje Visual', visionDesc: 'Identifica puntos de referencia y lugares de fotos con IA.', helpTitle: 'Centro de Ayuda', helpDesc: 'Guías y asistencia de configuración del sistema.', start: 'Iniciar' },
  zh: { welcome: '欢迎使用 ClearVoyage', subtitle: '您的一丝不苟的旅行物流助手。', select: '选择一个工具开始', routeTitle: '路线大师', routeDesc: '分析物流，计算成本并检查特定行程的生存统计数据。', budgetTitle: '预算匹配', budgetDesc: '反向搜索引擎。查找符合您预算和日期的目的地。', visionTitle: '视觉旅行', visionDesc: '使用 AI 视觉从照片中识别地标和位置。', helpTitle: '帮助中心', helpDesc: '指南和系统配置协助。', start: '开始' },
  ja: { welcome: 'ClearVoyageへようこそ', subtitle: '綿密な旅行ロジスティクスアシスタント。', select: 'ツールを選択して開始', routeTitle: 'ルートマスター', routeDesc: 'ロジスティクスを分析し、コストを計算し、生存統計を確認します。', budgetTitle: '予算マッチ', budgetDesc: '逆検索エンジン。予算と日付に合う目的地を見つけます。', visionTitle: 'ビジュアル旅', visionDesc: 'AIビジョンを使用して写真からランドマークや場所を特定します。', helpTitle: 'ヘルプセンター', helpDesc: 'ガイドとシステム構成の支援。', start: '開始' }
};

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, lang }) => {
  const t = HOME_TRANSLATIONS[lang] || HOME_TRANSLATIONS.en;

  const FeatureCard = ({ icon: Icon, title, desc, view, colorClass }: { icon: any, title: string, desc: string, view: ViewMode, colorClass: string }) => {
    return (
      <button onClick={() => onNavigate(view)}
        className="group flex flex-col items-start p-3 md:p-4 lg:p-7 rounded-[1.5rem] md:rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 text-left h-full relative overflow-hidden">
        <div className="p-2.5 rounded-xl mb-3 md:mb-4 bg-slate-100 dark:bg-slate-800">
          <Icon className={`w-6 h-6 md:w-7 md:h-7 ${colorClass}`} strokeWidth={1.5} />
        </div>
        <h3 className="text-base md:text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium leading-tight md:leading-relaxed mb-4 md:mb-6">{desc}</p>
        <div className="mt-auto flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-300 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
          {t.start} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-100/50 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans overflow-y-auto relative">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 pt-10 md:pt-10 lg:pt-14 pb-8 relative z-10">
        <div className="text-center mb-6 lg:mb-10 space-y-1 lg:space-y-4">
          <h1 className="text-xl md:text-2xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t.welcome}</h1>
          <p className="text-xs md:text-sm lg:text-base text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">{t.subtitle}</p>
        </div>
        <div className="mb-4 md:mb-6 flex items-center gap-3 md:gap-4 px-2">
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.select}</span>
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          <FeatureCard icon={RouteMasterIcon} title={t.routeTitle} desc={t.routeDesc} view={ViewMode.ROUTE_MASTER} colorClass="text-blue-500" />
          <FeatureCard icon={BudgetMatchIcon} title={t.budgetTitle} desc={t.budgetDesc} view={ViewMode.CHAT} colorClass="text-rose-500" />
          <FeatureCard icon={VisualTripIcon} title={t.visionTitle} desc={t.visionDesc} view={ViewMode.VISION} colorClass="text-violet-500" />
          <FeatureCard icon={CircleHelp} title={t.helpTitle} desc={t.helpDesc} view={ViewMode.HELP} colorClass="text-slate-500" />
        </div>
        <div className="mt-20 text-center text-slate-400 text-sm font-medium">
          <p className="flex items-center justify-center gap-2 opacity-50"><Zap size={14} /> Powered by Google Gemini AI</p>
        </div>
      </div>
    </div>
  );
};
