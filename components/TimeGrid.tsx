'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { cn, formatTime, formatDate } from '@/lib/utils';

interface TimeGridProps {
  dates: string[];
  timeStart: number;
  timeEnd: number;
  timeRanges?: Record<string, [number, number]> | null;
  selectedSlots: string[];
  onSlotsChange: (slots: string[]) => void;
  readOnly?: boolean;
}

export default function TimeGrid({
  dates,
  timeStart,
  timeEnd,
  timeRanges,
  selectedSlots,
  onSlotsChange,
  readOnly = false,
}: TimeGridProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'select' | 'deselect'>('select');
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);
  const [isTouchScrolling, setIsTouchScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate global min/max time range across all dates
  const { globalStart, globalEnd } = useMemo(() => {
    if (!timeRanges || Object.keys(timeRanges).length === 0) {
      return { globalStart: timeStart, globalEnd: timeEnd };
    }
    let minStart = timeStart;
    let maxEnd = timeEnd;
    dates.forEach((date) => {
      const range = timeRanges[date] || [timeStart, timeEnd];
      minStart = Math.min(minStart, range[0]);
      maxEnd = Math.max(maxEnd, range[1]);
    });
    return { globalStart: minStart, globalEnd: maxEnd };
  }, [dates, timeStart, timeEnd, timeRanges]);

  // Get time range for a specific date
  const getTimeRange = useCallback(
    (date: string): [number, number] => {
      if (timeRanges && timeRanges[date]) {
        return timeRanges[date];
      }
      return [timeStart, timeEnd];
    },
    [timeRanges, timeStart, timeEnd]
  );

  // Check if a specific hour is within the date's time range
  const isHourInRange = useCallback(
    (date: string, hour: number): boolean => {
      const [start, end] = getTimeRange(date);
      return hour >= start && hour < end;
    },
    [getTimeRange]
  );

  const hours = Array.from(
    { length: globalEnd - globalStart },
    (_, i) => globalStart + i
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
                const inRange = isHourInRange(date, hour);
                const isDisabled = !inRange || isPast;
                return (
                  <div
                    key={datetime}
                    className={cn(
                      'h-6 w-20 shrink-0 border-l border-t border-zinc-200 transition-colors dark:border-zinc-700',
                      !inRange
                        ? 'bg-zinc-200/50 dark:bg-zinc-800/30'
                        : isPast
                          ? 'cursor-not-allowed bg-zinc-100 dark:bg-zinc-800/50'
                          : isSelected
                            ? 'cursor-pointer bg-emerald-400 dark:bg-emerald-500'
                            : 'cursor-pointer bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800',
                      readOnly && 'cursor-default'
                    )}
                    onMouseDown={() => !isDisabled && handleSlotInteraction(datetime, true)}
                    onMouseEnter={() => !isDisabled && handleSlotInteraction(datetime, false)}
                    onTouchStart={(e) => !isDisabled && handleTouchStart(e, datetime)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={() => !isDisabled && handleTouchEnd(datetime)}
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
                const inRange = isHourInRange(date, hour);
                const isDisabled = !inRange || isPast;
                return (
                  <div
                    key={datetime}
                    className={cn(
                      'h-6 w-20 shrink-0 border-l border-zinc-200 transition-colors dark:border-zinc-700',
                      !inRange
                        ? 'bg-zinc-200/50 dark:bg-zinc-800/30'
                        : isPast
                          ? 'cursor-not-allowed bg-zinc-100 dark:bg-zinc-800/50'
                          : isSelected
                            ? 'cursor-pointer bg-emerald-400 dark:bg-emerald-500'
                            : 'cursor-pointer bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800',
                      readOnly && 'cursor-default'
                    )}
                    onMouseDown={() => !isDisabled && handleSlotInteraction(datetime, true)}
                    onMouseEnter={() => !isDisabled && handleSlotInteraction(datetime, false)}
                    onTouchStart={(e) => !isDisabled && handleTouchStart(e, datetime)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={() => !isDisabled && handleTouchEnd(datetime)}
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
            {formatTime(globalEnd)}
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
