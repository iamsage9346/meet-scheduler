'use client';

import { useState, useEffect, use, useMemo } from 'react';
import TimeGrid from '@/components/TimeGrid';
import HeatMap from '@/components/HeatMap';
import BookingSlots from '@/components/BookingSlots';
import { useLocalRooms } from '@/hooks/useLocalRooms';
import { useLocalBookings } from '@/hooks/useLocalBookings';
import type { Room, Participant } from '@/types';

interface RoomData extends Room {
  participants: Participant[];
}

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { rooms: localRooms } = useLocalRooms();
  const { addBooking } = useLocalBookings();
  const [room, setRoom] = useState<RoomData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectedBookingSlot, setSelectedBookingSlot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const [activeTab, setActiveTab] = useState<'respond' | 'results'>('respond');

  // Check if current user is the host (created this room)
  const isHost = useMemo(() => {
    return localRooms.some((r) => r.id === id);
  }, [localRooms, id]);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Room not found');
          } else {
            throw new Error('Failed to fetch room');
          }
          return;
        }
        const data = await response.json();
        setRoom(data);
      } catch {
        setError('Failed to load room');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  const bookedSlots = useMemo(() => {
    if (!room || room.type !== 'booking') return new Set<string>();
    const booked = new Set<string>();
    room.participants.forEach((p) => {
      p.availableSlots.forEach((slot) => booked.add(slot));
    });
    return booked;
  }, [room]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    if (room?.type === 'booking' && !selectedBookingSlot) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/rooms/${id}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: room?.type === 'booking' ? email.trim() : undefined,
          availableSlots: room?.type === 'booking' ? [selectedBookingSlot] : selectedSlots,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      const participant = await response.json();
      setRoom((prev) =>
        prev ? { ...prev, participants: [...prev.participants, participant] } : null
      );

      // Save booking to localStorage for visitor's "My Bookings" page
      if (room?.type === 'booking' && selectedBookingSlot && !isHost) {
        addBooking({
          id: participant.id,
          roomId: id,
          roomTitle: room.title,
          name: name.trim(),
          slot: selectedBookingSlot,
          createdAt: new Date().toISOString(),
        });
      }

      setSubmitted(true);
      // For booking type visitors, stay on respond tab (they can't see results)
      if (room?.type !== 'booking' || isHost) {
        setActiveTab('results');
      }
    } catch {
      setError('Failed to submit response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      </main>
    );
  }

  if (error || !room) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg bg-red-50 p-6 text-center dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">{error || 'Room not found'}</p>
        </div>
      </main>
    );
  }

  const isBookingType = room.type === 'booking';
  // For booking type, only host can see results tab
  const showResultsTab = !isBookingType || isHost;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{isBookingType ? '🎯' : '📅'}</span>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {room.title}
          </h1>
        </div>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {isBookingType ? 'Interview Booking' : 'Group Availability'}
          {isHost && <span className="ml-2 rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Host</span>}
        </p>
        <div className="mt-3 flex items-center gap-4">
          <button
            onClick={copyLink}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          {/* Only show booking count to host */}
          {(!isBookingType || isHost) && (
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {room.participants.length} {isBookingType ? 'booking' : 'response'}{room.participants.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Tabs - Only show results tab if allowed */}
      {showResultsTab ? (
        <div className="mb-6 flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
          <button
            onClick={() => setActiveTab('respond')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'respond'
                ? 'bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-100'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            {isBookingType ? 'Book a Time' : 'Add Response'}
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'results'
                ? 'bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-100'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            {isBookingType ? 'All Bookings' : 'View Results'}
          </button>
        </div>
      ) : null}

      {/* Content */}
      {activeTab === 'respond' || !showResultsTab ? (
        submitted ? (
          <div className="rounded-lg bg-emerald-50 p-6 text-center dark:bg-emerald-900/20">
            <div className="mb-2 text-4xl">✓</div>
            <p className="font-medium text-emerald-700 dark:text-emerald-400">
              {isBookingType ? 'Booking confirmed!' : 'Response submitted successfully!'}
            </p>
            {isBookingType && selectedBookingSlot && (
              <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">
                {(() => {
                  const date = selectedBookingSlot.split('T')[0];
                  const time = selectedBookingSlot.split('T')[1];
                  const [hours, minutes] = time.split(':').map(Number);
                  const period = hours >= 12 ? 'PM' : 'AM';
                  const displayHour = hours % 12 || 12;
                  return `${new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })} at ${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
                })()}
              </p>
            )}
            <button
              onClick={() => {
                setSubmitted(false);
                setName('');
                setEmail('');
                setSelectedSlots([]);
                setSelectedBookingSlot(null);
              }}
              className="mt-4 text-sm text-emerald-600 underline hover:no-underline dark:text-emerald-400"
            >
              {isBookingType ? 'Book another slot' : 'Submit another response'}
            </button>
          </div>
        ) : isBookingType ? (
          // Booking Type Form
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Your name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Email (optional)
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Select a time slot
              </p>
              <BookingSlots
                hostSlots={room.hostSlots || []}
                participants={room.participants}
                selectedSlot={selectedBookingSlot}
                onSlotSelect={setSelectedBookingSlot}
                isHost={isHost}
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim() || !selectedBookingSlot || bookedSlots.has(selectedBookingSlot) || isSubmitting}
              className="rounded-lg bg-emerald-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </form>
        ) : (
          // Availability Type Form
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Your name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Select your available times (click and drag)
              </p>
              <TimeGrid
                dates={room.dates}
                timeStart={room.timeStart}
                timeEnd={room.timeEnd}
                timeRanges={room.timeRanges}
                selectedSlots={selectedSlots}
                onSlotsChange={setSelectedSlots}
              />
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                {selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''} selected
              </p>
            </div>

            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="rounded-lg bg-emerald-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Response'}
            </button>
          </form>
        )
      ) : isBookingType ? (
        // Booking Results (Host only)
        <div className="space-y-4">
          {room.participants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-2 text-4xl">📅</div>
              <p className="text-zinc-600 dark:text-zinc-400">
                No bookings yet. Share the link to get started!
              </p>
            </div>
          ) : (
            <>
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                Bookings ({room.participants.length})
              </h3>
              <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-700 dark:border-zinc-700">
                {room.participants.map((p) => {
                  const slot = p.availableSlots[0];
                  const date = slot?.split('T')[0];
                  const time = slot?.split('T')[1];
                  const [hours, minutes] = (time || '00:00').split(':').map(Number);
                  const period = hours >= 12 ? 'PM' : 'AM';
                  const displayHour = hours % 12 || 12;
                  const formattedTime = `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;

                  return (
                    <div key={p.id} className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          {p.name}
                        </p>
                        {p.email && (
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            {p.email}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          {formattedTime}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {date && new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ) : (
        // Availability Results
        <HeatMap
          dates={room.dates}
          timeStart={room.timeStart}
          timeEnd={room.timeEnd}
          timeRanges={room.timeRanges}
          participants={room.participants}
        />
      )}
    </main>
  );
}
