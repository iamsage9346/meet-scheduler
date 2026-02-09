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
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);
  const [isTouchScrolling, setIsTouchScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hours = Array.from(
    { length: timeEnd - timeStart },
    (_, i) => timeStart + i
  );

  // Check if a slot is in the past
  const isSlotInPast = useCallback((datetime: string) => {
    const now = new Date();
    const slotDate = new Date(datetime.replace('T', ' ') + ':00');
    return slotDate < now;
  }, []);

  const handleSlotInteraction = useCallback(
    (datetime: string, isStart: boolean) => {
      if (readOnly || isSlotInPast(datetime)) return;

      if (isStart) {
        setIsDragging(true);
        const isCurrentlySelected = selectedSlots.includes(datetime);
        setDragMode(isCurrentlySelected ? 'deselect' : 'select');

        if (isCurrentlySelected) {
          onSlotsChange(selectedSlots.filter((s) => s !== datetime));
        } else {
          onSlotsChange([...selectedSlots, datetime]);
        }
      } else if (isDragging && !isTouchScrolling) {
        if (dragMode === 'select' && !selectedSlots.includes(datetime)) {
          onSlotsChange([...selectedSlots, datetime]);
        } else if (dragMode === 'deselect' && selectedSlots.includes(datetime)) {
          onSlotsChange(selectedSlots.filter((s) => s !== datetime));
        }
      }
    },
    [isDragging, dragMode, selectedSlots, onSlotsChange, readOnly, isSlotInPast, isTouchScrolling]
  );

  // Handle touch start - record position to detect scrolling
  const handleTouchStart = useCallback((e: React.TouchEvent, datetime: string) => {
    if (readOnly || isSlotInPast(datetime)) return;

    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setIsTouchScrolling(false);
  }, [readOnly, isSlotInPast]);

  // Handle touch move - detect if scrolling
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartPos) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPos.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.y);

    // If moved more than 10px, consider it scrolling
    if (deltaX > 10 || deltaY > 10) {
      setIsTouchScrolling(true);
      setIsDragging(false);
    }
  }, [touchStartPos]);

  // Handle touch end - only select if not scrolling
  const handleTouchEnd = useCallback((datetime: string) => {
    if (!isTouchScrolling && touchStartPos && !readOnly && !isSlotInPast(datetime)) {
      const isCurrentlySelected = selectedSlots.includes(datetime);
      if (isCurrentlySelected) {
        onSlotsChange(selectedSlots.filter((s) => s !== datetime));
      } else {
        onSlotsChange([...selectedSlots, datetime]);
      }
    }
    setTouchStartPos(null);
    setIsTouchScrolling(false);
    setIsDragging(false);
  }, [isTouchScrolling, touchStartPos, selectedSlots, onSlotsChange, readOnly, isSlotInPast]);

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
      setTouchStartPos(null);
      setIsTouchScrolling(false);
    };
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
                const isPast = isSlotInPast(datetime);
                return (
                  <div
                    key={datetime}
                    className={cn(
                      'h-6 w-20 shrink-0 border-l border-t border-zinc-200 transition-colors dark:border-zinc-700',
                      isPast
                        ? 'cursor-not-allowed bg-zinc-100 dark:bg-zinc-800/50'
                        : isSelected
                          ? 'cursor-pointer bg-emerald-400 dark:bg-emerald-500'
                          : 'cursor-pointer bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800',
                      readOnly && 'cursor-default'
                    )}
                    onMouseDown={() => !isPast && handleSlotInteraction(datetime, true)}
                    onMouseEnter={() => !isPast && handleSlotInteraction(datetime, false)}
                    onTouchStart={(e) => handleTouchStart(e, datetime)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={() => handleTouchEnd(datetime)}
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
                const isPast = isSlotInPast(datetime);
                return (
                  <div
                    key={datetime}
                    className={cn(
                      'h-6 w-20 shrink-0 border-l border-zinc-200 transition-colors dark:border-zinc-700',
                      isPast
                        ? 'cursor-not-allowed bg-zinc-100 dark:bg-zinc-800/50'
                        : isSelected
                          ? 'cursor-pointer bg-emerald-400 dark:bg-emerald-500'
                          : 'cursor-pointer bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800',
                      readOnly && 'cursor-default'
                    )}
                    onMouseDown={() => !isPast && handleSlotInteraction(datetime, true)}
                    onMouseEnter={() => !isPast && handleSlotInteraction(datetime, false)}
                    onTouchStart={(e) => handleTouchStart(e, datetime)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={() => handleTouchEnd(datetime)}
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
