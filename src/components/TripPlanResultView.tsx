import React, { useState, useEffect, useRef } from 'react';
import { analyzeRoute } from '../services/geminiService';
import { ExportTools, generateTextContent } from './ExportTools';
import {
  ArrowLeft, Loader2, AlertCircle, AlertTriangle, MapPin, Plane, Calendar, Clock,
  CreditCard, Languages, Shirt, Wifi, Shield, ShieldAlert, Brain, Zap, Droplet,
  TrendingUp, Sun, Users, Lightbulb, CircleDollarSign, Utensils,
  Bus, Bed, ShoppingBag, Ticket, RefreshCw
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  lang: string;
  params: {
    destination: string;
    origin: string;
    period: string;
    currency: string;
    budget: number;
    duration: number;
    estimatedCosts?: any;
  };
  onBack: () => void;
  showBackToResults?: boolean;
}

const LABELS: Record<string, any> = {
  en: {
    back: 'Back', 
    backToResults: 'Back to Results',
    loading: 'Analyzing your trip...', error: 'Analysis failed. Please go back and try again.',
    origin: 'Origin', destination: 'Destination', period: 'Period',
    estTotal: 'EST. TOTAL', flights: 'Flights', stay: 'Stay', food: 'Food', transport: 'Transport', extras: 'Extras',
    duration: 'Duration', days: 'Days',
    export: 'Export', pdf: 'PDF', txt: 'TXT', copy: 'Copy',
    hub: 'Logistics Hub', weather: 'Weather', reliability: 'Transport Reliability', water: 'Water Potability',
    safeWater: 'Safe to Drink', unsafeWater: 'Not Safe',
    timeMatch: 'Time Match', yourDates: 'Your Dates', crowds: 'Crowds',
    smartOptimizer: 'Smart Optimizer', savings: 'Savings',
    sweetSpot: 'Sweet Spot', bestAlt: 'Best Alternative',
    survival: 'Survival Logistics',
    cashDep: 'Cash Dependency', englishLevel: 'English Level', laundry: 'Laundry',
    internet: 'Internet', safety: 'Safety', electricity: 'Electricity',
    savingsTitle: 'Savings Strategy', weeklySavings: 'Est. Weekly Savings', weeklySubtitle: 'Potential savings',
  },
  it: {
    back: 'Indietro', 
    backToResults: 'Torna ai Risultati',
    loading: 'Analizzando il tuo viaggio...', error: 'Analisi fallita. Torna indietro e riprova.',
    origin: 'Partenza', destination: 'Destinazione', period: 'Periodo',
    estTotal: 'TOT. STIMATO', flights: 'Voli', stay: 'Alloggio', food: 'Cibo', transport: 'Trasporti', extras: 'Extra',
    duration: 'Durata', days: 'Giorni',
    export: 'Esporta', pdf: 'PDF', txt: 'TXT', copy: 'Copia',
    hub: 'Hub Logistico', weather: 'Meteo', reliability: 'Affidabilità Trasporti', water: 'Potabilità Acqua',
    safeWater: 'Potabile', unsafeWater: 'Non Potabile',
    timeMatch: 'Time Match', yourDates: 'Le Tue Date', crowds: 'Folla',
    smartOptimizer: 'Smart Optimizer', savings: 'Risparmio',
    sweetSpot: 'Sweet Spot', bestAlt: 'Alternativa Migliore',
    survival: 'Logistica Sopravvivenza',
    cashDep: 'Uso Contante', englishLevel: 'Livello Inglese', laundry: 'Lavanderia',
    internet: 'Internet', safety: 'Sicurezza', electricity: 'Elettricità',
    savingsTitle: 'Strategia Risparmio', weeklySavings: 'Risparmio Settimanale', weeklySubtitle: 'Risparmio potenziale',
  },
  fr: {
    back: 'Retour', 
    backToResults: 'Retour aux Résultats',
    loading: 'Analyse en cours...', error: "Échec de l'analyse.",
    origin: 'Départ', destination: 'Destination', period: 'Période',
    estTotal: 'TOTAL EST.', flights: 'Vols', stay: 'Séjour', food: 'Nourriture', transport: 'Transports', extras: 'Extras',
    duration: 'Durée', days: 'Jours',
    export: 'Exporter', pdf: 'PDF', txt: 'TXT', copy: 'Copier',
    hub: 'Hub Logistique', weather: 'Météo', reliability: 'Fiabilité', water: 'Eau',
    safeWater: 'Potable', unsafeWater: 'Non Potable',
    timeMatch: 'Corresp. Temps', yourDates: 'Vos Dates', crowds: 'Foule',
    smartOptimizer: 'Optimiseur', savings: 'Économies',
    sweetSpot: 'Moment Idéal', bestAlt: 'Meilleure Alternative',
    survival: 'Logistique Survie',
    cashDep: 'Espèces', englishLevel: 'Niveau Anglais', laundry: 'Laverie',
    internet: 'Internet', safety: 'Sécurité', electricity: 'Électricité',
    savingsTitle: 'Stratégie Économie', weeklySavings: 'Économie Hebdo', weeklySubtitle: 'Économies potentielles',
  },
  es: {
    back: 'Volver', 
    backToResults: 'Volver a los Resultados',
    loading: 'Analizando tu viaje...', error: 'Análisis fallido.',
    origin: 'Origen', destination: 'Destino', period: 'Período',
    estTotal: 'TOTAL EST.', flights: 'Vuelos', stay: 'Alojamiento', food: 'Comida', transport: 'Transporte', extras: 'Extras',
    duration: 'Duración', days: 'Días',
    export: 'Exportar', pdf: 'PDF', txt: 'TXT', copy: 'Copiar',
    hub: 'Centro Logístico', weather: 'Clima', reliability: 'Fiabilidad', water: 'Agua',
    safeWater: 'Potable', unsafeWater: 'No Potable',
    timeMatch: 'Ajuste Temporal', yourDates: 'Tus Fechas', crowds: 'Multitud',
    smartOptimizer: 'Optimizador', savings: 'Ahorro',
    sweetSpot: 'Punto Ideal', bestAlt: 'Mejor Alternative',
    survival: 'Logística Supervivencia',
    cashDep: 'Efectivo', englishLevel: 'Nivel Inglés', laundry: 'Lavandería',
    internet: 'Internet', safety: 'Seguridad', electricity: 'Electricidad',
    savingsTitle: 'Estrategia Ahorro', weeklySavings: 'Ahorro Semanal', weeklySubtitle: 'Ahorro potencial',
  },
  zh: {
    back: '返回', 
    backToResults: '返回结果',
    loading: '分析中...', error: '分析失败。',
    origin: '出发地', destination: '目的地', period: '时间',
    estTotal: '预计总额', flights: '机票', stay: '住宿', food: '餐饮', transport: '交通', extras: '杂费',
    duration: '时长', days: '天',
    export: '导出', pdf: 'PDF', txt: 'TXT', copy: '复制',
    hub: '物流中心', weather: '天气', reliability: '可靠性', water: '水质',
    safeWater: '可饮用', unsafeWater: '不可饮用',
    timeMatch: '时间匹配', yourDates: '所选时段', crowds: '拥挤度',
    smartOptimizer: '智能优化', savings: '节省',
    sweetSpot: '最佳时机', bestAlt: '最佳替代',
    survival: '生存物流',
    cashDep: '现金依赖', englishLevel: '英语水平', laundry: '洗衣',
    internet: '网络', safety: '安全', electricity: '电力',
    savingsTitle: '省钱策略', weeklySavings: '每周储蓄', weeklySubtitle: '潜在储蓄',
  },
  ja: {
    back: '戻る', 
    backToResults: '結果に戻る',
    loading: '分析中...', error: '分析失敗。',
    origin: '出発地', destination: '目的地', period: '期間',
    estTotal: '推定合計', flights: '航空券', stay: '宿泊', food: '食事', transport: '交通', extras: 'その他',
    duration: '期間', days: '日',
    export: '出力', pdf: 'PDF', txt: 'TXT', copy: 'コピー',
    hub: 'ロジスティクス', weather: '天気', reliability: '信頼性', water: '水',
    safeWater: '飲料水', unsafeWater: '飲用不可',
    timeMatch: 'タイムマッチ', yourDates: '選択期間', crowds: '混雑',
    smartOptimizer: 'スマート最適化', savings: '節約',
    sweetSpot: '狙い目', bestAlt: '代替案',
    survival: '生存ロジスティクス',
    cashDep: '現金依存', englishLevel: '英語レベル', laundry: '洗濯',
    internet: 'インターネット', safety: '安全', electricity: '電力',
    savingsTitle: '節約戦略', weeklySavings: '週間節約', weeklySubtitle: '潜在的節約',
  },
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥',
  CHF: 'Fr', AUD: 'A$', INR: '₹', SGD: 'S$'
};

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

const getSavingsIcon = (category: string) => {
  switch (category) {
    case 'FOOD': return <Utensils size={16} className="text-emerald-500" />;
    case 'TRANSPORT': return <Bus size={16} className="text-emerald-500" />;
    case 'LODGING': return <Bed size={16} className="text-emerald-500" />;
    case 'SHOPPING': return <ShoppingBag size={16} className="text-emerald-500" />;
    case 'ENTERTAINMENT': return <Ticket size={16} className="text-emerald-500" />;
    default: return <CircleDollarSign size={16} className="text-emerald-500" />;
  }
};

export const TripPlanResultView: React.FC<Props> = ({ lang, params, onBack, showBackToResults }) => {
  const t = LABELS[lang] || LABELS.en;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDays, setCurrentDays] = useState(params.duration);
  const symbol = CURRENCY_SYMBOLS[params.currency] || params.currency;

  useEffect(() => {
    const fetchData = async () => {
      if (!params.origin || !params.destination || !params.period) {
        setError(t.error);
        setLoading(false);
        return;
      }
      
      // Pre-populate with estimated costs if available
      if (params.estimatedCosts) {
        setData({
          costs: {
            flights: params.estimatedCosts.flights,
            stay: params.estimatedCosts.accommodation,
            food: params.estimatedCosts.food,
            transport: params.estimatedCosts.transport,
            extras: params.estimatedCosts.extras
          },
          logistics: {}
        });
      } else {
        setData(null);
      }
      
      setLoading(true);
      try {
        const raw = await analyzeRoute(
          params.origin, params.destination, params.period,
          params.currency, params.duration, lang,
          params.estimatedCosts
        );
        let parsed;
        try {
          // Pulizia completa della risposta prima del parsing
          const cleaned = raw
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .replace(/^\s*`+/g, '')
            .replace(/`+\s*$/g, '')
            .trim();
          parsed = JSON.parse(cleaned);
        } catch {
          // Tentativo di estrarre JSON con regex
          const match = raw.match(/\{[\s\S]*\}/);
          if (match) {
            parsed = JSON.parse(match[0]);
          } else {
            throw new Error('Invalid JSON response');
          }
        }
        if (!parsed?.costs || !parsed?.logistics) throw new Error('Incomplete data');
        
        // If we had estimated costs, ensure we stick to them even if Gemini varied them slightly
        if (params.estimatedCosts) {
          parsed.costs = {
            flights: params.estimatedCosts.flights,
            stay: params.estimatedCosts.accommodation,
            food: params.estimatedCosts.food,
            transport: params.estimatedCosts.transport,
            extras: params.estimatedCosts.extras
          };
        }
        
        setData(parsed);
      } catch (e) {
        console.error('TripPlanResultView fetchData error:', e);
        setError(t.error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const regenerate = () => {
    setLoading(true);
    setError(null);
    analyzeRoute(params.origin, params.destination, params.period, params.currency, params.duration, lang, params.estimatedCosts)
      .then(raw => {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        const cleaned = jsonMatch ? jsonMatch[0] : raw;
        const parsed = JSON.parse(cleaned);
        if (!parsed?.costs || !parsed?.logistics) throw new Error('Incomplete');
        
        if (params.estimatedCosts) {
          parsed.costs = {
            flights: params.estimatedCosts.flights,
            stay: params.estimatedCosts.accommodation,
            food: params.estimatedCosts.food,
            transport: params.estimatedCosts.transport,
            extras: params.estimatedCosts.extras
          };
        }
        
        setData(parsed);
      })
      .catch((e) => {
        console.error('TripPlanResultView regenerate error:', e);
        setError(t.error);
      })
      .finally(() => setLoading(false));
  };

  const baseDays = params.duration;
  const scaledCosts = data ? {
    flights: data.costs?.flights || 0,
    stay: Math.round(((data.costs?.stay || 0) / baseDays) * currentDays),
    food: Math.round(((data.costs?.food || 0) / baseDays) * currentDays),
    transport: Math.round(((data.costs?.transport || 0) / baseDays) * currentDays),
    extras: Math.round(((data.costs?.extras || 0) / baseDays) * currentDays),
  } : null;

  const total = scaledCosts ? Object.values(scaledCosts).reduce((a, b) => a + b, 0) : 0;

  const chartData = scaledCosts ? [
    { name: t.flights, value: scaledCosts.flights, color: CHART_COLORS[0] },
    { name: t.stay, value: scaledCosts.stay, color: CHART_COLORS[1] },
    { name: t.food, value: scaledCosts.food, color: CHART_COLORS[2] },
    { name: t.transport, value: scaledCosts.transport, color: CHART_COLORS[3] },
    { name: t.extras, value: scaledCosts.extras, color: CHART_COLORS[4] },
  ] : [];

  const logistics = data?.logistics || {};

  const handleExport = async (format: 'pdf' | 'txt' | 'copy') => {
    if (!data || !scaledCosts) return;
    const textContent = generateTextContent(data, params, scaledCosts, symbol, currentDays, logistics, t);

    if (format === 'txt') {
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ClearVoyage_${params.destination.replace(/[^a-z0-9]/gi, '_')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'copy') {
      await navigator.clipboard.writeText(textContent);
    } else if (format === 'pdf') {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      const lg = logistics;
      const sc = scaledCosts!;
      const crowdScore = lg.timeMatch?.crowdScore || 5;
      const crowdColor = crowdScore <= 3 ? '#16a34a' : crowdScore <= 6 ? '#d97706' : '#dc2626';

      const hasWarning = data?.destinationWarning?.type && data.destinationWarning.type !== 'null';
      const p = hasWarning ? '14px' : '20px';
      const mb = hasWarning ? '12px' : '16px';

      const costItems = [
        { label: t.flights, value: sc.flights, color: '#3b82f6', perDay: null, local: null },
        { label: t.stay, value: sc.stay, color: '#8b5cf6', perDay: currentDays > 1 ? Math.round(sc.stay / currentDays) : null, unit: lang === 'it' ? 'notte' : 'night', local: data.costs?.stayLocal },
        { label: t.food, value: sc.food, color: '#f59e0b', perDay: currentDays > 1 ? Math.round(sc.food / currentDays) : null, unit: lang === 'it' ? 'giorno' : 'day', local: data.costs?.foodLocal },
        { label: t.transport, value: sc.transport, color: '#ef4444', perDay: currentDays > 1 ? Math.round(sc.transport / currentDays) : null, unit: lang === 'it' ? 'giorno' : 'day', local: data.costs?.transportLocal },
        { label: t.extras, value: sc.extras, color: '#10b981', perDay: currentDays > 1 ? Math.round(sc.extras / currentDays) : null, unit: lang === 'it' ? 'giorno' : 'day', local: data.costs?.extrasLocal },
      ];
      const maxValue = Math.max(...costItems.map(i => i.value));

      const commonStyle = `
        <style>
          * { box-sizing:border-box; margin:0; padding:0; }
          .card { background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:16px; padding:${p}; margin-bottom:${mb}; }
          .label { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:1.2px; color:#64748b; margin-bottom:6px; }
          .value { font-size:15px; font-weight:800; color:#0f172a; }
          .desc { font-size:11px; color:#64748b; margin-top:4px; line-height:1.5; }
          .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
          .warning-box { padding:10px 12px; border-radius:12px; border:1px solid; font-size:10.5px; margin-bottom:14px; line-height:1.4; }
          .warning-inaccessible { background:#fef2f2; border-color:#fecaca; color:#991b1b; }
          .warning-advisory { background:#fffbeb; border-color:#fef3c7; color:#92400e; }
        </style>
      `;

      const container1 = document.createElement('div');
      container1.style.cssText = 'position:fixed;top:-99999px;left:0;width:794px;background:#ffffff;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:36px;box-sizing:border-box;';
      container1.innerHTML = `
        ${commonStyle}
        <!-- HEADER -->
        <div style="margin-bottom:24px; padding-bottom:16px; border-bottom:3px solid #10b981;">
          <div style="font-size:26px; font-weight:900; color:#0f172a; letter-spacing:-0.5px;">ClearVoyage Report</div>
          <div style="font-size:13px; color:#64748b; margin-top:6px;">${params.origin} → ${data?.destinationWarning?.alternativeDestination || params.destination}</div>
          <div style="font-size:12px; color:#94a3b8; margin-top:2px;">${params.period} · ${currentDays} days · ${new Date().toLocaleDateString()}</div>
        </div>

        ${hasWarning ? `
          <div class="warning-box ${data.destinationWarning.type === 'inaccessible' ? 'warning-inaccessible' : 'warning-advisory'}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12" style="display:inline;vertical-align:middle;margin-right:4px;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <strong>${data.destinationWarning.type.toUpperCase()}:</strong> ${data.destinationWarning.message}
            ${data.destinationWarning.type === 'inaccessible' ? `<br/><br/>This report is based on ${data.destinationWarning.alternativeDestination} as the recommended accessible gateway city.` : ''}
          </div>
        ` : ''}

        <!-- EST. TOTAL + BARRE -->
        <div class="card" style="margin-bottom:${mb};">
          <div class="label">EST. TOTAL</div>
          <div style="font-size:32px; font-weight:900; color:#0f172a; margin-bottom:16px; letter-spacing:-1px;">${symbol}${total.toLocaleString()}</div>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${costItems.map(item => {
              const pct = maxValue > 0 ? Math.round((item.value / maxValue) * 100) : 0;
              return `
                <div>
                  <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                      <div style="width:10px; height:10px; border-radius:50%; background:${item.color}; flex-shrink:0;"></div>
                      <div>
                        <span style="font-size:11px; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:0.5px;">${item.label}</span>
                        ${item.perDay ? `<span style="font-size:9px; color:#94a3b8; font-weight:500; margin-left:6px;">${symbol}${item.perDay.toLocaleString()} /${item.unit}</span>` : ''}
                      </div>
                    </div>
                    <div style="text-align:right;">
                      <div style="font-size:12px; font-weight:800; color:#0f172a;">${symbol}${item.value.toLocaleString()}</div>
                      ${item.local ? `<div style="font-size:9px; color:#94a3b8; font-weight:500;">${item.local}</div>` : ''}
                    </div>
                  </div>
                  <div style="background:#e2e8f0; border-radius:999px; height:8px; overflow:hidden;">
                    <div style="background:${item.color}; width:${pct}%; height:100%; border-radius:999px;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- LOGISTICS HUB + TIME MATCH -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:${mb};">
          <div class="card" style="margin-bottom:0; padding:${p};">
            <div class="label">Logistics Hub</div>
            <div style="display:flex; flex-direction:column; gap:10px; margin-top:6px;">
              <div>
                <div class="label">Weather</div>
                <div class="value" style="font-size:14px;">${lg.weather?.tempRange || '—'}</div>
                <div class="desc" style="font-size:10px;">${lg.weather?.condition || ''}</div>
              </div>
              <div>
                <div class="label">Reliability</div>
                <div class="value" style="font-size:14px;">${Math.round((lg.reliability?.score || 0) <= 1 ? (lg.reliability?.score || 0) * 100 : lg.reliability?.score || 0)}/100</div>
              </div>
              <div><div class="label">Water Potability</div><div style="font-size:13px; font-weight:800; color:${lg.water?.potable ? '#10b981' : '#ef4444'};">${lg.water?.potable ? 'Safe to Drink' : 'Not Safe'}</div><div class="desc" style="font-size:10px;">${lg.water?.description || ''}</div></div>
            </div>
          </div>
          <div class="card" style="margin-bottom:0; padding:${p};">
            <div class="label" style="color:#d97706;"><svg viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.5" width="12" height="12" style="display:inline;vertical-align:middle;margin-right:4px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Time Match</div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; margin-top:6px;">
              <span style="font-size:10px; font-weight:700; color:#64748b; text-transform:uppercase;">Your Dates</span>
              <span style="font-size:10px; font-weight:800; color:${crowdColor}; background:${crowdColor}15; padding:2px 8px; border-radius:6px;">Crowds ${crowdScore}/10</span>
            </div>
            <div style="font-size:10.5px; color:#475569; line-height:1.5;">${lg.timeMatch?.chosenPeriodAnalysis || '—'}</div>
          </div>
        </div>

        <!-- SMART OPTIMIZER -->
        <div style="background:#f0fdf4; border:1.5px solid #86efac; border-radius:16px; padding:${p}; margin-bottom:${mb};">
          <div style="font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:#16a34a; margin-bottom:10px;"><svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" width="14" height="14" style="display:inline;vertical-align:middle;margin-right:4px;"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg> Smart Optimizer</div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div style="flex:1; padding-right:20px;">
              <div style="font-size:18px; font-weight:900; color:#0f172a; margin-bottom:4px;">${lg.timeMatch?.smartOptimizer?.period || '—'}</div>
              <div style="font-size:10.5px; color:#64748b; line-height:1.4;">${lg.timeMatch?.smartOptimizer?.reason || ''}</div>
            </div>
            <div style="text-align:right; flex-shrink:0;">
              <div style="font-size:10px; font-weight:700; text-transform:uppercase; color:#64748b; margin-bottom:1px;">Savings</div>
              <div style="font-size:28px; font-weight:900; color:#10b981;">+${lg.timeMatch?.smartOptimizer?.savingsPercent || 0}%</div>
            </div>
          </div>
        </div>

        <!-- SWEET SPOT -->
        <div class="card" style="margin-bottom:${mb};">
          <div style="font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:#10b981; margin-bottom:6px;"><svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" width="12" height="12" style="display:inline;vertical-align:middle;margin-right:4px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Sweet Spot</div>
          <div style="font-size:10px; font-weight:600; color:#94a3b8; text-transform:uppercase; margin-bottom:2px;">Best Alternative</div>
          <div style="font-size:16px; font-weight:900; color:#0f172a; margin-bottom:4px;">${lg.sweetSpot?.bestPeriod || '—'}</div>
          <div style="font-size:10.5px; color:#64748b; line-height:1.4;">${lg.sweetSpot?.reason || ''}</div>
        </div>
      `;

      const container2 = document.createElement('div');
      container2.style.cssText = 'position:fixed;top:-99999px;left:0;width:794px;background:#ffffff;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:36px;box-sizing:border-box;';
      container2.innerHTML = `
        ${commonStyle}
        <!-- SURVIVAL LOGISTICS -->
        <div class="card" style="margin-bottom:16px;">
          <div class="label" style="margin-bottom:14px; color:#10b981;"><svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" width="12" height="12" style="display:inline;vertical-align:middle;margin-right:4px;"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> Survival Logistics</div>
          <div class="grid2">
            ${[
              { label: 'Cash Dependency', value: lg.cashDependency?.level, desc: lg.cashDependency?.description, color: '#10b981', bg: '#f0fdf4', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>' },
              { label: 'English Level', value: lg.language?.englishLevel, desc: `${lg.language?.description}${lg.language?.localLanguages ? `<div style="font-style:italic;margin-top:4px;">${lg.language.localLanguages.replace(/;/g, ' ·')}</div>` : ''}`, color: '#8b5cf6', bg: '#f5f3ff', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/></svg>' },
              { label: 'Laundry', value: lg.laundry?.cost, desc: lg.laundry?.description, color: '#f97316', bg: '#fff7ed', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>' },
              { label: 'Internet', value: lg.internet?.quality, desc: lg.internet?.description, color: '#3b82f6', bg: '#eff6ff', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>' },
              { label: 'Safety', value: lg.safety?.level, desc: lg.safety?.description, color: lg.safety?.level === 'Very Safe' ? '#10b981' : lg.safety?.level === 'Exercise Caution' ? '#f59e0b' : lg.safety?.level === 'Stay Alert' ? '#f97316' : '#ef4444', bg: lg.safety?.level === 'Very Safe' ? '#f0fdf4' : lg.safety?.level === 'Exercise Caution' ? '#fffbeb' : lg.safety?.level === 'Stay Alert' ? '#fff7ed' : '#fef2f2', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
              { label: 'Electricity', value: `Type ${lg.electricity?.plugType}`, desc: `${lg.electricity?.voltage}, ${lg.electricity?.frequency}`, color: '#f59e0b', bg: '#fffbeb', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' },
            ].map(i => `
              <div style="background:#ffffff; border:1.5px solid #e2e8f0; border-radius:12px; padding:14px; display:flex; gap:12px; align-items:flex-start;">
                <div style="width:36px; height:36px; border-radius:10px; background:${i.bg}; display:flex; align-items:center; justify-content:center; flex-shrink:0; color:${i.color};">
                  ${i.svg}
                </div>
                <div>
                  <div style="font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:#64748b; margin-bottom:4px;">${i.label}</div>
                  <div style="font-size:14px; font-weight:800; color:#0f172a;">${i.value || '—'}</div>
                  <div style="font-size:11px; color:#64748b; margin-top:3px; line-height:1.5;">${i.desc || ''}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- SAVINGS STRATEGY -->
        <div class="card">
          <div class="label" style="margin-bottom:14px;">Savings Strategy</div>
          <div style="background:#f0fdf4; border:1.5px solid #86efac; border-radius:12px; padding:16px; margin-bottom:14px; display:flex; align-items:center; gap:16px;">
            <div style="font-size:30px; font-weight:900; color:#10b981; flex-shrink:0;">${symbol}${lg.savingsStrategy?.weeklySavings}/week</div>
            <div>
              <div style="font-size:13px; font-weight:700; color:#0f172a;">Est. Weekly Savings</div>
              <div style="font-size:11px; color:#64748b;">Potential savings</div>
            </div>
          </div>
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${(lg.savingsStrategy?.strategies || []).map((s: any) => `
              <div style="background:#ffffff; border:1.5px solid #e2e8f0; border-radius:12px; padding:14px;">
                <div style="font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:0.8px; color:#10b981; margin-bottom:5px;">${s.title}</div>
                <div style="font-size:11px; color:#475569; line-height:1.5;">${s.description}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      document.body.appendChild(container1);
      document.body.appendChild(container2);

      try {
        await new Promise(r => setTimeout(r, 500));

        const canvas1 = await html2canvas(container1, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          windowWidth: 794,
        });

        const canvas2 = await html2canvas(container2, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          windowWidth: 794,
        });

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        
        // Add Page 1
        const imgData1 = canvas1.toDataURL('image/png');
        const imgHeight1 = (canvas1.height * pdfWidth) / canvas1.width;
        pdf.addImage(imgData1, 'PNG', 0, 0, pdfWidth, imgHeight1);

        // Add Page 2
        pdf.addPage();
        const imgData2 = canvas2.toDataURL('image/png');
        const imgHeight2 = (canvas2.height * pdfWidth) / canvas2.width;
        pdf.addImage(imgData2, 'PNG', 0, 0, pdfWidth, imgHeight2);

        pdf.save(`ClearVoyage_${params.destination.replace(/[^a-z0-9]/gi, '_')}.pdf`);
      } finally {
        document.body.removeChild(container1);
        document.body.removeChild(container2);
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950">
      <Loader2 className="animate-spin" size={48} />
      <p className="font-bold text-lg">{t.loading}</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-red-400 p-8 text-center bg-white dark:bg-slate-950">
      <AlertCircle size={48} />
      <p className="font-bold">{error}</p>
      <button onClick={onBack} className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors uppercase tracking-widest text-xs">{t.back}</button>
    </div>
  );

  if (!data || !scaledCosts) return null;

  const crowdScore = logistics.timeMatch?.crowdScore || 5;
  const crowdColor = crowdScore <= 3 ? '#10b981' : crowdScore <= 6 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 overflow-y-auto">
      <div className="sticky top-0 z-40 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold transition-colors">
          <ArrowLeft size={18} /> {showBackToResults ? t.backToResults : t.back}
        </button>
      </div>

      <div id="trip-report-content" className="max-w-2xl mx-auto w-full px-4 py-6 space-y-6 pb-16">
        <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800">
          <div className="space-y-3">
            {[
              { icon: <Plane size={16} className="text-slate-500 dark:text-slate-400" />, label: t.origin, value: params.origin },
              { icon: <MapPin size={16} className="text-rose-400" />, label: t.destination, value: data?.destinationWarning?.alternativeDestination || params.destination },
              { icon: <Calendar size={16} className="text-blue-400" />, label: t.period, value: params.period },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700 shadow-sm">{icon}</div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</p>
                  <p className="font-bold text-slate-900 dark:text-white">{value}</p>
                </div>
              </div>
            ))}
            <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl px-3 py-1.5 border border-slate-100 dark:border-slate-700 shadow-sm">
              <Clock size={14} className="text-slate-500 dark:text-slate-400" />
              <span className="text-sm font-black text-slate-900 dark:text-white">{currentDays} {t.days}</span>
            </div>
          </div>

          {data?.destinationWarning?.type && 
           (data.destinationWarning.type === 'inaccessible' || data.destinationWarning.type === 'advisory') && 
           data.destinationWarning.message && 
           !data.destinationWarning.message.toLowerCase().includes('standard travel advisory') && (
            <div className={`mt-4 p-4 rounded-2xl border flex gap-3 ${
              data.destinationWarning.type === 'inaccessible' 
                ? 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20 text-red-700 dark:text-red-400' 
                : 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 text-amber-700 dark:text-amber-400'
            }`}>
              <AlertTriangle className="shrink-0 mt-0.5" size={18} />
              <div className="text-xs font-medium leading-relaxed">
                {data.destinationWarning.type === 'inaccessible' ? (
                  <span>
                    <strong>{params.destination}</strong> {lang === 'it' ? 'è attualmente inaccessibile.' : lang === 'fr' ? 'è attualmente inaccessibile.' : 'is currently inaccessible.'} {data.destinationWarning.message}
                    <br /><br />
                    {lang === 'it' ? 'Questo report si basa su' : lang === 'fr' ? 'Ce rapport est basé sur' : 'This report is based on'} <strong>{data.destinationWarning.alternativeDestination}</strong>, {lang === 'it' ? 'la destinazione alternativa raccomandata. Tutti i costi e la logistica si riferiscono a' : 'the recommended accessible gateway. All costs and logistics refer to'} {data.destinationWarning.alternativeDestination}.
                  </span>
                ) : (
                  <span>{data.destinationWarning.message}</span>
                )}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/50 mt-2">
            <button onClick={regenerate} className="flex items-center gap-2 text-slate-400 hover:text-emerald-500 font-bold transition-colors text-[10px] uppercase tracking-widest group">
              <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" /> {lang === 'it' ? 'Rigenera' : lang === 'fr' ? 'Régénérer' : lang === 'es' ? 'Regenerar' : 'Regenerate'}
            </button>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t.estTotal}</span>
            </div>
            <ExportTools onExport={handleExport} labels={{ export: t.export, pdf: t.pdf, txt: t.txt, copy: t.copy }} />
          </div>
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={58} outerRadius={85} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `${symbol}${Number(value).toLocaleString()}`} contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: 'white', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{symbol}{total.toLocaleString()}</span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{t.estTotal}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4 mb-6">
            {chartData.map((item) => {
              const categoryKey = Object.keys(t).find(key => t[key] === item.name)?.toLowerCase();
              const mapKey = categoryKey === 'flights' ? 'flights' : categoryKey === 'stay' ? 'stay' : categoryKey === 'food' ? 'food' : categoryKey === 'transport' ? 'transport' : 'extras';
              const localVal = data.costs?.[`${mapKey}Local`];
              const perDay = (mapKey !== 'flights' && currentDays > 1) ? Math.round(item.value / currentDays) : null;
              const unit = mapKey === 'stay' ? (lang === 'it' ? 'notte' : lang === 'fr' ? 'nuit' : lang === 'es' ? 'noche' : 'night') : (lang === 'it' ? 'giorno' : lang === 'fr' ? 'jour' : lang === 'es' ? 'día' : 'day');

              return (
                <div key={item.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <div>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block leading-none">{item.name}</span>
                      {perDay && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{symbol}{perDay.toLocaleString()} /{unit}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900 dark:text-white block leading-none">{symbol}{item.value.toLocaleString()}</span>
                    {localVal && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{localVal}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-slate-100/80 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-slate-500 dark:text-slate-400" />
                <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t.duration}</span>
              </div>
              <span className="text-sm font-black text-slate-900 dark:text-white">{currentDays} {t.days}</span>
            </div>
            <input type="range" min={1} max={30} value={currentDays}
              onChange={(e) => setCurrentDays(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-emerald-500 bg-slate-200 dark:bg-slate-700"
              style={{ background: `linear-gradient(to right, #10b981 ${((currentDays - 1) / 29) * 100}%, transparent ${((currentDays - 1) / 29) * 100}%)` }}
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-slate-400 dark:text-slate-500">1</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">30</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t.hub}</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { icon: <Sun size={14} className="text-amber-400" />, label: t.weather, value: logistics.weather?.tempRange, valueClass: 'text-slate-900 dark:text-white' },
              { icon: <TrendingUp size={14} className="text-blue-400" />, label: t.reliability, value: `${Math.round(logistics.reliability?.score <= 1 ? (logistics.reliability?.score || 0) * 100 : logistics.reliability?.score || 0)}/100`, valueClass: 'text-slate-900 dark:text-white' },
              { icon: <Droplet size={14} className="text-cyan-400" />, label: t.water, value: logistics.water?.potable ? t.safeWater : t.unsafeWater, valueClass: logistics.water?.potable ? 'text-emerald-500' : 'text-red-500' },
            ].map(({ icon, label, value, valueClass }) => (
              <div key={label} className="bg-slate-100 dark:bg-slate-800/40 rounded-2xl p-3 text-center border border-slate-200 dark:border-slate-700/30">
                <div className="flex justify-center mb-1">{icon}</div>
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                <p className={`text-xs font-black ${valueClass}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-amber-500" />
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{t.timeMatch}</span>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/30 mb-4">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t.yourDates}</span>
              <span className="text-sm font-black px-2 py-0.5 rounded-lg" style={{ color: crowdColor, backgroundColor: `${crowdColor}20` }}>
                {t.crowds} {crowdScore}/10
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{logistics.timeMatch?.chosenPeriodAnalysis}</p>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Brain size={14} className="text-emerald-400" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{t.smartOptimizer}</span>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800/40 rounded-2xl p-4 border border-emerald-500/10 mb-4 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-4">
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1">{logistics.timeMatch?.smartOptimizer?.period}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{logistics.timeMatch?.smartOptimizer?.reason}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t.savings}</p>
                <p className="text-3xl font-black text-emerald-500">+{logistics.timeMatch?.smartOptimizer?.savingsPercent}%</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Calendar size={14} className="text-emerald-400" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{t.sweetSpot}</span>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/30">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t.bestAlt}</p>
            <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1">{logistics.sweetSpot?.bestPeriod}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{logistics.sweetSpot?.reason}</p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t.survival}</span>
          </div>
          <div className="space-y-3">
            {[
              { icon: <CreditCard size={22} className="text-emerald-400" />, label: t.cashDep, value: logistics.cashDependency?.level, desc: logistics.cashDependency?.description, bg: 'bg-emerald-500/10' },
              { 
                icon: <Languages size={22} className="text-purple-400" />, 
                label: t.englishLevel, 
                value: logistics.language?.englishLevel, 
                desc: (
                  <div>
                    <p className="mb-1">{logistics.language?.description}</p>
                    {logistics.language?.localLanguages && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium italic">
                        {logistics.language.localLanguages.replace(/;/g, ' ·')}
                      </p>
                    )}
                  </div>
                ), 
                bg: 'bg-purple-500/10' 
              },
              { icon: <Shirt size={22} className="text-orange-400" />, label: t.laundry, value: logistics.laundry?.cost, desc: logistics.laundry?.description, bg: 'bg-orange-500/10' },
              { icon: <Wifi size={22} className="text-blue-400" />, label: t.internet, value: logistics.internet?.quality, desc: logistics.internet?.description, bg: 'bg-blue-500/10' },
              { 
                icon: (
                  <div className={
                    logistics.safety?.level === 'Very Safe' ? 'text-emerald-500' :
                    logistics.safety?.level === 'Exercise Caution' ? 'text-amber-500' :
                    logistics.safety?.level === 'Stay Alert' ? 'text-orange-500' :
                    logistics.safety?.level === 'High Vigilance' ? 'text-red-500' : 'text-slate-400'
                  }>
                    <Shield size={22} />
                  </div>
                ), 
                label: t.safety, 
                value: logistics.safety?.level, 
                desc: logistics.safety?.description, 
                bg: logistics.safety?.level === 'Very Safe' ? 'bg-emerald-500/10' :
                    logistics.safety?.level === 'Exercise Caution' ? 'bg-amber-500/10' :
                    logistics.safety?.level === 'Stay Alert' ? 'bg-orange-500/10' :
                    logistics.safety?.level === 'High Vigilance' ? 'bg-red-500/10' : 'bg-slate-500/10'
              },
              { icon: <Zap size={22} className="text-yellow-400" />, label: t.electricity, value: `Type ${logistics.electricity?.plugType}`, desc: `${logistics.electricity?.voltage}, ${logistics.electricity?.frequency}`, bg: 'bg-yellow-500/10' },
            ].map(({ icon, label, value, desc, bg }) => (
              <div key={label} className="bg-slate-100 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/30 flex gap-4">
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shrink-0 border border-slate-50 dark:border-slate-700 shadow-sm`}>{icon}</div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white mb-0.5">{value}</p>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {typeof desc === 'string' ? desc : desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {logistics.savingsStrategy && (
          <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-5">
              <Lightbulb size={16} className="text-emerald-400" />
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t.savingsTitle}</span>
            </div>
            <div className="bg-emerald-900/20 rounded-2xl p-5 mb-5 border border-emerald-500/10 relative overflow-hidden">
              <div className="flex items-center gap-5">
                <div className="bg-white dark:bg-slate-900/50 rounded-2xl px-5 py-4 text-center border border-emerald-500/20 shadow-sm shrink-0">
                  <span className="text-3xl font-black text-emerald-500 dark:text-emerald-400">{symbol}{logistics.savingsStrategy.weeklySavings}</span>
                </div>
                <div>
                  <h4 className="text-slate-900 dark:text-white font-black text-base mb-0.5">{t.weeklySavings}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.weeklySubtitle}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {logistics.savingsStrategy.strategies?.map((strategy: any, idx: number) => (
                <div key={idx} className="bg-slate-100 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/30">
                  <div className="flex items-center gap-2 mb-2">
                    {getSavingsIcon(strategy.category)}
                    <span className="text-[10px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-widest">{strategy.title}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{strategy.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
