import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Area from '@/lib/models/Area';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const zone = searchParams.get('zone');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (zone) {
      filter.zone = zone;
    }

    const areas = await Area.find(filter)
      .populate('zone')
      .sort({ name: 1 })
      .lean();

    return NextResponse.json(areas);
  } catch (error) {
    console.error('GET /api/hierarchy/areas error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch areas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const area = await Area.create(body);

    return NextResponse.json(area, { status: 201 });
  } catch (error) {
    console.error('POST /api/hierarchy/areas error:', error);
    return NextResponse.json(
      { error: 'Failed to create area' },
      { status: 500 }
    );
  }
}
