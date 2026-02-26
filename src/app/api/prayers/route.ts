import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PrayerRequest from '@/lib/models/PrayerRequest';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const approved = searchParams.get('approved');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (approved !== null && approved !== '') filter.isApproved = approved === 'true';

    const prayers = await PrayerRequest.find(filter)
      .sort('-createdAt')
      .limit(limit)
      .lean();

    return NextResponse.json(prayers);
  } catch (error) {
    console.error('GET /api/prayers error:', error);
    return NextResponse.json({ error: 'Failed to fetch prayers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    if (!body.title || !body.body || !body.authorName) {
      return NextResponse.json({ error: 'Title, body, and author name are required' }, { status: 400 });
    }

    const prayer = await PrayerRequest.create(body);
    return NextResponse.json(prayer, { status: 201 });
  } catch (error) {
    console.error('POST /api/prayers error:', error);
    return NextResponse.json({ error: 'Failed to submit prayer' }, { status: 500 });
  }
}
