'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { cn, formatTime, formatDate } from '@/lib/utils';

interface TimeGridProps {
  dates: string[];
  timeStart: number;
  timeEnd: number;
  selectedSlots: string[];
  onSlotsChange: (slots: string[]) => void;
  readOnly?: boolean;
}

export default function TimeGrid({
  dates,
  timeStart,
  timeEnd,
  selectedSlots,
  onSlotsChange,
  readOnly = false,
}: TimeGridProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'select' | 'deselect'>('select');
  const containerRef = useRef<HTMLDivElement>(null);

  const hours = Array.from(
    { length: timeEnd - timeStart },
    (_, i) => timeStart + i
  );

  const handleSlotInteraction = useCallback(
    (datetime: string, isStart: boolean) => {
      if (readOnly) return;

      if (isStart) {
        setIsDragging(true);
        const isCurrentlySelected = selectedSlots.includes(datetime);
        setDragMode(isCurrentlySelected ? 'deselect' : 'select');

        if (isCurrentlySelected) {
          onSlotsChange(selectedSlots.filter((s) => s !== datetime));
        } else {
          onSlotsChange([...selectedSlots, datetime]);
        }
      } else if (isDragging) {
        if (dragMode === 'select' && !selectedSlots.includes(datetime)) {
          onSlotsChange([...selectedSlots, datetime]);
        } else if (dragMode === 'deselect' && selectedSlots.includes(datetime)) {
          onSlotsChange(selectedSlots.filter((s) => s !== datetime));
        }
      }
    },
    [isDragging, dragMode, selectedSlots, onSlotsChange, readOnly]
  );

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="overflow-x-auto"
      onMouseLeave={() => setIsDragging(false)}
    >
      <div className="inline-flex min-w-full flex-col">
        {/* Header row with dates */}
        <div className="flex">
          <div className="w-16 shrink-0" />
          {dates.map((date) => (
            <div
              key={date}
              className="w-20 shrink-0 px-1 py-2 text-center text-xs font-medium text-zinc-600 dark:text-zinc-400"
            >
              {formatDate(date)}
            </div>
          ))}
        </div>

        {/* Time slots grid */}
        {hours.map((hour) => (
          <div key={hour}>
            {/* Hour start (XX:00) */}
            <div className="flex">
              <div className="flex w-16 shrink-0 items-center justify-end pr-2 text-xs text-zinc-500 dark:text-zinc-400">
                {formatTime(hour)}
              </div>
              {dates.map((date) => {
                const datetime = `${date}T${hour.toString().padStart(2, '0')}:00`;
                const isSelected = selectedSlots.includes(datetime);
                return (
                  <div
                    key={datetime}
                    className={cn(
                      'h-6 w-20 shrink-0 cursor-pointer border-l border-t border-zinc-200 transition-colors dark:border-zinc-700',
                      isSelected
                        ? 'bg-emerald-400 dark:bg-emerald-500'
                        : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800',
                      readOnly && 'cursor-default'
                    )}
                    onMouseDown={() => handleSlotInteraction(datetime, true)}
                    onMouseEnter={() => handleSlotInteraction(datetime, false)}
                    onTouchStart={() => handleSlotInteraction(datetime, true)}
                    onTouchMove={(e) => {
                      const touch = e.touches[0];
                      const element = document.elementFromPoint(touch.clientX, touch.clientY);
                      const dt = element?.getAttribute('data-datetime');
                      if (dt) handleSlotInteraction(dt, false);
                    }}
                    data-datetime={datetime}
                  />
                );
              })}
            </div>
            {/* Hour half (XX:30) */}
            <div className="flex">
              <div className="w-16 shrink-0" />
              {dates.map((date) => {
                const datetime = `${date}T${hour.toString().padStart(2, '0')}:30`;
                const isSelected = selectedSlots.includes(datetime);
                return (
                  <div
                    key={datetime}
                    className={cn(
                      'h-6 w-20 shrink-0 cursor-pointer border-l border-zinc-200 transition-colors dark:border-zinc-700',
                      isSelected
                        ? 'bg-emerald-400 dark:bg-emerald-500'
                        : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800',
                      readOnly && 'cursor-default'
                    )}
                    onMouseDown={() => handleSlotInteraction(datetime, true)}
                    onMouseEnter={() => handleSlotInteraction(datetime, false)}
                    onTouchStart={() => handleSlotInteraction(datetime, true)}
                    onTouchMove={(e) => {
                      const touch = e.touches[0];
                      const element = document.elementFromPoint(touch.clientX, touch.clientY);
                      const dt = element?.getAttribute('data-datetime');
                      if (dt) handleSlotInteraction(dt, false);
                    }}
                    data-datetime={datetime}
                  />
                );
              })}
            </div>
          </div>
        ))}
        {/* Bottom border */}
        <div className="flex">
          <div className="flex w-16 shrink-0 items-center justify-end pr-2 text-xs text-zinc-500 dark:text-zinc-400">
            {formatTime(timeEnd)}
          </div>
          {dates.map((date) => (
            <div
              key={date}
              className="h-0 w-20 shrink-0 border-l border-t border-zinc-200 dark:border-zinc-700"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
