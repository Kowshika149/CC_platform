import { useState } from 'react';
import { isDateAvailable } from '../utils/pricing';
import type { CreatorAvailabilityData } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AvailabilityCalendarProps {
  availability?: CreatorAvailabilityData;
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  interactive?: boolean;
  compact?: boolean;
}

export function AvailabilityCalendar({
  availability,
  selectedDate,
  onSelectDate,
  interactive = false,
  compact = false,
}: AvailabilityCalendarProps) {
  const [viewDate, setViewDate] = useState(() => new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const toDateStr = (day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const getStatusColor = (status: ReturnType<typeof isDateAvailable>) => {
    switch (status) {
      case 'available': return 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200';
      case 'booked': return 'bg-red-100 text-red-700 border-red-200 cursor-not-allowed';
      case 'unavailable': return 'bg-surface-100 text-surface-400 border-surface-200 cursor-not-allowed';
      case 'past': return 'bg-surface-50 text-surface-300 border-surface-100 cursor-not-allowed';
    }
  };

  const handleClick = (day: number) => {
    if (!interactive || !onSelectDate) return;
    const dateStr = toDateStr(day);
    const status = isDateAvailable(availability, dateStr);
    if (status === 'available') onSelectDate(dateStr);
  };

  const daySize = compact ? 'h-7 w-7 text-[10px]' : 'aspect-square text-xs';
  const gap = compact ? 'gap-0.5' : 'gap-1';

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} className="btn-ghost p-0.5">
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <h4 className={`font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>{monthName}</h4>
        <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} className="btn-ghost p-0.5">
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className={`grid grid-cols-7 ${gap} text-center ${compact ? 'text-[10px]' : 'text-xs'} mb-1`}>
        {(compact ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map((d, i) => (
          <div key={`${d}-${i}`} className="font-medium text-surface-500 py-0.5">{d}</div>
        ))}
      </div>

      <div className={`grid grid-cols-7 ${gap}`}>
        {days.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;
          const dateStr = toDateStr(day);
          const status = isDateAvailable(availability, dateStr);
          const isSelected = selectedDate === dateStr;
          return (
            <button
              key={dateStr}
              type="button"
              disabled={!interactive || status !== 'available'}
              onClick={() => handleClick(day)}
              className={`${daySize} rounded-full border font-medium flex items-center justify-center transition mx-auto ${getStatusColor(status)} ${isSelected ? 'ring-2 ring-brand-500' : ''}`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {compact ? (
        <p className="text-[10px] text-surface-500 mt-2 leading-relaxed">
          Green is open. Red is booked. Your preferred date is highlighted.
        </p>
      ) : (
        <div className="flex flex-wrap gap-3 mt-3 text-xs text-surface-600">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-200" /> Available</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-200" /> Booked</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-surface-200" /> Unavailable</span>
        </div>
      )}
    </div>
  );
}
