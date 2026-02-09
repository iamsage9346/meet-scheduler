'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  selectedDates: string[];
  onDatesChange: (dates: string[]) => void;
}

export default function DatePicker({ selectedDates, onDatesChange }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  };

  const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const toggleDate = (date: Date) => {
    const key = formatDateKey(date);
    if (selectedDates.includes(key)) {
      onDatesChange(selectedDates.filter((d) => d !== key));
    } else {
      onDatesChange([...selectedDates, key].sort());
    }
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="w-full max-w-sm">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          type="button"
          onClick={nextMonth}
          className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400"
          >
            {day}
          </div>
        ))}
        {days.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} />;
          }
          const dateKey = formatDateKey(date);
          const isSelected = selectedDates.includes(dateKey);
          const isPast = date < today;

          return (
            <button
              key={dateKey}
              type="button"
              disabled={isPast}
              onClick={() => toggleDate(date)}
              className={cn(
                'aspect-square rounded-lg text-sm font-medium transition-colors',
                isPast && 'cursor-not-allowed text-zinc-300 dark:text-zinc-600',
                !isPast && !isSelected && 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800',
                isSelected && 'bg-emerald-500 text-white hover:bg-emerald-600'
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {selectedDates.length > 0 && (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}
