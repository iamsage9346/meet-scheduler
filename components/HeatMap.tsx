'use client';

import { useMemo } from 'react';
import { formatTime, formatDate, generateTimeSlots } from '@/lib/utils';
import type { Participant } from '@/types';

interface HeatMapProps {
  dates: string[];
  timeStart: number;
  timeEnd: number;
  participants: Participant[];
}

export default function HeatMap({
  dates,
  timeStart,
  timeEnd,
  participants,
}: HeatMapProps) {
  const { slotCounts, maxCount } = useMemo(() => {
    const counts: Record<string, number> = {};
    let max = 0;

    generateTimeSlots(dates, timeStart, timeEnd).forEach((slot) => {
      counts[slot.datetime] = 0;
    });

    participants.forEach((p) => {
      p.availableSlots.forEach((slot) => {
        if (counts[slot] !== undefined) {
          counts[slot]++;
          max = Math.max(max, counts[slot]);
        }
      });
    });

    return { slotCounts: counts, maxCount: max };
  }, [dates, timeStart, timeEnd, participants]);

  const getHeatColor = (count: number) => {
    if (count === 0 || maxCount === 0) {
      return 'bg-zinc-100 dark:bg-zinc-800';
    }
    const intensity = count / maxCount;
    if (intensity <= 0.25) return 'bg-emerald-200 dark:bg-emerald-900';
    if (intensity <= 0.5) return 'bg-emerald-300 dark:bg-emerald-700';
    if (intensity <= 0.75) return 'bg-emerald-400 dark:bg-emerald-600';
    return 'bg-emerald-500 dark:bg-emerald-500';
  };

  const hours = Array.from(
    { length: timeEnd - timeStart },
    (_, i) => timeStart + i
  );

  if (participants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-2 text-4xl">👥</div>
        <p className="text-zinc-600 dark:text-zinc-400">
          No responses yet. Share the link to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
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
                  const count = slotCounts[datetime] || 0;
                  return (
                    <div
                      key={datetime}
                      className={`relative h-6 w-20 shrink-0 border-l border-t border-zinc-200 transition-colors dark:border-zinc-700 ${getHeatColor(count)}`}
                      title={`${count} / ${participants.length} available`}
                    >
                      {count > 0 && (
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-zinc-700 dark:text-zinc-200">
                          {count}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Hour half (XX:30) */}
              <div className="flex">
                <div className="w-16 shrink-0" />
                {dates.map((date) => {
                  const datetime = `${date}T${hour.toString().padStart(2, '0')}:30`;
                  const count = slotCounts[datetime] || 0;
                  return (
                    <div
                      key={datetime}
                      className={`relative h-6 w-20 shrink-0 border-l border-zinc-200 transition-colors dark:border-zinc-700 ${getHeatColor(count)}`}
                      title={`${count} / ${participants.length} available`}
                    >
                      {count > 0 && (
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-zinc-700 dark:text-zinc-200">
                          {count}
                        </span>
                      )}
                    </div>
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

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
        <span>Availability:</span>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded bg-zinc-100 dark:bg-zinc-800" />
          <span>0</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded bg-emerald-200 dark:bg-emerald-900" />
          <div className="h-4 w-4 rounded bg-emerald-300 dark:bg-emerald-700" />
          <div className="h-4 w-4 rounded bg-emerald-400 dark:bg-emerald-600" />
          <div className="h-4 w-4 rounded bg-emerald-500" />
          <span>{participants.length}</span>
        </div>
      </div>

      {/* Participants list */}
      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
        <h4 className="mb-2 font-medium text-zinc-900 dark:text-zinc-100">
          Responses ({participants.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {participants.map((p) => (
            <span
              key={p.id}
              className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
