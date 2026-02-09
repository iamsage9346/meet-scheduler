'use client';

import { useMemo } from 'react';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Participant } from '@/types';

interface BookingSlotsProps {
  hostSlots: string[];
  participants: Participant[];
  selectedSlot: string | null;
  onSlotSelect: (slot: string | null) => void;
  readOnly?: boolean;
  isHost?: boolean;
}

export default function BookingSlots({
  hostSlots,
  participants,
  selectedSlot,
  onSlotSelect,
  readOnly = false,
  isHost = false,
}: BookingSlotsProps) {
  const bookedSlots = useMemo(() => {
    const booked = new Map<string, Participant>();
    participants.forEach((p) => {
      p.availableSlots.forEach((slot) => {
        booked.set(slot, p);
      });
    });
    return booked;
  }, [participants]);

  const slotsByDate = useMemo(() => {
    const grouped = new Map<string, string[]>();
    hostSlots.forEach((slot) => {
      const date = slot.split('T')[0];
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(slot);
    });
    // Sort slots within each date
    grouped.forEach((slots) => {
      slots.sort();
    });
    return grouped;
  }, [hostSlots]);

  const formatSlotTime = (slot: string) => {
    const time = slot.split('T')[1];
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  if (hostSlots.length === 0) {
    return (
      <div className="py-8 text-center text-zinc-500 dark:text-zinc-400">
        No available slots
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Array.from(slotsByDate.entries()).map(([date, slots]) => (
        <div key={date}>
          <h3 className="mb-3 font-medium text-zinc-900 dark:text-zinc-100">
            {formatDate(date)}
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {slots.map((slot) => {
              const bookedBy = bookedSlots.get(slot);
              const isBooked = !!bookedBy;
              const isSelected = selectedSlot === slot;

              return (
                <button
                  key={slot}
                  type="button"
                  disabled={readOnly || isBooked}
                  onClick={() => {
                    if (!isBooked) {
                      onSlotSelect(isSelected ? null : slot);
                    }
                  }}
                  className={cn(
                    'relative rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                    isBooked
                      ? 'cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500'
                      : isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'border-zinc-200 bg-white text-zinc-700 hover:border-emerald-300 hover:bg-emerald-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/20',
                    readOnly && 'cursor-default'
                  )}
                >
                  <span>{formatSlotTime(slot)}</span>
                  {isBooked && (
                    <span className="mt-1 block truncate text-xs">
                      {isHost ? bookedBy.name : 'Booked'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
