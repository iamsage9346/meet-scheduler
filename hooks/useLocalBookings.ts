'use client';

import { useState, useCallback } from 'react';

const STORAGE_KEY = 'meet-scheduler-bookings';

export interface LocalBooking {
  id: string; // participant id
  roomId: string;
  roomTitle: string;
  name: string;
  slot: string;
  createdAt: string;
}

function getStoredBookings(): LocalBooking[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function useLocalBookings() {
  const [bookings, setBookings] = useState<LocalBooking[]>(() => getStoredBookings());
  const [isLoading, setIsLoading] = useState(false);

  const addBooking = useCallback((booking: LocalBooking) => {
    setBookings((prev) => {
      const updated = [booking, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeBooking = useCallback(async (id: string) => {
    // Find the booking to get roomId
    const booking = getStoredBookings().find((b) => b.id === id);
    if (!booking) return;

    setIsLoading(true);
    try {
      // Call API to delete from database
      const res = await fetch(`/api/rooms/${booking.roomId}/participants/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to cancel booking');
      }

      // Remove from localStorage
      setBookings((prev) => {
        const updated = prev.filter((b) => b.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Error canceling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { bookings, addBooking, removeBooking, isLoading };
}
