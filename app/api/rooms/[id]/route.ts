import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rooms, participants } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [room] = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, id))
      .limit(1);

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    const roomParticipants = await db
      .select()
      .from(participants)
      .where(eq(participants.roomId, id));

    return NextResponse.json({
      ...room,
      participants: roomParticipants,
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    );
  }
}
