import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { rooms } from '@/db/schema';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, type, dates, timeStart, timeEnd, hostSlots } = body;

    if (!title || !dates?.length || timeStart === undefined || timeEnd === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = getDb();
    const [room] = await db
      .insert(rooms)
      .values({
        title,
        type: type || 'availability',
        dates,
        timeStart,
        timeEnd,
        hostSlots: hostSlots || null,
      })
      .returning();

    return NextResponse.json(room);
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}
