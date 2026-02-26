import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Devotional from '@/lib/models/Devotional';
import { getSessionUser, hasMinimumRole } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');
    const limit = parseInt(searchParams.get('limit') || '30', 10);

    const filter: Record<string, unknown> = {};
    if (published !== null && published !== '') filter.isPublished = published === 'true';

    const devotionals = await Devotional.find(filter)
      .sort('-date')
      .limit(limit)
      .lean();

    return NextResponse.json(devotionals);
  } catch (error) {
    console.error('GET /api/devotionals error:', error);
    return NextResponse.json({ error: 'Failed to fetch devotionals' }, { status: 500 });
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

    if (!body.title || !body.body || !body.date) {
      return NextResponse.json({ error: 'Title, body, and date are required' }, { status: 400 });
    }

    const devotional = await Devotional.create(body);
    return NextResponse.json(devotional, { status: 201 });
  } catch (error) {
    console.error('POST /api/devotionals error:', error);
    return NextResponse.json({ error: 'Failed to create devotional' }, { status: 500 });
  }
}
