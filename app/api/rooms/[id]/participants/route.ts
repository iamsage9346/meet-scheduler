import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { participants } from '@/db/schema';

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

    const [participant] = await db
      .insert(participants)
      .values({
        roomId,
        name,
        email: email || null,
        availableSlots,
      })
      .returning();

    return NextResponse.json(participant);
  } catch (error) {
    console.error('Error adding participant:', error);
    return NextResponse.json(
      { error: 'Failed to add participant' },
      { status: 500 }
    );
  }
}
