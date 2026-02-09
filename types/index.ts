export type RoomType = 'availability' | 'booking';

export interface Room {
  id: string;
  title: string;
  type: RoomType;
  dates: string[];
  timeStart: number;
  timeEnd: number;
  timeRanges: Record<string, [number, number]> | null; // Per-date time ranges
  hostSlots: string[] | null;
  hostName: string | null;
  hostEmail: string | null;
  meetLink: string | null;
  createdAt: Date;
}

export interface Participant {
  id: string;
  roomId: string;
  name: string;
  email?: string | null;
  availableSlots: string[];
  createdAt: Date;
}

export interface TimeSlot {
  date: string;
  time: string;
  datetime: string;
}

export interface LocalRoom {
  id: string;
  title: string;
  type: RoomType;
  createdAt: string;
}
