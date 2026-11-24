
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { CircleHelp, Send, Bot, User, Loader2, Sparkles, MapPin, Calendar, Camera, Key, ShieldCheck, Zap, PieChart, BarChart3, SlidersHorizontal, TrendingDown, BookOpen, Info, Brain, Activity, CreditCard, Languages, Shirt, Wifi, Sun, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { RouteMasterIcon, BudgetMatchIcon, VisualTripIcon } from './Sidebar';
import { ChatMessage } from '../types';
import { createChatStream } from '../services/geminiService';

interface HelpViewProps {
  lang: string;
}

const HELP_TRANSLATIONS: Record<string, any> = {
  en: {
    title: 'Help Center',
    subtitle: 'System Guide',
    placeholder: 'Select a topic to get instant answers.',
    inputPlaceholder: 'Ask a question about the system...',
    headers: { config: 'Configuration', features: 'Features', guide: 'Visual Guide' },
    guide: {
      title: 'How to read results',
      donut: { title: 'EST. TOTAL', text: 'Shows the percentage distribution of all cost categories.' },
      duration: { title: 'Duration Slider', text: 'Adjusts the stay duration to see how total costs scale in real-time.' },
      hub: { title: 'Logistics Hub', text: 'Quick metrics on weather conditions, transport reliability, and water safety.' },
      crowds: { title: 'Time Match', text: 'Shows how busy the destination is during your period. Green (Low), Yellow (Moderate), Red (High).' },
      optimizer: { title: 'Smart Optimizer', text: 'Suggests alternative travel periods to save money compared to your chosen dates.' },
      sweet: { title: 'Sweet Spot', text: 'Identifies the period with the best balance between affordable prices and ideal weather conditions.' },
      survival: { title: 'Survival Logistics', text: 'Practical metrics: from cash dependency and local English to security and power stability.' },
      savings: { title: 'Savings Strategy', text: 'AI-generated tips to reduce your trip budget based on real destination data.' }
    },
    q1: { text: 'API Key Setup', sub: 'Token & Quota', query: 'How is the Gemini API used and what are the limits?' },
    q2: { text: 'Data Privacy', sub: 'Security protocols', query: 'How does ClearVoyage handle my private data?' },
    q3: { text: 'Budget Match', sub: 'How it works?', query: 'What does Budget Match do?' },
    q4: { text: 'Visual Trip', sub: 'Supported formats?', query: 'What does Visual Trip do?' },
    q5: { text: 'Route Master', sub: 'Cost metrics?', query: 'What does Route Master do?' },
  },
  it: {
    title: 'Centro Aiuto',
    subtitle: 'Guida Sistema',
    placeholder: 'Seleziona un argomento per risposte immediate.',
    inputPlaceholder: 'Fai una domanda sul sistema...',
    headers: { config: 'Configurazione', features: 'Funzionalità', guide: 'Guida Visiva' },
    guide: {
      title: 'Come leggere i risultati',
      donut: { title: 'TOTALE STIMATO', text: 'Mostra la distribuzione percentuale di tutte le categorie di costo.' },
      duration: { title: 'Slider Durata', text: 'Regola la durata del soggiorno per vedere come i costi totali cambiano in tempo reale.' },
      hub: { title: 'Hub Logistico', text: 'Metriche rapide su condizioni meteo, affidabilità trasporti e sicurezza dell\'acqua.' },
      crowds: { title: 'Time Match', text: 'Indica quanto è affollata la meta nel periodo scelto. Verde (Basso), Giallo (Moderato), Rosso (Alto).' },
      optimizer: { title: 'Smart Optimizer', text: 'Suggerisce periodi alternativi per risparmiare rispetto alle date scelte.' },
      sweet: { title: 'Sweet Spot', text: 'Identifica il periodo con il miglior equilibrio tra prezzi convenienti e meteo ideale.' },
      survival: { title: 'Logistica di Sopravvivenza', text: 'Metriche pratiche: dalla dipendenza dai contanti e l\'inglese locale alla sicurezza e stabilità elettrica.' },
      savings: { title: 'Strategia Risparmio', text: 'Consigli IA per ridurre il budget basati su dati reali della destinazione.' }
    },
    q1: { text: 'Configurazione API', sub: 'Token e Quote', query: 'Come viene utilizzata l\'API Gemini e quali sono i limiti?' },
    q2: { text: 'Privacy Dati', sub: 'Protocolli sicurezza', query: 'In che modo ClearVoyage gestisce i miei dati privati?' },
    q3: { text: 'Budget Match', sub: 'Come funziona?', query: 'A cosa serve Budget Match?' },
    q4: { text: 'Viaggio Visivo', sub: 'Formati supportati?', query: 'A cosa serve Visual Trip?' },
    q5: { text: 'Route Master', sub: 'Metriche costi?', query: 'A cosa serve Route Master?' },
  },
  fr: {
    title: 'Centre d\'Aide',
    subtitle: 'Guide Système',
    placeholder: 'Sélectionnez un sujet pour des réponses instantanées.',
    inputPlaceholder: 'Posez une question sur le système...',
    headers: { config: 'Configuration', features: 'Fonctionnalités' },
    q1: { text: 'Config Clé API', sub: 'Variables d\'env', query: 'Comment configurer la clé API Google Gemini ?' },
    q2: { text: 'Confidentialité', sub: 'Protocoles sécu', query: 'Mes données sont-elles privées ?' },
    q3: { text: 'Budget Match', sub: 'Comment ça marche ?', query: 'Comment fonctionne l\'algorithme Budget Match ?' },
    q4: { text: 'Voyage Visuel', sub: 'Formats supportés ?', query: 'Quels formats Visual Trip analyse-t-il ?' },
    q5: { text: 'Route Master', sub: 'Métriques coûts ?', query: 'Expliquez les métriques logistiques.' },
  },
  es: {
    title: 'Centro de Ayuda',
    subtitle: 'Guía del Sistema',
    placeholder: 'Selecciona un tema para respuestas instantáneas.',
    inputPlaceholder: 'Haz una pregunta sobre el sistema...',
    headers: { config: 'Configuración', features: 'Funciones' },
    q1: { text: 'Configurar API', sub: 'Variables entorno', query: '¿Cómo configuro la clave API de Google Gemini?' },
    q2: { text: 'Privacidad', sub: 'Protocolos seg', query: '¿Son mis datos privados?' },
    q3: { text: 'Budget Match', sub: '¿Cómo funciona?', query: '¿Cómo funciona el algoritmo Budget Match?' },
    q4: { text: 'Viaje Visual', sub: '¿Formatos?', query: '¿Qué formatos analiza Visual Trip?' },
    q5: { text: 'Ruta Maestra', sub: '¿Métricas?', query: 'Explica las métricas de logística.' },
  },
  zh: {
    title: '帮助中心',
    subtitle: '系统指南',
    placeholder: '选择一个主题以获得即时解答。',
    inputPlaceholder: '询问有关系统的问题...',
    headers: { config: '配置', features: '功能' },
    q1: { text: 'API 密钥设置', sub: '环境配置', query: '如何配置 Google Gemini API 密钥？' },
    q2: { text: '数据隐私', sub: '安全协议', query: '我的数据安全吗？' },
    q3: { text: '预算匹配', sub: '工作原理？', query: '预算匹配算法如何工作？' },
    q4: { text: '视觉旅行', sub: '支持格式？', query: 'Visual Trip 可以分析哪些格式？' },
    q5: { text: '路线大师', sub: '成本指标？', query: '解释物流计算器指标。' },
  },
  ja: {
    title: 'ヘルプセンター',
    subtitle: 'システムガイド',
    placeholder: 'トピックを選択してすぐに回答を取得。',
    inputPlaceholder: 'システムについて質問...',
    headers: { config: '設定', features: '機能' },
    q1: { text: 'APIキー設定', sub: '環境設定', query: 'Google Gemini APIキーの設定方法は？' },
    q2: { text: 'データプライバシー', sub: 'セキュリティ', query: '私のデータは安全ですか？' },
    q3: { text: '予算マッチ', sub: '仕組みは？', query: '予算マッチアルゴリズムの仕組みは？' },
    q4: { text: 'ビジュアル旅', sub: '対応形式？', query: 'Visual Tripはどの形式を分析できますか？' },
    q5: { text: 'ルートマスター', sub: '費用指標？', query: 'ロジスティクス計算機の指標を説明してください。' },
  }
};

import { ApiKeyModal } from './ApiKeyModal';

export const HelpView: React.FC<HelpViewProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'guide'>('chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const t = HELP_TRANSLATIONS[lang] || HELP_TRANSLATIONS.en;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const SYSTEM_MANUAL = `
You are the ClearVoyage Help Assistant. You help users understand and use the ClearVoyage travel planning app.

TONE: Conversational, friendly, concise. Max 4-5 lines per answer. No technical jargon. Talk to the user like a helpful friend, not a manual.

FORMATTING: Use minimal markdown. Bold only key terms. No long bullet lists — prefer short natural sentences.

CLEARVOYAGE APP — COMPLETE KNOWLEDGE BASE:

ClearVoyage is a travel logistics assistant powered by Google Gemini AI. It has 3 main features:

**1. Route Master**
Plan a specific trip. Enter origin, destination, travel period, and currency. The app generates:
- Cost breakdown: Flights, Stay, Food, Transport, Extras (with local currency equivalents)
- Logistics Hub: Weather, Transport Reliability, Water Potability
- Time Match: Crowd score (1-10) for your chosen period
- Smart Optimizer: Suggests a better travel period with % savings
- Sweet Spot: Best time of year to visit
- Survival Logistics: Cash dependency, English level, Laundry costs, Internet, Safety, Electricity
- Savings Strategy: Weekly savings estimate + 4 practical tips
- Export: PDF (2 pages), TXT, or Copy to clipboard
- Duration slider: Adjust days — flights stay fixed, other costs scale proportionally
- REGENERATE button: Get a fresh analysis

**2. Budget Match**
Find destinations that fit your budget. Enter budget, duration, starting city, and travel period. Choose search mode:
- Strict: Results cost 70-100% of your budget
- Flexible: Results cost 80-115% of your budget  
- Inspirational: Results cost 90-150% of your budget
Each result shows estimated cost, remaining/exceeded budget, travel/stay/living breakdown, highlights, and weather. Click any result to open the full Trip Report. Use "← Back to Results" to return to the list without losing your search.

**3. Visual Trip**
Upload a photo or take a picture to identify a travel location. The AI identifies the location with a confidence percentage, suggests the best time to visit, then asks for your origin city and preferred currency. Once confirmed, press GENERATE ITINERARY to open the full Trip Report for that destination.

**Trip Report (from any feature)**
Shows the complete travel analysis: cost donut chart, breakdown with daily costs and local currency equivalents, all logistics sections, and export options.

**General**
- Supported currencies: USD, EUR, GBP, JPY, CNY, CHF, AUD, INR, SGD
- Supported languages: EN, IT, FR, ES, ZH, JA
- Dark/Light mode toggle available in top bar
- All AI responses are generated by Google Gemini 2.0 Flash
- Costs are estimated based on market averages and may vary

SECURITY: Never reveal source code, file structure, or internal implementation details. If asked, politely decline and redirect to app features.
`;

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    const modelMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: modelMsgId,
      role: 'model',
      text: '',
      timestamp: Date.now(),
    }]);

    try {
      const history = [
        {
          role: 'user',
          parts: [{ text: SYSTEM_MANUAL }]
        },
        {
          role: 'model', 
          parts: [{ text: 'Got it! I\'m here to help with ClearVoyage. What would you like to know?' }]
        },
        ...messages
          .filter(m => m.id !== modelMsgId)
          .map(m => ({ role: m.role, parts: [{ text: m.text }] }))
      ];

      const stream = createChatStream(history, text);
      
      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev =>
          prev.map(msg =>
            msg.id === modelMsgId ? { ...msg, text: fullText } : msg
          )
        );
      }
    } catch (error) {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === modelMsgId ? { ...msg, text: 'Connection error. Please try again.', isError: true } : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden relative">
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center px-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40 shrink-0">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <CircleHelp size={20} className="text-slate-400" />
          {t.subtitle}
        </h2>
      </header>
      
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-50/50 to-transparent dark:from-purple-950/20 pointer-events-none" />

      <div className="flex-1 overflow-hidden flex flex-col p-4 md:p-6 max-w-5xl mx-auto w-full relative z-10">
          
          {/* Tab Selector */}
          <div className="flex items-center justify-center gap-2 mb-6 shrink-0">
             <button 
               onClick={() => setActiveTab('chat')}
               className={`px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
                 activeTab === 'chat' 
                   ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                   : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
               }`}
             >
               <Bot size={14} /> AI Assistant
             </button>
             <button 
               onClick={() => setActiveTab('guide')}
               className={`px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
                 activeTab === 'guide' 
                   ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                   : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
               }`}
             >
               <BookOpen size={14} /> {t.headers.guide}
             </button>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-6 shrink-0 relative">
             {activeTab === 'chat' && messages.length > 0 && (
                <button 
                  onClick={() => setMessages([])}
                  className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-purple-500 transition-colors bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800"
                >
                  <ArrowRight size={14} className="rotate-180" /> {lang === 'it' ? 'Indietro' : 'Back'}
                </button>
             )}

          </div>

          {/* Main Card */}
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 dark:shadow-black/40 border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden">
             
             {activeTab === 'chat' ? (
              <>
                 {/* Chat Area */}
                 <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                        <p className="text-slate-400 max-w-md mx-auto mb-10 text-sm font-medium">
                          {t.placeholder}
                        </p>
    
                        <div className="w-full max-w-3xl mx-auto space-y-8">
                            {/* Section 1 */}
                            <div className="text-left">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">{t.headers.config}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button 
                                      type="button"
                                      onClick={() => setIsApiKeyModalOpen(true)}
                                      className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500 rounded-2xl transition-all group text-left cursor-pointer shadow-sm hover:shadow-md"
                                    >
                                      <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-105 transition-transform">
                                        <Key size={18} />
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                          <span className="block text-slate-800 dark:text-slate-200 font-bold text-sm mb-1">{t.q1.text}</span>
                                          <span className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold px-2 py-0.5 rounded-full uppercase">Setup</span>
                                        </div>
                                        <span className="block text-slate-500 text-xs">{t.q1.sub}</span>
                                      </div>
                                    </button>
                                    <button 
                                      onClick={() => sendMessage(t.q2.query)}
                                      className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl transition-all group text-left"
                                    >
                                      <div className="p-2 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                                        <ShieldCheck size={18} />
                                      </div>
                                      <div>
                                        <span className="block text-slate-800 dark:text-slate-200 font-bold text-sm mb-1">{t.q2.text}</span>
                                        <span className="block text-slate-500 text-xs">{t.q2.sub}</span>
                                      </div>
                                    </button>
                                </div>
                            </div>
    
                            {/* Section 2 */}
                            <div className="text-left">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">{t.headers.features}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button 
                                      onClick={() => sendMessage(t.q5.query)}
                                      className="p-5 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:border-blue-400 rounded-2xl transition-all group text-left h-full"
                                    >
                                      <div className="flex items-center gap-2 mb-3 text-blue-500 font-bold text-xs uppercase tracking-wider">
                                        <RouteMasterIcon size={14} /> Route Master
                                      </div>
                                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.q5.text}</p>
                                    </button>

                                    <button 
                                      onClick={() => sendMessage(t.q3.query)}
                                      className="p-5 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:border-rose-400 rounded-2xl transition-all group text-left h-full"
                                    >
                                      <div className="flex items-center gap-2 mb-3 text-rose-500 font-bold text-xs uppercase tracking-wider">
                                        <BudgetMatchIcon size={14} /> Budget Match
                                      </div>
                                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.q3.text}</p>
                                    </button>

                                    <button 
                                      onClick={() => sendMessage(t.q4.query)}
                                      className="p-5 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:border-purple-400 rounded-2xl transition-all group text-left h-full"
                                    >
                                      <div className="flex items-center gap-2 mb-3 text-purple-500 font-bold text-xs uppercase tracking-wider">
                                        <VisualTripIcon size={14} /> Visual Trip
                                      </div>
                                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.q4.text}</p>
                                    </button>
                                </div>
                            </div>
                        </div>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex max-w-[85%] md:max-w-[75%] gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg
                              ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-purple-600 text-white'}`}>
                              {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                            </div>
                            
                            <div className={`p-5 rounded-3xl text-sm leading-relaxed shadow-sm relative group/msg
                              ${msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-tr-sm' 
                                : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-tl-sm'
                              } ${msg.isError ? 'border-red-500 bg-red-900/20' : ''}`}>
                              {msg.text ? (
                                <div className="prose dark:prose-invert prose-sm max-w-none">
                                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                              ) : (
                                <Loader2 className="animate-spin w-4 h-4 text-slate-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                 </div>
    
                 {/* Input Area */}
                 <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
                    <form onSubmit={handleFormSubmit} className="max-w-4xl mx-auto relative group bg-slate-50 dark:bg-slate-950 rounded-3xl border-2 border-transparent focus-within:border-purple-400 transition-all">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t.inputPlaceholder}
                        disabled={isStreaming}
                        className="w-full h-16 pl-6 pr-24 bg-transparent outline-none font-bold text-slate-800 dark:text-white placeholder-slate-400"
                      />
                      <button
                        type="submit"
                        disabled={!input.trim() || isStreaming}
                        className="absolute right-2 top-2 bottom-2 px-6 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-purple-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {isStreaming ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                      </button>
                     </form>
                  </div>
               </>
              ) : (
                 <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="text-center">
                         <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t.guide.title}</h2>
                         <div className="h-1.5 w-12 bg-purple-500 mx-auto rounded-full"></div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         {/* 1. Donut Chart */}
                         <div className="space-y-4">
                             <div className="bg-slate-50 dark:bg-slate-950/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 relative group overflow-hidden h-52 flex flex-col justify-center">
                                 <div className="absolute top-2 left-1/2 -translate-x-1/2">
                                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">EXAMPLE BREAKDOWN</span>
                                 </div>
                                 <div className="flex justify-center items-center gap-8 px-4 mt-2">
                                     {/* Real CSS Donut Chart */}
                                     <div className="w-28 h-28 rounded-full relative shrink-0" style={{
                                         background: `conic-gradient(#10b981 0% 40%, #3b82f6 40% 65%, #f59e0b 65% 80%, #ef4444 80% 92%, #8b5cf6 92% 100%)`
                                     }}>
                                         <div className="absolute inset-[18%] bg-slate-50 dark:bg-slate-950 rounded-full flex flex-col items-center justify-center border-4 border-slate-50 dark:border-slate-950">
                                             <span className="text-xl font-black text-slate-800 dark:text-white">$</span>
                                             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                                         </div>
                                     </div>
                                     
                                     <div className="flex flex-col gap-1.5 min-w-[80px]">
                                         <div className="flex items-center gap-2">
                                             <div className="w-2 h-2 rounded-full bg-[#10b981]"></div>
                                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Flights</span>
                                         </div>
                                         <div className="flex items-center gap-2">
                                             <div className="w-2 h-2 rounded-full bg-[#3b82f6]"></div>
                                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Stay</span>
                                         </div>
                                         <div className="flex items-center gap-2">
                                             <div className="w-2 h-2 rounded-full bg-[#f59e0b]"></div>
                                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Food</span>
                                         </div>
                                         <div className="flex items-center gap-2">
                                             <div className="w-2 h-2 rounded-full bg-[#ef4444]"></div>
                                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Transp.</span>
                                         </div>
                                         <div className="flex items-center gap-2">
                                             <div className="w-2 h-2 rounded-full bg-[#8b5cf6]"></div>
                                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Extras</span>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                             <div>
                                 <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                     <PieChart size={18} className="text-purple-500" /> {t.guide.donut.title}
                                 </h3>
                                 <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{t.guide.donut.text}</p>
                             </div>
                         </div>

                         {/* 2. Duration Slider */}
                         <div className="space-y-4">
                             <div className="bg-slate-50 dark:bg-slate-950/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 h-52 flex flex-col justify-center">
                                 <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                                     <div className="flex justify-between items-center">
                                         <div className="flex items-center gap-2">
                                             <Clock size={12} className="text-slate-400" />
                                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</span>
                                         </div>
                                         <div className="px-2 py-0.5 bg-black/5 dark:bg-black/20 rounded-md text-[10px] font-bold text-slate-600 dark:text-slate-400">14 Days</div>
                                     </div>
                                     <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full relative">
                                         <div className="absolute left-0 top-0 h-full w-[45%] bg-emerald-500 rounded-full"></div>
                                         <div className="absolute left-[45%] top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-emerald-500 rounded-full shadow-md"></div>
                                     </div>
                                     <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                                         <span>1 Day</span>
                                         <span>30 Days</span>
                                     </div>
                                 </div>
                             </div>
                             <div>
                                 <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                     <SlidersHorizontal size={18} className="text-purple-500" /> {t.guide.duration.title}
                                 </h3>
                                 <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{t.guide.duration.text}</p>
                             </div>
                         </div>

                         {/* 3. Logistics Hub */}
                         <div className="space-y-4">
                             <div className="bg-slate-50 dark:bg-slate-950/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 flex items-center gap-4 h-52">
                                 <div className="grid grid-cols-3 gap-2 w-full">
                                     <div className="bg-white dark:bg-slate-900 p-3 rounded-xl flex flex-col items-center justify-center gap-1 border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                                         <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">WEATHER</span>
                                         <span className="text-[10px] font-bold text-slate-800 dark:text-white">22-28°C</span>
                                     </div>
                                     <div className="bg-white dark:bg-slate-900 p-3 rounded-xl flex flex-col items-center justify-center gap-1 border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                                         <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">RELIABILITY</span>
                                         <span className="text-[10px] font-bold text-slate-800 dark:text-white">92/100</span>
                                     </div>
                                     <div className="bg-white dark:bg-slate-900 p-3 rounded-xl flex flex-col items-center justify-center gap-1 border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                                         <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">WATER</span>
                                         <span className="text-[10px] font-black text-emerald-500 uppercase">SAFE</span>
                                     </div>
                                 </div>
                             </div>
                             <div>
                                 <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                     <Info size={18} className="text-purple-500" /> {t.guide.hub.title}
                                 </h3>
                                 <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{t.guide.hub.text}</p>
                             </div>
                         </div>
                        
                        {/* 4. Time Match / Crowds */}
                        <div className="space-y-4">
                             <div className="bg-slate-50 dark:bg-slate-950/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-4 h-52 flex flex-col justify-center">
                                <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Crowds</span>
                                    <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded">2.5/10</span>
                                </div>
                                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                    <div className="h-full bg-emerald-500 w-[25%] shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                    <div className="h-full bg-amber-500 w-[40%] opacity-20"></div>
                                    <div className="h-full bg-red-500 w-[35%] opacity-20"></div>
                                </div>
                             </div>
                             <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Clock size={18} className="text-purple-500" /> {t.guide.crowds.title}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{t.guide.crowds.text}</p>
                            </div>
                        </div>

                        {/* 4. Smart Optimizer */}
                        <div className="space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 flex flex-col justify-center h-52 relative overflow-hidden">
                                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
                                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-emerald-500/20 shadow-xl relative z-10 w-full animate-in fade-in zoom-in duration-700">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <span className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight block leading-tight">LATE FEBRUARY</span>
                                            <div className="h-1.5 w-12 bg-emerald-500/30 rounded-full mt-2"></div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest block mb-0.5 opacity-70">Savings</span>
                                            <span className="text-2xl font-black text-emerald-500 tracking-tight leading-none">+15%</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 space-y-1.5">
                                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full opacity-50"></div>
                                        <div className="h-2 w-2/3 bg-slate-100 dark:bg-slate-800 rounded-full opacity-30"></div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Brain size={18} className="text-purple-500" /> {t.guide.optimizer.title}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{t.guide.optimizer.text}</p>
                            </div>
                        </div>

                        {/* 5. Sweet Spot */}
                        <div className="space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 flex flex-col justify-center h-52 relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl"></div>
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 border-emerald-500/30 shadow-lg relative z-10 mx-auto w-full max-w-[200px]">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Sweet Spot</span>
                                        <Sparkles size={14} className="text-emerald-500" />
                                    </div>
                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200 italic">"October is 25% cheaper"</div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Calendar size={18} className="text-purple-500" /> {t.guide.sweet.title}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{t.guide.sweet.text}</p>
                            </div>
                        </div>

                        {/* 6. Survival Logistics */}
                        <div className="space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 h-52 flex flex-col justify-center">
                                <div className="grid grid-cols-3 gap-2 max-w-[120px] mx-auto">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><CreditCard size={14} /></div>
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center"><Languages size={14} /></div>
                                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center"><Shirt size={14} /></div>
                                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center"><Wifi size={14} /></div>
                                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center"><ShieldCheck size={14} /></div>
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center"><Zap size={14} /></div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Activity size={18} className="text-purple-500" /> {t.guide.survival.title}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{t.guide.survival.text}</p>
                            </div>
                        </div>
                    </div>

                    {/* 7. Savings Strategy - Full Width */}
                    <div className="bg-slate-50 dark:bg-slate-950/50 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-8 items-center group overflow-hidden">
                        <div className="shrink-0 w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                            <TrendingDown size={48} className="group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-3">
                                <TrendingDown size={20} className="text-purple-500" /> {t.guide.savings.title}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{t.guide.savings.text}</p>
                        </div>
                    </div>
                </div>
             )}
          </div>
      </div>
      <ApiKeyModal 
        isOpen={isApiKeyModalOpen} 
        onClose={() => setIsApiKeyModalOpen(false)} 
        lang={lang} 
      />
    </div>
  );
};
