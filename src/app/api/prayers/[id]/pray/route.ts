import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PrayerRequest from '@/lib/models/PrayerRequest';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const prayer = await PrayerRequest.findByIdAndUpdate(
      id,
      { $inc: { prayerCount: 1 } },
      { new: true }
    ).lean();

    if (!prayer) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ prayerCount: prayer.prayerCount });
  } catch (error) {
    console.error('POST /api/prayers/[id]/pray error:', error);
    return NextResponse.json({ error: 'Failed to record prayer' }, { status: 500 });
  }
}
