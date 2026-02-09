import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { participants, rooms } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendBookingConfirmation, sendBookingNotificationToHost } from '@/lib/email';

function formatDateTime(slot: string): string {
  const date = slot.split('T')[0];
  const time = slot.split('T')[1];
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;

  const dateObj = new Date(date + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `${formattedDate} at ${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const body = await request.json();
    const { name, email, availableSlots } = body;

    if (!name || !availableSlots) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Get room info for email
    const [room] = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, roomId))
      .limit(1);

    // Insert participant
    const [participant] = await db
      .insert(participants)
      .values({
        roomId,
        name,
        email: email || null,
        availableSlots,
      })
      .returning();

    // Send emails for booking type rooms
    if (room && room.type === 'booking' && availableSlots.length > 0) {
      const slot = availableSlots[0];
      const dateTime = formatDateTime(slot);

      // Send confirmation to guest (if email provided)
      if (email) {
        await sendBookingConfirmation({
          to: email,
          guestName: name,
          hostName: room.hostName || 'Host',
          eventTitle: room.title,
          dateTime,
          meetLink: room.meetLink,
        });
      }

      // Send notification to host (if host email provided)
      if (room.hostEmail && email) {
        await sendBookingNotificationToHost({
          to: room.hostEmail,
          hostName: room.hostName || 'Host',
          guestName: name,
          guestEmail: email,
          eventTitle: room.title,
          dateTime,
        });
      }
    }

    return NextResponse.json(participant);
  } catch (error) {
    console.error('Error adding participant:', error);
    return NextResponse.json(
      { error: 'Failed to add participant' },
      { status: 500 }
    );
  }
}
