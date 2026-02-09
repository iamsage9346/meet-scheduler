'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker from '@/components/DatePicker';
import TimeGrid from '@/components/TimeGrid';
import { useLocalRooms } from '@/hooks/useLocalRooms';
import { cn, formatDate } from '@/lib/utils';
import type { RoomType } from '@/types';

export default function Home() {
  const router = useRouter();
  const { addRoom } = useLocalRooms();

  const [roomType, setRoomType] = useState<RoomType>('availability');
  const [title, setTitle] = useState('');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [timeStart, setTimeStart] = useState(9);
  const [timeEnd, setTimeEnd] = useState(17);
  const [timeRanges, setTimeRanges] = useState<Record<string, [number, number]>>({});
  const [hostSlots, setHostSlots] = useState<string[]>([]);

  // Host info for booking type
  const [hostName, setHostName] = useState('');
  const [hostEmail, setHostEmail] = useState('');
  const [meetLink, setMeetLink] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (selectedDates.length === 0) {
      setError('Please select at least one date');
      return;
    }

    // Validate time ranges
    const hasInvalidTimeRange = selectedDates.some((date) => {
      const range = timeRanges[date] || [timeStart, timeEnd];
      return range[0] >= range[1];
    });
    if (hasInvalidTimeRange) {
      setError('End time must be after start time for all dates');
      return;
    }

    if (roomType === 'booking' && hostSlots.length === 0) {
      setError('Please select at least one available time slot');
      return;
    }

    if (roomType === 'booking' && !hostName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);

    try {
      // Build time ranges for all dates
      const finalTimeRanges: Record<string, [number, number]> = {};
      selectedDates.forEach((date) => {
        finalTimeRanges[date] = timeRanges[date] || [timeStart, timeEnd];
      });

      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          type: roomType,
          dates: selectedDates,
          timeStart,
          timeEnd,
          timeRanges: roomType === 'availability' ? finalTimeRanges : null,
          hostSlots: roomType === 'booking' ? hostSlots : null,
          hostName: roomType === 'booking' ? hostName.trim() : null,
          hostEmail: roomType === 'booking' && hostEmail.trim() ? hostEmail.trim() : null,
          meetLink: roomType === 'booking' && meetLink.trim() ? meetLink.trim() : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create room');
      }

      const room = await response.json();

      addRoom({
        id: room.id,
        title: room.title,
        type: room.type,
        createdAt: room.createdAt,
      });

      router.push(`/room/${room.id}`);
    } catch {
      setError('Failed to create room. Please try again.');
      setIsLoading(false);
    }
  };

  const timeOptions = Array.from({ length: 24 }, (_, i) => i);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Create a new event
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Set up your availability poll or interview booking
        </p>
      </div>

      {/* Room Type Tabs */}
      <div className="mb-8 flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        <button
          type="button"
          onClick={() => {
            if (roomType !== 'availability') {
              setRoomType('availability');
              // Reset all form state when switching tabs
              setTitle('');
              setSelectedDates([]);
              setTimeStart(9);
              setTimeEnd(17);
              setTimeRanges({});
              setHostSlots([]);
              setHostName('');
              setHostEmail('');
              setMeetLink('');
              setError('');
            }
          }}
          className={cn(
            'flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
            roomType === 'availability'
              ? 'bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-100'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          )}
        >
          <span className="block text-base">📅 Group Availability</span>
          <span className="block text-xs text-zinc-500 dark:text-zinc-400">
            Find the best time for everyone
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (roomType !== 'booking') {
              setRoomType('booking');
              // Reset all form state when switching tabs
              setTitle('');
              setSelectedDates([]);
              setTimeStart(9);
              setTimeEnd(17);
              setTimeRanges({});
              setHostSlots([]);
              setHostName('');
              setHostEmail('');
              setMeetLink('');
              setError('');
            }
          }}
          className={cn(
            'flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
            roomType === 'booking'
              ? 'bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-100'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          )}
        >
          <span className="block text-base">🎯 Interview Booking</span>
          <span className="block text-xs text-zinc-500 dark:text-zinc-400">
            Let others book a time slot
          </span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {roomType === 'availability' ? 'Event title' : 'Interview title'}
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              roomType === 'availability'
                ? 'Team meeting, Project kickoff...'
                : 'Customer Interview, Career Counseling...'
            }
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>

        {/* Host Info (for booking type) */}
        {roomType === 'booking' && (
          <div className="space-y-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
            <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Your Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="hostName"
                  className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Your name *
                </label>
                <input
                  type="text"
                  id="hostName"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
              </div>
              <div>
                <label
                  htmlFor="hostEmail"
                  className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Your email (for notifications)
                </label>
                <input
                  type="email"
                  id="hostEmail"
                  value={hostEmail}
                  onChange={(e) => setHostEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="meetLink"
                className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Google Meet / Zoom link (optional)
              </label>
              <input
                type="url"
                id="meetLink"
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                This link will be sent to guests when they book
              </p>
            </div>
          </div>
        )}

        {/* Date Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Select dates
          </label>
          <DatePicker
            selectedDates={selectedDates}
            onDatesChange={(dates) => {
              setSelectedDates(dates);
              // Reset host slots when dates change
              if (roomType === 'booking') {
                setHostSlots([]);
              }
              // Clean up time ranges for removed dates
              setTimeRanges((prev) => {
                const updated: Record<string, [number, number]> = {};
                dates.forEach((date) => {
                  if (prev[date]) {
                    updated[date] = prev[date];
                  }
                });
                return updated;
              });
            }}
          />
        </div>

        {/* Default Time Range */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {roomType === 'availability' ? 'Default time range' : 'Time range'}
          </label>
          <div className="flex items-center gap-4">
            <select
              value={timeStart}
              onChange={(e) => {
                setTimeStart(Number(e.target.value));
                if (roomType === 'booking') setHostSlots([]);
              }}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {timeOptions.map((hour) => (
                <option key={hour} value={hour}>
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </option>
              ))}
            </select>
            <span className="text-zinc-600 dark:text-zinc-400">to</span>
            <select
              value={timeEnd}
              onChange={(e) => {
                setTimeEnd(Number(e.target.value));
                if (roomType === 'booking') setHostSlots([]);
              }}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {timeOptions.map((hour) => (
                <option key={hour} value={hour}>
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Per-date Time Ranges (for availability type) */}
        {roomType === 'availability' && selectedDates.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Adjust time per date (optional)
            </label>
            <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
              Customize time ranges for specific dates if needed
            </p>
            <div className="space-y-2">
              {selectedDates.map((date) => {
                const range = timeRanges[date] || [timeStart, timeEnd];
                return (
                  <div
                    key={date}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
                  >
                    <span className="min-w-[100px] text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {formatDate(date)}
                    </span>
                    <div className="flex items-center gap-2">
                      <select
                        value={range[0]}
                        onChange={(e) => {
                          setTimeRanges((prev) => ({
                            ...prev,
                            [date]: [Number(e.target.value), range[1]],
                          }));
                        }}
                        className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                      >
                        {timeOptions.map((hour) => (
                          <option key={hour} value={hour}>
                            {hour === 0 ? '12AM' : hour < 12 ? `${hour}AM` : hour === 12 ? '12PM' : `${hour - 12}PM`}
                          </option>
                        ))}
                      </select>
                      <span className="text-zinc-500">-</span>
                      <select
                        value={range[1]}
                        onChange={(e) => {
                          setTimeRanges((prev) => ({
                            ...prev,
                            [date]: [range[0], Number(e.target.value)],
                          }));
                        }}
                        className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                      >
                        {timeOptions.map((hour) => (
                          <option key={hour} value={hour}>
                            {hour === 0 ? '12AM' : hour < 12 ? `${hour}AM` : hour === 12 ? '12PM' : `${hour - 12}PM`}
                          </option>
                        ))}
                      </select>
                      {timeRanges[date] && (
                        <button
                          type="button"
                          onClick={() => {
                            setTimeRanges((prev) => {
                              const updated = { ...prev };
                              delete updated[date];
                              return updated;
                            });
                          }}
                          className="ml-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Host Slots Selection (for booking type) */}
        {roomType === 'booking' && selectedDates.length > 0 && timeStart < timeEnd && (
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Select your available time slots
            </label>
            <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
              Click and drag to select times when you&apos;re available for interviews
            </p>
            <TimeGrid
              dates={selectedDates}
              timeStart={timeStart}
              timeEnd={timeEnd}
              selectedSlots={hostSlots}
              onSlotsChange={setHostSlots}
            />
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {hostSlots.length} slot{hostSlots.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-emerald-500 py-3 font-medium text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </main>
  );
}
