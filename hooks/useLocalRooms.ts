'use client';

import { useState, useCallback } from 'react';
import type { LocalRoom } from '@/types';

const STORAGE_KEY = 'meet-scheduler-rooms';

function getStoredRooms(): LocalRoom[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function useLocalRooms() {
  const [rooms, setRooms] = useState<LocalRoom[]>(() => getStoredRooms());

  const addRoom = useCallback((room: LocalRoom) => {
    setRooms((prev) => {
      const updated = [room, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeRoom = useCallback((id: string) => {
    setRooms((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isLoaded = typeof window !== 'undefined';

  return { rooms, isLoaded, addRoom, removeRoom };
}
