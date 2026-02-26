import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Testimony from '@/lib/models/Testimony';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const approved = searchParams.get('approved');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const filter: Record<string, unknown> = {};
    if (approved !== null && approved !== '') filter.isApproved = approved === 'true';
    if (featured !== null && featured !== '') filter.isFeatured = featured === 'true';

    const testimonies = await Testimony.find(filter)
      .sort('-createdAt')
      .limit(limit)
      .lean();

    return NextResponse.json(testimonies);
  } catch (error) {
    console.error('GET /api/testimonies error:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    if (!body.title || !body.body || !body.authorName) {
      return NextResponse.json({ error: 'Title, body, and author name are required' }, { status: 400 });
    }

    const testimony = await Testimony.create(body);
    return NextResponse.json(testimony, { status: 201 });
  } catch (error) {
    console.error('POST /api/testimonies error:', error);
    return NextResponse.json({ error: 'Failed to submit testimony' }, { status: 500 });
  }
}
