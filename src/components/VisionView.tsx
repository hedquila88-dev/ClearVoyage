import React, { useState, useRef, useEffect, ClipboardEvent } from 'react';
import { analyzeImage, createChatStream } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Upload, Loader2, Compass, X, ScanSearch, Send, Bot, User, CornerDownLeft, ExternalLink, Camera, Aperture, Sparkles, Maximize, Target, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VisualTripIcon } from './Sidebar';

const MarkdownText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
    parts.push({ type: 'link', content: match[1], url: match[2] });
    lastIndex = linkRegex.lastIndex;
  }
  if (lastIndex < text.length) parts.push({ type: 'text', content: text.substring(lastIndex) });
  return (
    <p className="whitespace-pre-wrap leading-relaxed">
      {parts.map((part, i) => {
        if (part.type === 'link') return (
          <a key={i} href={part.url} target="_blank" rel="noopener noreferrer"
            className="text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 underline underline-offset-4 font-semibold inline-flex items-center gap-0.5">
            {part.content}<ExternalLink size={10} strokeWidth={3} />
          </a>
        );
        const boldParts = part.content.split(/(\*\*[^*]+\*\*)/g);
        return <span key={i}>{boldParts.map((subPart, j) => subPart.startsWith('**') && subPart.endsWith('**') ? <strong key={j} className="text-slate-900 dark:text-white font-bold">{subPart.slice(2, -2)}</strong> : subPart)}</span>;
      })}
    </p>
  );
};

interface VisionViewProps { 
  lang: string; 
  onPlanTrip?: (destination: string, origin: string, period: string, currency: string, budget?: number, duration?: number, estimatedCosts?: any) => void;
}

const VISION_TRANSLATIONS: Record<string, any> = {
  en: { title: 'Visual Trip', hero: 'Vision', subtitle: 'Identify landmarks and uncover hidden gems.', upload: 'Upload Photo', orPaste: 'or Paste (Ctrl+V)', camera: 'Open Camera', analyze: 'Analyze Image', promptPlaceholder: 'Ask about the image...', assistant: 'Explorer Assistant', clear: 'Clear', ready: 'Ready to Explore', chatPlaceholder: 'Ask about the image...', error: "Sorry, I couldn't analyze the image." },
  it: { title: 'Viaggio Visivo', hero: 'Visione', subtitle: 'Identifica luoghi e scopri gemme nascoste.', upload: 'Carica Foto', orPaste: 'o Incolla (Ctrl+V)', camera: 'Apri Camera', analyze: 'Analizza Immagine', promptPlaceholder: "Chiedi dell'immagine...", assistant: 'Assistente Esploratore', clear: 'Pulisci', ready: 'Pronto a Esplorare', chatPlaceholder: "Chiedi dell'immagine...", error: "Spiacente, non ho potuto analizzare l'immagine." },
  fr: { title: 'Voyage Visuel', hero: 'Vision', subtitle: 'Identifiez des lieux et découvrez des trésors cachés.', upload: 'Télécharger Photo', orPaste: 'ou Coller (Ctrl+V)', camera: 'Ouvrir Caméra', analyze: 'Analyser Image', promptPlaceholder: "Posez une question sur l'image...", assistant: 'Assistant Explorateur', clear: 'Effacer', ready: 'Prêt à Explorer', chatPlaceholder: "Posez une question sur l'image...", error: "Désolé, impossible d'analyser l'image." },
  es: { title: 'Viaje Visual', hero: 'Visión', subtitle: 'Identifica lugares y descubre joyas ocultas.', upload: 'Subir Foto', orPaste: 'o Pegar (Ctrl+V)', camera: 'Subir Foto', analyze: 'Analizar Imagen', promptPlaceholder: 'Pregunta sobre la imagen...', assistant: 'Assistente Esploratore', clear: 'Borrar', ready: 'Listo para Explorar', chatPlaceholder: 'Pregunta sobre la imagen...', error: "Lo siento, no pude analizar la imagen." },
  zh: { title: '视觉旅行', hero: '视觉', subtitle: '识别地标并发现隐藏的瑰宝。', upload: '上传照片', orPaste: '或粘贴 (Ctrl+V)', camera: '打开相机', analyze: '分析图片', promptPlaceholder: '询问有关图片的问题...', assistant: '探索助手', clear: '清除', ready: '准备探索', chatPlaceholder: '询问有关图片的问题...', error: '抱歉，无法分析该图片。' },
  ja: { title: 'ビジュアル旅', hero: 'ビジョン', subtitle: 'ランドマークを特定し、隠れた名所を発見します。', upload: '写真をアップロード', orPaste: 'または貼り付け (Ctrl+V)', camera: 'カメラを開く', analyze: '画像を分析', promptPlaceholder: '画像について質問...', assistant: '探検アシスタント', clear: 'クリア', ready: '探検の準備完了', chatPlaceholder: '画像について質問...', error: '申し訳ありません、画像を分析できませんでした。' }
};

export const VisionView: React.FC<VisionViewProps> = ({ lang, onPlanTrip }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [focusMode, setFocusMode] = useState(true);
  const [isResizing, setIsResizing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatStreaming, setIsChatStreaming] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Travel extraction states
  const [itineraryReady, setItineraryReady] = useState(false);
  const [extractedOrigin, setExtractedOrigin] = useState('');
  const [extractedCurrency, setExtractedCurrency] = useState('EUR');
  const [extractedPeriod, setExtractedPeriod] = useState('');
  const [cleanDestination, setCleanDestination] = useState('');
  const [suggestedPeriod, setSuggestedPeriod] = useState('');
  const [focusRect, setFocusRect] = useState({ x: 20, y: 20, w: 60, h: 60 }); // percentages

  const t = VISION_TRANSLATIONS[lang] || VISION_TRANSLATIONS.en;

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isChatStreaming]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) processFile(file); };
  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => { const items = e.clipboardData?.items; if (items) { for (let i = 0; i < items.length; i++) { if (items[i].type.indexOf('image') !== -1) { const blob = items[i].getAsFile(); if (blob) processFile(blob); break; } } } };
  const processFile = (file: File) => { const reader = new FileReader(); reader.onloadend = () => { setSelectedImage(reader.result as string); }; reader.readAsDataURL(file); };
  const clearImage = (e?: React.MouseEvent) => { e?.stopPropagation(); stopCamera(); setSelectedImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; };
  const resetAll = () => { clearImage(); setMessages([]); setPrompt(''); };

  const startCamera = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setIsCameraOpen(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
    } catch (err) { alert("Unable to access camera. Please check permissions."); }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) { const stream = videoRef.current.srcObject as MediaStream; stream.getTracks().forEach(track => track.stop()); videoRef.current.srcObject = null; }
    setIsCameraOpen(false);
  };

  const capturePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      
      // Calculate crop based on focusPos and focusScale and zoom
      // For simplicity, we'll apply zoom first then crop the focus area
      
      const vWidth = video.videoWidth;
      const vHeight = video.videoHeight;
      
      // Effective width/height after zoom
      const effectiveWidth = vWidth / zoom;
      const effectiveHeight = vHeight / zoom;
      
      // Center of focus in pixels
      const centerX = (focusRect.x + focusRect.w / 2) / 100 * vWidth;
      const centerY = (focusRect.y + focusRect.h / 2) / 100 * vHeight;
      
      // Size of focus box in pixels
      const bw = (focusRect.w / 100) * vWidth;
      const bh = (focusRect.h / 100) * vHeight;
      
      // Source rectangle
      let sx = (focusRect.x / 100) * vWidth;
      let sy = (focusRect.y / 100) * vHeight;
      let sWidth = bw;
      let sHeight = bh;
      
      // Clamp to video bounds
      if (sx < 0) sx = 0;
      if (sy < 0) sy = 0;
      if (sx + sWidth > vWidth) sx = vWidth - sWidth;
      if (sy + sHeight > vHeight) sy = vHeight - sHeight;

      canvas.width = 1024; // Standard resolution for Gemini
      canvas.height = 1024;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, 1024, 1024);
        setSelectedImage(canvas.toDataURL('image/jpeg', 0.65));
        stopCamera();
        setZoom(1);
        setFocusRect({ x: 20, y: 20, w: 60, h: 60 });
      }
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setIsLoading(true);
    const initialMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: initialMsgId, role: 'model', text: '', timestamp: Date.now() }]);
    
    const identificationPrompt = `IDENTIFICATION MODE: Identify this location.
    RULE 1: Respond ALWAYS with "Possibly:" followed by top 2-3 candidates with % confidence.
    Example: "Possibly: The Colosseum in Rome, Italy (85%) or a similar Roman amphitheater (15%)".
    RULE 2: Even if certain, use "Possibly:".
    RULE 3: Finish with ONE follow-up question to learn more or prepare a trip.
    ${prompt}`;

    try {
      const analysisText = await analyzeImage(selectedImage, identificationPrompt, lang);
      
      // Extract clean destination (first part of "Possibly: ...")
      const match = analysisText.match(/Possibly:\s*([^,(%]+)/i);
      if (match && match[1]) setCleanDestination(match[1].trim());
      
      // Extract suggested period for fallback
      const lines = analysisText.split('\n').filter(l => l.trim().length > 0);
      if (lines.length > 1) {
        const periodMatch = lines[1].match(/(?:Best time|Best period|Period|When):\s*(.*)/i);
        setSuggestedPeriod(periodMatch ? periodMatch[1].trim() : lines[1].trim());
      }
      
      setMessages(prev => prev.map(msg => msg.id === initialMsgId ? { ...msg, text: analysisText } : msg));
    } catch (error) {
      setMessages(prev => prev.map(msg => msg.id === initialMsgId ? { ...msg, text: t.error, isError: true } : msg));
    } finally { setIsLoading(false); }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatStreaming) return;
    const userText = chatInput; setChatInput(''); setIsChatStreaming(true);
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: userText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    const modelMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '', timestamp: Date.now() }]);
    
    try {
      const systemInstruction = `TRAVEL ASSISTANT MODE:
      - If user wants to visit, ask ONLY for origin city and currency.
      - If both missing, ask for both. If one missing, ask for the other.
      - MAX 2 questions total before generating.
      - Recognize informal origins (e.g. "from London" -> origin: London).
      - Recognize currencies/symbols (e.g. "pounds", "sterline" -> currency: GBP).
      - When both known, confirm exactly with: "origin: [City]", "currency: [ISO Code]", "period: [Month/Season]".
      
      CRITICAL: Once you have shown the summary with origin/currency/period format, do NOT send any further messages. Do not say 'I will check', 'Please wait', 'Okay I'll look into this' or anything else. The UI will handle the next step automatically.
      
      ${cleanDestination ? `Destination is ${cleanDestination}.` : ''}
      ${suggestedPeriod ? `The recommended travel period for this destination is ${suggestedPeriod}. Use it if the user doesn't specify another.` : ''}`;

      let history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      if (history.length === 0 || history[0].role !== 'user') {
        history = [{ role: 'user', parts: [{ text: systemInstruction }] }, ...history];
      } else {
        history[0].parts[0].text = systemInstruction + "\n" + history[0].parts[0].text;
      }

      const stream = createChatStream(history, userText);
      let accumulatedText = '';
      for await (const chunk of stream) { 
        accumulatedText += chunk; 
        setMessages(prev => prev.map(msg => msg.id === modelMsgId ? { ...msg, text: accumulatedText } : msg)); 
      }

      // Check for extraction tokens
      const originMatch = accumulatedText.match(/origin:\s*([^,\.\n]+)/i);
      const currencyMatch = accumulatedText.match(/currency:\s*([A-Z]{3})/i);
      const periodMatch = accumulatedText.match(/period:\s*([^,\.\n]+)/i);

      if (originMatch && currencyMatch) {
        setExtractedOrigin(originMatch[1].trim());
        setExtractedCurrency(currencyMatch[1].trim());
        
        let finalPeriod = periodMatch ? periodMatch[1].trim() : '';
        if (!finalPeriod || finalPeriod.toLowerCase().includes('month') || finalPeriod.toLowerCase().includes('season') || finalPeriod === '[Month/Season]') {
          finalPeriod = suggestedPeriod || 'Next available season';
        }
        setExtractedPeriod(finalPeriod);

        // Fallback per destination se cleanDestination è vuoto
        if (!cleanDestination) {
          const destFromMsg = messages[0]?.text?.match(/Possibly:\s*([^,(%)]+)/i);
          if (destFromMsg) setCleanDestination(destFromMsg[1].trim());
        }

        setItineraryReady(true);
      }
    } catch (error) {
      setMessages(prev => prev.map(msg => msg.id === modelMsgId ? { ...msg, text: "I lost connection. Please try asking again.", isError: true } : msg));
    } finally { setIsChatStreaming(false); }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden relative" onPaste={handlePaste} tabIndex={0}>
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40 shrink-0">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-3"><VisualTripIcon className="w-6 h-6" />{t.title}</h2>
      </header>
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-950/20 pointer-events-none" />
      <div className="flex-1 overflow-hidden relative max-w-2xl mx-auto w-full">
        <div className="h-full flex flex-col p-4 md:p-6 gap-4">
          <div className="w-full flex-shrink-0 flex flex-col gap-4">
            <div className={`bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-black/30 border border-slate-100 dark:border-slate-800 p-2 flex flex-col overflow-hidden relative transition-all duration-300 ${messages.length > 0 ? 'hidden' : !selectedImage ? 'h-48 md:h-56' : 'h-auto max-h-64 md:max-h-80'}`}>
              <div className={`relative rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden flex-1 bg-slate-50 dark:bg-slate-950 ${selectedImage || isCameraOpen ? 'border-amber-500/30' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-amber-400 cursor-pointer'}`}
                onClick={() => !selectedImage && !isCameraOpen && fileInputRef.current?.click()}>
                {isCameraOpen ? (
                  <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center select-none touch-none">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover"
                      style={{ transform: `scale(${zoom})` }}
                    />
                    
                    {/* UI Overlays */}
                    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                       {/* Scanner Overlay */}
                       <AnimatePresence>
                        {focusMode && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute border-2 border-amber-500 rounded-3xl pointer-events-auto"
                            style={{
                              left: `${focusRect.x}%`,
                              top: `${focusRect.y}%`,
                              width: `${focusRect.w}%`,
                              height: `${focusRect.h}%`,
                              boxShadow: '0 0 0 4000px rgba(0,0,0,0.5)'
                            }}
                            drag={!isResizing}
                            dragMomentum={false}
                            dragElastic={0}
                            onDrag={(e, info) => {
                              const parent = (e.target as HTMLElement).parentElement;
                              if (!parent) return;
                              const rect = parent.getBoundingClientRect();
                              
                              // Calculate movement in percentage
                              const dx = (info.delta.x / rect.width) * 100;
                              const dy = (info.delta.y / rect.height) * 100;

                              setFocusRect(prev => {
                                let newX = prev.x + dx;
                                let newY = prev.y + dy;
                                
                                // Constraints
                                if (newX < 0) newX = 0;
                                if (newY < 0) newY = 0;
                                if (newX + prev.w > 100) newX = 100 - prev.w;
                                if (newY + prev.h > 100) newY = 100 - prev.h;
                                
                                return { ...prev, x: newX, y: newY };
                              });
                            }}
                          >
                            {/* Resize Handles - Corner Dragging */}
                            {/* Top Left */}
                            <div 
                              className="absolute -top-4 -left-4 w-12 h-12 flex items-center justify-center cursor-nwse-resize z-30"
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                setIsResizing(true);
                                const startPos = { x: e.clientX, y: e.clientY };
                                const startRect = { ...focusRect };
                                const parentContainer = (e.currentTarget as HTMLElement).parentElement?.parentElement;
                                const handleMove = (moveEvent: PointerEvent) => {
                                  const rect = parentContainer?.getBoundingClientRect();
                                  if (!rect) return;
                                  const dx = ((moveEvent.clientX - startPos.x) / rect.width) * 100;
                                  const dy = ((moveEvent.clientY - startPos.y) / rect.height) * 100;
                                  setFocusRect(() => {
                                    let nextX = startRect.x + dx;
                                    let nextY = startRect.y + dy;
                                    let nextW = startRect.w - dx;
                                    let nextH = startRect.h - dy;
                                    // Constraints
                                    if (nextX < 0) { nextW += nextX; nextX = 0; }
                                    if (nextY < 0) { nextH += nextY; nextY = 0; }
                                    if (nextW < 10) { nextX = startRect.x + startRect.w - 10; nextW = 10; }
                                    if (nextH < 10) { nextY = startRect.y + startRect.h - 10; nextH = 10; }
                                    return { x: nextX, y: nextY, w: nextW, h: nextH };
                                  });
                                };
                                const handleUp = () => {
                                  setIsResizing(false);
                                  window.removeEventListener('pointermove', handleMove);
                                  window.removeEventListener('pointerup', handleUp);
                                };
                                window.addEventListener('pointermove', handleMove);
                                window.addEventListener('pointerup', handleUp);
                              }}
                            >
                              <div className="w-7 h-7 border-t-4 border-l-4 border-amber-500 rounded-tl-lg shadow-lg" />
                            </div>

                            {/* Top Right */}
                            <div 
                              className="absolute -top-4 -right-4 w-12 h-12 flex items-center justify-center cursor-nesw-resize z-30"
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                setIsResizing(true);
                                const startPos = { x: e.clientX, y: e.clientY };
                                const startRect = { ...focusRect };
                                const parentContainer = (e.currentTarget as HTMLElement).parentElement?.parentElement;
                                const handleMove = (moveEvent: PointerEvent) => {
                                  const rect = parentContainer?.getBoundingClientRect();
                                  if (!rect) return;
                                  const dx = ((moveEvent.clientX - startPos.x) / rect.width) * 100;
                                  const dy = ((moveEvent.clientY - startPos.y) / rect.height) * 100;
                                  setFocusRect(() => {
                                    let nextY = startRect.y + dy;
                                    let nextW = startRect.w + dx;
                                    let nextH = startRect.h - dy;
                                    // Constraints
                                    if (nextY < 0) { nextH += nextY; nextY = 0; }
                                    if (startRect.x + nextW > 100) nextW = 100 - startRect.x;
                                    if (nextW < 10) nextW = 10;
                                    if (nextH < 10) { nextY = startRect.y + startRect.h - 10; nextH = 10; }
                                    return { x: startRect.x, y: nextY, w: nextW, h: nextH };
                                  });
                                };
                                const handleUp = () => {
                                  setIsResizing(false);
                                  window.removeEventListener('pointermove', handleMove);
                                  window.removeEventListener('pointerup', handleUp);
                                };
                                window.addEventListener('pointermove', handleMove);
                                window.addEventListener('pointerup', handleUp);
                              }}
                            >
                              <div className="w-7 h-7 border-t-4 border-r-4 border-amber-500 rounded-tr-lg shadow-lg" />
                            </div>

                            {/* Bottom Left */}
                            <div 
                              className="absolute -bottom-4 -left-4 w-12 h-12 flex items-center justify-center cursor-nesw-resize z-30"
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                setIsResizing(true);
                                const startPos = { x: e.clientX, y: e.clientY };
                                const startRect = { ...focusRect };
                                const parentContainer = (e.currentTarget as HTMLElement).parentElement?.parentElement;
                                const handleMove = (moveEvent: PointerEvent) => {
                                  const rect = parentContainer?.getBoundingClientRect();
                                  if (!rect) return;
                                  const dx = ((moveEvent.clientX - startPos.x) / rect.width) * 100;
                                  const dy = ((moveEvent.clientY - startPos.y) / rect.height) * 100;
                                  setFocusRect(() => {
                                    let nextX = startRect.x + dx;
                                    let nextW = startRect.w - dx;
                                    let nextH = startRect.h + dy;
                                    // Constraints
                                    if (nextX < 0) { nextW += nextX; nextX = 0; }
                                    if (startRect.y + nextH > 100) nextH = 100 - startRect.y;
                                    if (nextW < 10) { nextX = startRect.x + startRect.w - 10; nextW = 10; }
                                    if (nextH < 10) nextH = 10;
                                    return { x: nextX, y: startRect.y, w: nextW, h: nextH };
                                  });
                                };
                                const handleUp = () => {
                                  setIsResizing(false);
                                  window.removeEventListener('pointermove', handleMove);
                                  window.removeEventListener('pointerup', handleUp);
                                };
                                window.addEventListener('pointermove', handleMove);
                                window.addEventListener('pointerup', handleUp);
                              }}
                            >
                              <div className="w-7 h-7 border-b-4 border-l-4 border-amber-500 rounded-bl-lg shadow-lg" />
                            </div>

                            {/* Bottom Right */}
                            <div 
                              className="absolute -bottom-4 -right-4 w-12 h-12 flex items-center justify-center cursor-nwse-resize z-30"
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                setIsResizing(true);
                                const startPos = { x: e.clientX, y: e.clientY };
                                const startRect = { ...focusRect };
                                const parentContainer = (e.currentTarget as HTMLElement).parentElement?.parentElement;
                                const handleMove = (moveEvent: PointerEvent) => {
                                  const rect = parentContainer?.getBoundingClientRect();
                                  if (!rect) return;
                                  const dx = ((moveEvent.clientX - startPos.x) / rect.width) * 100;
                                  const dy = ((moveEvent.clientY - startPos.y) / rect.height) * 100;
                                  setFocusRect(() => {
                                    let nextW = startRect.w + dx;
                                    let nextH = startRect.h + dy;
                                    // Constraints
                                    if (startRect.x + nextW > 100) nextW = 100 - startRect.x;
                                    if (startRect.y + nextH > 100) nextH = 100 - startRect.y;
                                    if (nextW < 10) nextW = 10;
                                    if (nextH < 10) nextH = 10;
                                    return { ...startRect, w: nextW, h: nextH };
                                  });
                                };
                                const handleUp = () => {
                                  setIsResizing(false);
                                  window.removeEventListener('pointermove', handleMove);
                                  window.removeEventListener('pointerup', handleUp);
                                };
                                window.addEventListener('pointermove', handleMove);
                                window.addEventListener('pointerup', handleUp);
                              }}
                            >
                              <div className="w-7 h-7 border-b-4 border-r-4 border-amber-500 rounded-br-lg shadow-lg" />
                            </div>
                            
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 opacity-40">
                              <Target className="text-amber-500 animate-pulse" size={24} />
                              <span className="text-[10px] font-black text-amber-500 uppercase tracking-tighter">Focus Area</span>
                            </div>

                            {/* Label */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-lg">
                              Drag corners to resize or center to move
                            </div>
                          </motion.div>
                        )}
                       </AnimatePresence>
                    </div>

                    {/* Controls */}
                    <div className="absolute bottom-10 left-0 w-full flex flex-col items-center gap-6 z-20 px-6">
                      
                      <div className="flex flex-col items-center gap-2 w-full max-w-xs">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">Zoom Level</span>
                        <div className="w-full flex items-center gap-4 bg-black/40 backdrop-blur-xl p-4 rounded-[2rem] border border-white/10 shadow-2xl">
                          <ZoomOut size={18} className="text-white/40" />
                          <input 
                            type="range" 
                            min="1" 
                            max="4" 
                            step="0.1" 
                            value={zoom} 
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="flex-1 accent-amber-500 h-1.5 rounded-full bg-white/20 appearance-none cursor-pointer"
                          />
                          <ZoomIn size={18} className="text-white/40" />
                          <span className="text-xs font-black text-amber-500 w-10 text-right">{zoom.toFixed(1)}x</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-10">
                        <button onClick={(e) => { e.stopPropagation(); stopCamera(); }} 
                          className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full text-white hover:bg-red-500/80 transition-all border border-white/10 flex items-center justify-center shadow-xl">
                          <X size={24} />
                        </button>
                        
                        <button onClick={capturePhoto} className="p-1 bg-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all outline-none group">
                          <div className="p-5 border-4 border-slate-900 rounded-full bg-white">
                            <Aperture size={48} className="text-slate-900 group-hover:rotate-90 transition-transform duration-500" />
                          </div>
                        </button>

                        <div className="flex flex-col items-center gap-2">
                          <button onClick={() => setFocusMode(!focusMode)} 
                            className={`w-14 h-14 backdrop-blur-xl rounded-full transition-all border border-white/10 flex items-center justify-center shadow-xl ${focusMode ? 'bg-amber-500 text-black' : 'bg-white/10 text-white'}`}>
                            <Target size={24} />
                          </button>
                          <span className="text-[10px] font-black text-amber-500 uppercase tracking-tighter">Zoom Mode</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : selectedImage ? (
                  <div className="relative w-full h-full group">
                    <div className="absolute inset-0 overflow-hidden rounded-[1.5rem]">
                      <img 
                        src={selectedImage} 
                        alt="Preview" 
                        className="w-full h-full object-cover transition-transform duration-300" 
                        style={{ transform: `scale(${zoom})` }}
                      />
                    </div>
                    <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 px-4">
                       <div className="bg-slate-900/80 backdrop-blur-xl p-3 rounded-2xl flex items-center gap-3 border border-white/10 shadow-2xl scale-90">
                          <ZoomOut size={14} className="text-white/40" />
                          <input 
                            type="range" 
                            min="1" 
                            max="3" 
                            step="0.1" 
                            value={zoom} 
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="w-24 accent-amber-500 h-1 rounded-full bg-white/20 appearance-none cursor-pointer"
                          />
                          <ZoomIn size={14} className="text-white/40" />
                          <span className="text-[10px] font-black text-amber-500 w-8 text-right">{zoom.toFixed(1)}x</span>
                       </div>
                    </div>
                    <button onClick={(e) => clearImage(e)} className="absolute top-4 right-4 p-2 bg-slate-900/50 text-white rounded-full hover:bg-red-500 transition-colors z-10 backdrop-blur-md shadow-lg"><X size={20} /></button>
                  </div>
                ) : (
                  <div className="text-center p-4 w-full flex flex-col items-center justify-center">
                    <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-2 text-amber-500 shadow-lg"><Upload size={20} /></div>
                    <p className="text-slate-900 dark:text-white font-black text-lg leading-tight">{t.upload}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5 mb-3">{t.orPaste}</p>
                    <button onClick={startCamera} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-amber-500 hover:text-white text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all flex items-center gap-2 mx-auto text-[10px]"><Camera size={14} />{t.camera}</button>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>
              {selectedImage && messages.length === 0 && (
                <div className="mt-2 p-2">
                  <button onClick={handleAnalyze} className="w-full h-14 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
                    <ScanSearch size={20} />{t.analyze}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 dark:shadow-black/40 border border-slate-100 dark:border-slate-800 overflow-hidden relative">
            <div className="h-14 border-b border-slate-100 dark:border-slate-800 flex items-center px-6 justify-between shrink-0">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2"><Bot size={16} />{t.assistant}</span>
              <button onClick={resetAll} className="text-xs font-bold text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1 uppercase tracking-wider"><X size={12} />{t.clear}</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {selectedImage && messages.length > 0 && (
                <div className="relative w-24 h-24 group mb-4">
                  <img src={selectedImage} alt="Analysis context" className="w-full h-full object-cover rounded-2xl border-2 border-amber-500/30" />
                  <button onClick={(e) => clearImage(e)} className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                    <X size={12} />
                  </button>
                </div>
              )}
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60 text-center py-10">
                  <Compass size={64} className="mb-4 text-slate-200 dark:text-slate-800" />
                  <p className="text-xl font-black text-slate-300 dark:text-slate-700">{t.ready}</p>
                </div>
              ) : messages.map((msg) => (
                <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[90%] gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-indigo-600 font-bold text-white' : 'bg-amber-500 text-white'}`}>
                      {msg.role === 'user' ? <User size={18} /> : <Compass size={18} />}
                    </div>
                    <div className={`p-5 rounded-3xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-indigo-50 rounded-tr-sm' : 'bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-sm'} ${msg.isError ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400' : ''}`}>
                      {msg.text ? <MarkdownText text={msg.text} /> : <Loader2 className="animate-spin w-4 h-4 text-slate-500" />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            {messages.length > 0 && (
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
                {itineraryReady && (
                  <button 
                    onClick={() => {
                      const modelMsg = messages.find(m => m.role === 'model' && m.text && m.text.includes('Possibly:'));
                      const destMatch = modelMsg?.text.match(/Possibly:\s*(.+?)(?:\s*\(|\n|$)/i);
                      const finalDest = destMatch?.[1]?.trim() || 'the destination';
                      const finalOrigin = extractedOrigin || 'London';
                      const finalPeriod = extractedPeriod || suggestedPeriod || 'Anytime';
                      const finalCurrency = extractedCurrency || 'EUR';
                      onPlanTrip?.(finalDest, finalOrigin, finalPeriod, finalCurrency, 0, 7);
                    }}
                    className="w-full mb-4 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 animate-in fade-in slide-in-from-bottom-2"
                  >
                    <Sparkles size={18} /> Generate Itinerary
                  </button>
                )}
                <form onSubmit={handleSendMessage} className="relative group bg-slate-50 dark:bg-slate-950 rounded-3xl border-2 border-transparent focus-within:border-amber-400 transition-all">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} disabled={isChatStreaming || isLoading} placeholder={t.chatPlaceholder}
                    className="w-full h-16 pl-6 pr-14 bg-transparent rounded-3xl outline-none font-bold text-slate-800 dark:text-white placeholder-slate-400" />
                  <button type="submit" disabled={!chatInput.trim() || isChatStreaming || isLoading}
                    className="absolute right-2 top-2 p-3 bg-amber-500 text-white rounded-2xl hover:bg-amber-400 disabled:opacity-50 transition-colors shadow-lg">
                    {isChatStreaming ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
