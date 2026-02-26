import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Parish from '@/lib/models/Parish';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const area = searchParams.get('area');
    const zone = searchParams.get('zone');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (area) {
      filter.area = area;
    }

    if (zone) {
      filter.zone = zone;
    }

    const parishes = await Parish.find(filter)
      .populate('area')
      .populate('zone')
      .sort({ name: 1 })
      .lean();

    return NextResponse.json(parishes);
  } catch (error) {
    console.error('GET /api/hierarchy/parishes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch parishes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const parish = await Parish.create(body);

    return NextResponse.json(parish, { status: 201 });
  } catch (error) {
    console.error('POST /api/hierarchy/parishes error:', error);
    return NextResponse.json(
      { error: 'Failed to create parish' },
      { status: 500 }
    );
  }
}
