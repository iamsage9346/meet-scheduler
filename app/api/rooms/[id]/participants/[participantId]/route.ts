import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { participants } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  try {
    const { id: roomId, participantId } = await params;

    const db = getDb();

    // Delete the participant
    const [deleted] = await db
      .delete(participants)
      .where(
        and(
          eq(participants.id, participantId),
          eq(participants.roomId, roomId)
        )
      )
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error canceling booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
