import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Sermon from '@/lib/models/Sermon';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const destination = searchParams.get('destination');
    const sort = searchParams.get('sort') || '-createdAt';

    // Build filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    if (destination) {
      filter.destinations = destination;
    }

    // Parse sort string (e.g. "-createdAt" => { createdAt: -1 })
    const sortObj: Record<string, 1 | -1> = {};
    const sortFields = sort.split(',');
    for (const field of sortFields) {
      if (field.startsWith('-')) {
        sortObj[field.substring(1)] = -1;
      } else {
        sortObj[field] = 1;
      }
    }

    const sermons = await Sermon.find(filter)
      .sort(sortObj)
      .limit(limit)
      .lean();

    return NextResponse.json(sermons);
  } catch (error) {
    console.error('GET /api/sermons error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sermons' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const sermon = await Sermon.create(body);

    return NextResponse.json(sermon, { status: 201 });
  } catch (error) {
    console.error('POST /api/sermons error:', error);
    return NextResponse.json(
      { error: 'Failed to create sermon' },
      { status: 500 }
    );
  }
}
