import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/lib/models/Event';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventToken: string }> }
) {
  try {
    await dbConnect();
    const { eventToken } = await params;

    if (!eventToken) {
      return NextResponse.json({ error: 'Event token is required' }, { status: 400 });
    }

    const event = await Event.findOne({ eventToken, isActive: true })
      .populate('parish', 'name')
      .lean();

    if (!event) {
      return NextResponse.json({ error: 'Event not found or inactive' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('GET /api/events/by-token/[eventToken] error:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}
