import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/lib/models/Event';
import EventAttendance from '@/lib/models/EventAttendance';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const attendees = await EventAttendance.find({ event: id })
      .sort('-checkInTime')
      .lean();

    return NextResponse.json(attendees);
  } catch (error) {
    console.error('GET /api/events/[id]/attendance error:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;

    const event = await Event.findById(id);
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    if (!event.isActive) return NextResponse.json({ error: 'Event is not active' }, { status: 400 });

    // Check max attendees
    if (event.maxAttendees) {
      const count = await EventAttendance.countDocuments({ event: id });
      if (count >= event.maxAttendees) {
        return NextResponse.json({ error: 'Event is full' }, { status: 400 });
      }
    }

    const body = await request.json();
    if (!body.fullName) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    const record = await EventAttendance.create({
      event: id,
      ...body,
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('POST /api/events/[id]/attendance error:', error);
    return NextResponse.json({ error: 'Failed to record attendance' }, { status: 500 });
  }
}
