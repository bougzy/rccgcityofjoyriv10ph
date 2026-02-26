import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Convert from '@/lib/models/Convert';
import { getSessionUser, hasMinimumRole } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !hasMinimumRole(user.role || '', 'parish-admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const parish = searchParams.get('parish');
    const stage = searchParams.get('stage');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const filter: Record<string, unknown> = { isActive: true };
    if (parish) filter.parish = parish;
    if (stage) filter.stage = stage;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const converts = await Convert.find(filter)
      .populate('parish', 'name')
      .sort('-firstVisitDate')
      .limit(limit)
      .lean();

    return NextResponse.json(converts);
  } catch (error) {
    console.error('GET /api/converts error:', error);
    return NextResponse.json({ error: 'Failed to fetch converts' }, { status: 500 });
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

    if (!body.fullName || !body.parish || !body.firstVisitDate) {
      return NextResponse.json({ error: 'Full name, parish, and first visit date are required' }, { status: 400 });
    }

    const convert = await Convert.create({
      ...body,
      stage: 'first-visit',
      stageHistory: [{ stage: 'first-visit', enteredAt: new Date(), notes: 'Initial registration' }],
      createdBy: user.id,
    });

    return NextResponse.json(convert, { status: 201 });
  } catch (error) {
    console.error('POST /api/converts error:', error);
    return NextResponse.json({ error: 'Failed to create convert record' }, { status: 500 });
  }
}
