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

  const addBooking = useCallback((booking: LocalBooking) => {
    setBookings((prev) => {
      const updated = [booking, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeBooking = useCallback((id: string) => {
    setBookings((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { bookings, addBooking, removeBooking };
}
