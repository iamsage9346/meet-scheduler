'use client';

import Link from 'next/link';
import type { LocalRoom } from '@/types';

interface RoomCardProps {
  room: LocalRoom;
  onRemove: (id: string) => void;
}

export default function RoomCard({ room, onRemove }: RoomCardProps) {
  const createdDate = new Date(room.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isBooking = room.type === 'booking';

  return (
    <div className="group flex items-center justify-between rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600">
      <Link href={`/room/${room.id}`} className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span>{isBooking ? '🎯' : '📅'}</span>
          <h3 className="truncate font-medium text-zinc-900 dark:text-zinc-100">
            {room.title}
          </h3>
        </div>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {isBooking ? 'Interview Booking' : 'Group Availability'} · Created {createdDate}
        </p>
      </Link>
      <div className="ml-4 flex shrink-0 gap-2">
        <Link
          href={`/room/${room.id}`}
          className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          View
        </Link>
        <button
          onClick={() => onRemove(room.id)}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
