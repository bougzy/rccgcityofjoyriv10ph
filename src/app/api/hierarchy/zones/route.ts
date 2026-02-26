import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Zone from '@/lib/models/Zone';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const province = searchParams.get('province');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (province) {
      filter.province = province;
    }

    const zones = await Zone.find(filter)
      .populate('province')
      .sort({ name: 1 })
      .lean();

    return NextResponse.json(zones);
  } catch (error) {
    console.error('GET /api/hierarchy/zones error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch zones' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const zone = await Zone.create(body);

    return NextResponse.json(zone, { status: 201 });
  } catch (error) {
    console.error('POST /api/hierarchy/zones error:', error);
    return NextResponse.json(
      { error: 'Failed to create zone' },
      { status: 500 }
    );
  }
}
