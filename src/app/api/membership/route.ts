import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MembershipSnapshot from '@/lib/models/MembershipSnapshot';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const entityId = searchParams.get('entityId');
    const startMonth = searchParams.get('startMonth');
    const endMonth = searchParams.get('endMonth');

    // Build filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (level) {
      filter.level = level;
    }

    if (entityId) {
      filter.entityId = entityId;
    }

    if (startMonth || endMonth) {
      filter.month = {};
      if (startMonth) {
        filter.month.$gte = startMonth;
      }
      if (endMonth) {
        filter.month.$lte = endMonth;
      }
    }

    const snapshots = await MembershipSnapshot.find(filter)
      .sort({ month: -1 })
      .lean();

    return NextResponse.json(snapshots);
  } catch (error) {
    console.error('GET /api/membership error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch membership snapshots' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    if (!body.entityId || !body.month) {
      return NextResponse.json(
        { error: 'entityId and month are required' },
        { status: 400 }
      );
    }

    // Upsert by entityId + month
    const snapshot = await MembershipSnapshot.findOneAndUpdate(
      { entityId: body.entityId, month: body.month },
      body,
      { upsert: true, new: true, runValidators: true }
    ).lean();

    return NextResponse.json(snapshot, { status: 201 });
  } catch (error) {
    console.error('POST /api/membership error:', error);
    return NextResponse.json(
      { error: 'Failed to create/update membership snapshot' },
      { status: 500 }
    );
  }
}
