import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/lib/models/Event';
import { getSessionUser, hasMinimumRole, getScopeFilter } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const entityId = searchParams.get('entityId');
    const upcoming = searchParams.get('upcoming');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const sort = searchParams.get('sort') || '-startDate';

    const filter: Record<string, unknown> = { isActive: true };
    if (level) filter.level = level;
    if (entityId) filter.entityId = entityId;
    if (upcoming === 'true') filter.startDate = { $gte: new Date() };

    const sortObj: Record<string, 1 | -1> = {};
    sort.split(',').forEach((f) => {
      sortObj[f.startsWith('-') ? f.substring(1) : f] = f.startsWith('-') ? -1 : 1;
    });

    const events = await Event.find(filter).sort(sortObj).limit(limit).lean();

    return NextResponse.json(events);
  } catch (error) {
    console.error('GET /api/events error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !hasMinimumRole(user.role || '', 'parish-admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();

    if (!body.title || !body.startDate) {
      return NextResponse.json({ error: 'Title and start date are required' }, { status: 400 });
    }

    const event = await Event.create({
      ...body,
      createdBy: user.id,
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('POST /api/events error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
