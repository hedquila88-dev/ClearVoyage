import React, { useState } from 'react';
import { Copy, FileText, Download, Check, Loader2, Share, ChevronDown } from 'lucide-react';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { TravelLogistics } from '../types';

interface Props {
  data: TravelLogistics;
  elementId: string;
  labels: {
    copy: string;
    saveTxt: string;
    savePdf: string;
    copied: string;
    generating: string;
    menuLabel?: string;
  };
  variant?: 'floating' | 'inline';
  className?: string;
}

const ExportTools: React.FC<Props> = ({ data, elementId, labels, variant = 'floating', className = '' }) => {
  const [status, setStatus] = useState<'idle' | 'copying' | 'generating'>('idle');
  const [isOpen, setIsOpen] = useState(false);

  // Fallback labels
  const safeLabels = {
    copy: labels?.copy || "Copy",
    saveTxt: labels?.saveTxt || "Save TXT",
    savePdf: labels?.savePdf || "Save PDF",
    copied: labels?.copied || "Copied!",
    generating: labels?.generating || "Generating...",
    menuLabel: labels?.menuLabel || "Export"
  };

  const generateTextContent = () => {
    if (!data) return '';
    const { userCurrency: uc, costs, survival, timeMatch, sweetSpot, savingsStrategy, destination, reliability, weather } = data;
    
    // Safety check
    if (!costs || !timeMatch || !weather || !reliability) return "Data incomplete.";

    const total = (costs.flights || 0) + (costs.accommodation || 0) + (costs.food || 0) + (costs.transport || 0) + (costs.extras || 0);
    const safeWeather = weather || { tempRange: 'N/A', condition: 'N/A' };

    return `
CLEARVOYAGE REPORT: ${destination}
==================================================

LOGISTICS OVERVIEW
------------------
Target Period: ${timeMatch.chosenPeriodAnalysis}
Reliability Score: ${reliability.score}/100
Weather: ${String(safeWeather.tempRange)}, ${String(safeWeather.condition)}

FINANCIAL ESTIMATE (1 Person / 7 Days)
---------------------------------------
Total Estimate: ${uc?.symbol || ''}${total.toLocaleString()}

Breakdown:
- Flights:       ${uc?.symbol || ''}${(costs.flights || 0).toLocaleString()}
- Accommodation: ${uc?.symbol || ''}${(costs.accommodation || 0).toLocaleString()}
- Food:          ${uc?.symbol || ''}${(costs.food || 0).toLocaleString()}
- Transport:     ${uc?.symbol || ''}${(costs.transport || 0).toLocaleString()}
- Extras:        ${uc?.symbol || ''}${(costs.extras || 0).toLocaleString()}

SURVIVAL INTEL
--------------
Water:    ${String(survival?.water || '')}
Cash:     ${String(survival?.money || '')}
Language: ${String(survival?.language || '')}
Laundry:  ${String(survival?.laundry || '')}

STRATEGIC OPTIMIZATION
----------------------
Sweet Spot: ${sweetSpot?.bestPeriod} (${sweetSpot?.reason})
Savings Potential: ${timeMatch.smartOptimizer?.savingsPercent}% if visited in ${timeMatch.smartOptimizer?.period}

SAVINGS STRATEGY (${uc?.symbol || ''}${savingsStrategy?.weeklySavings || 0} / week)
------------------------------------------------------
${savingsStrategy?.strategies?.map(s => `• [${s.category}] ${s.title}\n  ${s.description}`).join('\n\n') || ''}
`.trim();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateTextContent());
      setStatus('copying');
      setTimeout(() => {
        setStatus('idle');
        setIsOpen(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleTxtDownload = () => {
    const text = generateTextContent();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ClearVoyage_${(data.destination || 'trip').replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const handlePdfDownload = async () => {
    const originalElement = document.getElementById(elementId);
    if (!originalElement) {
        console.error(`Element with id ${elementId} not found`);
        alert("Error: Could not find content to export.");
        return;
    }

    setStatus('generating');

    let container: HTMLDivElement | null = null;

    try {
      // 1. CLONE STRATEGY
      container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '-10000px';
      container.style.left = '0';
      // CRITICAL FIX: Width 800px ensures text is large enough on A4 (approx 794px at 96 DPI)
      container.style.width = '800px'; 
      container.style.zIndex = '-1000';
      
      const isDark = document.documentElement.classList.contains('dark');
      const bgColor = isDark ? '#0f172a' : '#ffffff';
      const textColor = isDark ? '#f8fafc' : '#0f172a';

      container.style.backgroundColor = bgColor;
      container.style.color = textColor;
      if (isDark) container.classList.add('dark');
      
      const clone = originalElement.cloneNode(true) as HTMLElement;
      
      // RESET STYLES FOR PDF
      clone.style.margin = '0';
      clone.style.padding = '20px'; // Reduced padding from 40px to 20px
      clone.style.border = 'none';
      clone.style.boxShadow = 'none';
      clone.style.maxWidth = 'none';
      clone.style.width = '100%';
      clone.style.background = bgColor;

      // COMPACT LAYOUT LOGIC
      // We traverse the clone to remove large gaps and reduce padding
      const elements = clone.querySelectorAll('*');
      elements.forEach((el) => {
        const classList = el.classList;
        
        // Compress vertical spacing
        if (classList.contains('space-y-8')) {
            classList.remove('space-y-8');
            classList.add('space-y-4');
        }
        if (classList.contains('space-y-6')) {
            classList.remove('space-y-6');
            classList.add('space-y-3');
        }

        // Compress padding inside cards
        if (classList.contains('p-8')) {
            classList.remove('p-8');
            classList.add('p-5');
        }
        if (classList.contains('p-6')) {
            classList.remove('p-6');
            classList.add('p-4');
        }

        // Tighter gaps between grid items
        if (classList.contains('gap-6')) {
            classList.remove('gap-6');
            classList.add('gap-3');
        }
        if (classList.contains('gap-4')) {
            classList.remove('gap-4');
            classList.add('gap-2');
        }

        // Make tiny text larger and darker for print readability
        if (classList.contains('text-[10px]')) {
            classList.remove('text-[10px]');
            classList.add('text-xs');
        }
        if (classList.contains('text-slate-500')) {
             classList.remove('text-slate-500');
             classList.add('text-slate-700', 'dark:text-slate-300');
        }

        // Enhance border visibility
        if (classList.contains('border-slate-100')) {
             classList.remove('border-slate-100');
             classList.add('border-slate-300');
        }

        // Reduce border radius for a cleaner "document" look
        // FIX: Check if className is string to avoid "el.className.includes is not a function" on SVGs
        if (typeof el.className === 'string' && el.className.includes('rounded-[32px]')) {
            el.className = el.className.replace('rounded-[32px]', 'rounded-xl');
        }
        
        // Hide UI elements
        const tagName = el.tagName;
        if (['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(tagName) || el.getAttribute('role') === 'button') {
            if (el instanceof HTMLElement) {
                el.style.display = 'none';
            }
        }
      });
      
      container.appendChild(clone);
      document.body.appendChild(container);

      // Wait for layout/fonts/images
      await new Promise(resolve => setTimeout(resolve, 800));

      // 2. GENERATE PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - (margin * 2);
      
      let currentY = margin;

      // Header
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(30, 41, 59);
      pdf.text(`ClearVoyage: ${data.destination}`, margin, currentY + 5);
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 116, 139);
      pdf.text(`${new Date().toLocaleDateString()}`, pageWidth - margin, currentY + 5, { align: 'right' });
      
      currentY += 15;

      const children = Array.from(clone.children) as HTMLElement[];

      for (const child of children) {
        if (child.style.display === 'none') continue;
        
        // Use windowWidth: 800 to match container
        const canvas = await html2canvas(child, {
          scale: 2, // High resolution
          useCORS: true,
          backgroundColor: bgColor,
          logging: false,
          windowWidth: 800
        });

        const imgData = canvas.toDataURL('image/png');
        const imgHeight = (canvas.height * contentWidth) / canvas.width;

        // Page break logic
        if (currentY + imgHeight > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.addImage(imgData, 'PNG', margin, currentY, contentWidth, imgHeight);
        currentY += imgHeight + 4; // Tight gap
      }

      // Footer
      const pageCount = pdf.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Page ${i} of ${pageCount} - ClearVoyage AI`, pageWidth / 2, pageHeight - 5, { align: 'center' });
      }

      pdf.save(`ClearVoyage_${(data.destination || 'trip').replace(/[^a-z0-9]/gi, '_')}.pdf`);
      setIsOpen(false);

    } catch (err) {
      console.error("PDF generation failed", err);
      alert("Could not generate PDF. Please try again.");
    } finally {
      if (container && document.body.contains(container)) {
        document.body.removeChild(container);
      }
      setStatus('idle');
    }
  };

  if (variant === 'inline') {
    return (
      <div 
        className={`relative w-full z-20 ${className}`}
        data-html2canvas-ignore="true"
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full py-4 px-6 rounded-2xl border transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-sm ${
            isOpen 
             ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent ring-2 ring-emerald-500/50' 
             : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
           {status === 'generating' ? <Loader2 size={18} className="animate-spin" /> : <Share size={18} />}
           <span className="font-black text-xs uppercase tracking-widest">{safeLabels.menuLabel}</span>
           <ChevronDown size={16} className={`ml-auto opacity-50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
            <>
                <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-2 z-30 animate-in fade-in slide-in-from-top-2 origin-top">
                    
                    {/* PDF OPTION */}
                    <button
                        onClick={handlePdfDownload}
                        disabled={status === 'generating'}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group text-left disabled:opacity-50"
                    >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                            {status === 'generating' ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        </div>
                        <div>
                            <span className="block text-xs font-black uppercase text-slate-700 dark:text-slate-200 tracking-wider">
                                {safeLabels.savePdf}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-medium">Best for printing</span>
                        </div>
                    </button>

                    {/* TXT OPTION */}
                    <button
                        onClick={handleTxtDownload}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group text-left"
                    >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                            <FileText size={16} />
                        </div>
                        <div>
                            <span className="block text-xs font-black uppercase text-slate-700 dark:text-slate-200 tracking-wider">
                                {safeLabels.saveTxt}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-medium">Simple text format</span>
                        </div>
                    </button>

                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2"></div>

                    {/* COPY OPTION */}
                    <button
                        onClick={handleCopy}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors group text-left"
                    >
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            status === 'copying' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-emerald-500'
                         }`}>
                            {status === 'copying' ? <Check size={16} /> : <Copy size={16} />}
                        </div>
                        <div>
                            <span className={`block text-xs font-black uppercase tracking-wider transition-colors ${
                                status === 'copying' ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-200 group-hover:text-emerald-600'
                            }`}>
                                {status === 'copying' ? safeLabels.copied : safeLabels.copy}
                            </span>
                        </div>
                    </button>
                </div>
            </>
        )}
      </div>
    );
  }

  // Floating variant (default)
  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1 p-1.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 shadow-2xl shadow-slate-900/20 transition-all hover:scale-105 animate-fade-in-up" data-html2canvas-ignore="true">
      <button
        onClick={handleCopy}
        className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-transparent hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors"
        title={safeLabels.copy}
      >
        {status === 'copying' ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
        <span className="text-[8px] font-black uppercase tracking-wider mt-0.5">{status === 'copying' ? 'OK' : 'COPY'}</span>
      </button>

      <div className="w-px h-8 bg-slate-200 dark:bg-white/10 mx-1"></div>

      <button
        onClick={handleTxtDownload}
        className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-transparent hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors"
        title={safeLabels.saveTxt}
      >
        <FileText size={20} />
        <span className="text-[8px] font-black uppercase tracking-wider mt-0.5">TXT</span>
      </button>

      <div className="w-px h-8 bg-slate-200 dark:bg-white/10 mx-1"></div>

      <button
        onClick={handlePdfDownload}
        disabled={status === 'generating'}
        className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl text-white shadow-lg transition-all ${
            status === 'generating' 
            ? 'bg-slate-400 cursor-wait' 
            : 'bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200'
        }`}
        title={safeLabels.savePdf}
      >
        {status === 'generating' ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
        <span className="text-[8px] font-black uppercase tracking-wider mt-0.5">PDF</span>
      </button>
    </div>
  );
};

export default ExportTools;