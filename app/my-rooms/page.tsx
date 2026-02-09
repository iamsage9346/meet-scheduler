'use client';

import { useState } from 'react';
import Link from 'next/link';
import RoomCard from '@/components/RoomCard';
import { useLocalRooms } from '@/hooks/useLocalRooms';
import { useLocalBookings, type LocalBooking } from '@/hooks/useLocalBookings';
import { cn } from '@/lib/utils';

function BookingCard({ booking, onRemove, isLoading }: { booking: LocalBooking; onRemove: (id: string) => void; isLoading: boolean }) {
  const date = booking.slot.split('T')[0];
  const time = booking.slot.split('T')[1];
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  const formattedTime = `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600">
      <Link href={`/room/${booking.roomId}`} className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span>🎯</span>
          <h3 className="truncate font-medium text-zinc-900 dark:text-zinc-100">
            {booking.roomTitle}
          </h3>
        </div>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {formattedDate} at {formattedTime} · Booked as {booking.name}
        </p>
      </Link>
      <div className="ml-4 flex shrink-0 gap-2">
        <Link
          href={`/room/${booking.roomId}`}
          className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          View
        </Link>
        <button
          onClick={() => onRemove(booking.id)}
          disabled={isLoading}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          {isLoading ? 'Canceling...' : 'Cancel'}
        </button>
      </div>
    </div>
  );
}

export default function MyRoomsPage() {
  const { rooms, removeRoom } = useLocalRooms();
  const { bookings, removeBooking, isLoading } = useLocalBookings();
  const [activeTab, setActiveTab] = useState<'rooms' | 'bookings'>('rooms');

  const hasRooms = rooms.length > 0;
  const hasBookings = bookings.length > 0;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          My Activity
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Manage your events and bookings
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        <button
          onClick={() => setActiveTab('rooms')}
          className={cn(
            'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'rooms'
              ? 'bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-100'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          )}
        >
          My Events ({rooms.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={cn(
            'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'bookings'
              ? 'bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-100'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          )}
        >
          My Bookings ({bookings.length})
        </button>
      </div>

      {activeTab === 'rooms' ? (
        !hasRooms ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
            <div className="mb-4 text-4xl">📅</div>
            <p className="mb-4 text-zinc-600 dark:text-zinc-400">
              You haven&apos;t created any events yet
            </p>
            <Link
              href="/"
              className="inline-flex rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-600"
            >
              Create your first event
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} onRemove={removeRoom} />
            ))}
          </div>
        )
      ) : !hasBookings ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <div className="mb-4 text-4xl">🎯</div>
          <p className="text-zinc-600 dark:text-zinc-400">
            You haven&apos;t made any bookings yet
          </p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
            When you book an interview slot, it will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} onRemove={removeBooking} isLoading={isLoading} />
          ))}
        </div>
      )}
    </main>
  );
}
