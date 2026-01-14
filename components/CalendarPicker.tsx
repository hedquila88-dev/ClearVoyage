
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Props {
  selectedDate: string;
  onSelect: (date: string) => void;
  onClose: () => void;
  language: string;
}

const CalendarPicker: React.FC<Props> = ({ selectedDate, onSelect, onClose, language }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // FIX: Separated months definition to avoid using the variable before it's fully declared
  const monthNames: Record<string, string[]> = {
    it: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Diciembre'],
    de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    ja: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    zh: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  };
  const months = monthNames[language] || monthNames.en;

  // FIX: Separated weekdays definition to avoid using the variable before it's fully declared
  const weekdayNames: Record<string, string[]> = {
    it: ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'],
    en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    fr: ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'],
    es: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'],
    de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    ja: ['月', '火', '水', '木', '金', '土', '日'],
    zh: ['一', '二', '三', '四', '五', '六', '日'],
  };
  const weekdays = weekdayNames[language] || weekdayNames.en;

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust for Monday start
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
  }
  for (let d = 1; d <= totalDays; d++) {
    const isSelected = selectedDate === `${d} ${months[month]} ${year}`;
    days.push(
      <button
        key={d}
        type="button"
        onClick={() => onSelect(`${d} ${months[month]} ${year}`)}
        className={`h-10 w-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
          isSelected 
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-110' 
            : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-700 dark:text-slate-200'
        }`}
      >
        {d}
      </button>
    );
  }

  const closeText: Record<string, string> = {
    it: 'Chiudi',
    en: 'Close',
    fr: 'Fermer',
    es: 'Cerrar',
    de: 'Schließen',
    ja: '閉じる',
    zh: '关闭',
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-2 z-[70] glass-card rounded-[32px] shadow-2xl border border-slate-200 dark:border-white/10 p-5 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
          <ChevronLeft size={18} className="text-slate-500" />
        </button>
        <span className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">
          {months[month]} {year}
        </span>
        <button type="button" onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
          <ChevronRight size={18} className="text-slate-500" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 mb-2">
        {weekdays.map(d => (
          <div key={d} className="h-8 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
            {d}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
      
      <button 
        type="button" 
        onClick={onClose}
        className="mt-4 w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
      >
        {closeText[language] || closeText.en}
      </button>
    </div>
  );
};

export default CalendarPicker;
