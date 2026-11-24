import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, X, ShieldCheck, ExternalLink, Clipboard, CheckCircle2, RefreshCw } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
}

const MODAL_TEXTS: Record<string, any> = {
  en: {
    title: 'API Key Configuration',
    subtitle: 'Dual-Provider Setup & Automatic Failover',
    primaryTitle: 'Primary API Key (Google Gemini)',
    primaryDesc: 'Your personal Gemini API key. Stored locally in your browser and used for all AI calculations.',
    getKey: 'Get Free Key',
    paste: 'Paste',
    backupTitle: 'Backup API Key (Failover)',
    backupDesc: 'Optional fallback provider invoked automatically if Gemini hits rate limits (429) or quota errors.',
    providerLabel: 'Backup Provider',
    save: 'Save Configuration',
    saved: 'Saved successfully!',
    securityNote: 'Keys are strictly stored in local storage and sent encrypted only to the target model endpoints.'
  },
  it: {
    title: 'Configurazione Chiavi API',
    subtitle: 'Sistema Dual-Provider e Failover Automatico',
    primaryTitle: 'Chiave API Principale (Google Gemini)',
    primaryDesc: 'La tua chiave API Gemini. Viene salvata in locale nel browser e utilizzata per tutti i calcoli.',
    getKey: 'Ottieni Chiave Gratis',
    paste: 'Incolla',
    backupTitle: 'Chiave API di Backup (Failover)',
    backupDesc: 'Provider alternativo opzionale utilizzato in automatico se Gemini supera i limiti di quota (429).',
    providerLabel: 'Provider di Backup',
    save: 'Salva Configurazione',
    saved: 'Salvato con successo!',
    securityNote: 'Le chiavi restano strettamente salvate nel browser e inviate cifrate solo ai rispettivi endpoint AI.'
  },
  fr: {
    title: 'Configuration Clés API',
    subtitle: 'Dual-Provider & Basculement Automatique',
    primaryTitle: 'Clé API Principale (Google Gemini)',
    primaryDesc: 'Votre clé API Gemini stockée localement dans votre navigateur.',
    getKey: 'Obtenir Clé Gratuite',
    paste: 'Coller',
    backupTitle: 'Clé API de Secours (Failover)',
    backupDesc: 'Fournisseur de secours si Gemini atteint les limites de requêtes.',
    providerLabel: 'Fournisseur de Secours',
    save: 'Enregistrer',
    saved: 'Enregistré avec succès !',
    securityNote: 'Vos clés sont stockées localement en toute sécurité.'
  },
  es: {
    title: 'Configuración Claves API',
    subtitle: 'Sistema Dual-Provider y Failover Automático',
    primaryTitle: 'Clave API Principal (Google Gemini)',
    primaryDesc: 'Tu clave API de Gemini almacenada localmente en tu navegador.',
    getKey: 'Obtener Clave Gratis',
    paste: 'Pegar',
    backupTitle: 'Clave API de Respaldo (Failover)',
    backupDesc: 'Proveedor de respaldo en caso de límite de cuota en Gemini.',
    providerLabel: 'Proveedor de Respaldo',
    save: 'Guardar Configuración',
    saved: '¡Guardado con éxito!',
    securityNote: 'Tus claves se guardan exclusivamente en el almacenamiento local.'
  },
  zh: {
    title: 'API 密钥设置',
    subtitle: '双提供商与自动故障转移',
    primaryTitle: '主要 API 密钥 (Google Gemini)',
    primaryDesc: '您的个人 Gemini 密钥，安全保存在浏览器本地。',
    getKey: '获取免费密钥',
    paste: '粘贴',
    backupTitle: '备用 API 密钥 (故障转移)',
    backupDesc: '当 Gemini 达到额度限制时自动切换。',
    providerLabel: '备用提供商',
    save: '保存设置',
    saved: '已成功保存！',
    securityNote: '密钥仅保存在本地存储中。'
  },
  ja: {
    title: 'API キー設定',
    subtitle: 'デュアルプロバイダー＆自動フェイルオーバー',
    primaryTitle: 'メイン API キー (Google Gemini)',
    primaryDesc: 'ブラウザのローカルストレージに保存される Gemini キー。',
    getKey: '無料キーを取得',
    paste: '貼り付け',
    backupTitle: 'バックアップ API キー',
    backupDesc: 'Gemini のリクエスト制限時に自動切替。',
    providerLabel: 'バックアップ プロバイダー',
    save: '設定を保存',
    saved: '保存しました！',
    securityNote: 'キーは安全にローカル保存されます。'
  }
};

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, lang }) => {
  const t = MODAL_TEXTS[lang] || MODAL_TEXTS.en;

  const [primaryKey, setPrimaryKey] = useState(() => {
    try { return localStorage.getItem('GEMINI_API_KEY') || ''; } catch { return ''; }
  });

  const [backupProvider, setBackupProvider] = useState<'gemini' | 'grok' | 'openrouter'>(() => {
    try { return (localStorage.getItem('BACKUP_API_PROVIDER') as any) || 'gemini'; } catch { return 'gemini'; }
  });

  const [backupKey, setBackupKey] = useState(() => {
    try { return localStorage.getItem('BACKUP_API_KEY') || ''; } catch { return ''; }
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    try {
      localStorage.setItem('GEMINI_API_KEY', primaryKey.trim());
      localStorage.setItem('BACKUP_API_PROVIDER', backupProvider);
      localStorage.setItem('BACKUP_API_KEY', backupKey.trim());
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 900);
    } catch (e) {
      alert('Error saving configuration.');
    }
  };

  const handlePaste = async (setter: (val: string) => void) => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) setter(text.trim());
      }
    } catch {
      // Ignored if permissions are rejected
    }
  };

  const openPortal = (type: 'gemini' | 'grok' | 'openrouter') => {
    const urls: Record<string, string> = {
      gemini: 'https://aistudio.google.com/app/apikey',
      grok: 'https://console.x.ai/',
      openrouter: 'https://openrouter.ai/keys'
    };
    window.open(urls[type] || urls.gemini, '_blank');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        >
          <button 
            onClick={onClose} 
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl">
              <Key size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{t.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.subtitle}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Primary Key */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  {t.primaryTitle}
                </label>
                <button 
                  type="button" 
                  onClick={() => openPortal('gemini')}
                  className="text-[11px] font-semibold text-indigo-500 hover:underline flex items-center gap-1"
                >
                  {t.getKey} <ExternalLink size={12} />
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t.primaryDesc}</p>
              <div className="flex gap-2 pt-1">
                <input 
                  type="password" 
                  value={primaryKey}
                  onChange={(e) => setPrimaryKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => handlePaste(setPrimaryKey)}
                  className="px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Clipboard size={14} /> {t.paste}
                </button>
              </div>
            </div>

            {/* Backup Key */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-500">
                  {t.backupTitle}
                </label>
                <button 
                  type="button" 
                  onClick={() => openPortal(backupProvider)}
                  className="text-[11px] font-semibold text-amber-500 hover:underline flex items-center gap-1"
                >
                  {t.getKey} <ExternalLink size={12} />
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t.backupDesc}</p>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">{t.providerLabel}:</span>
                <select 
                  value={backupProvider} 
                  onChange={(e) => setBackupProvider(e.target.value as any)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value="gemini">Google Gemini (2nd Key)</option>
                  <option value="grok">xAI Grok</option>
                  <option value="openrouter">OpenRouter</option>
                </select>
              </div>

              <div className="flex gap-2">
                <input 
                  type="password" 
                  value={backupKey}
                  onChange={(e) => setBackupKey(e.target.value)}
                  placeholder={backupProvider === 'grok' ? 'xai-...' : backupProvider === 'openrouter' ? 'sk-or-...' : 'AIzaSy...'}
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => handlePaste(setBackupKey)}
                  className="px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Clipboard size={14} /> {t.paste}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 px-1">
              <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
              <span>{t.securityNote}</span>
            </div>

            <button 
              type="button"
              onClick={handleSave}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-purple-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              {isSaved ? <CheckCircle2 size={16} className="text-white" /> : <RefreshCw size={16} />}
              {isSaved ? t.saved : t.save}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
