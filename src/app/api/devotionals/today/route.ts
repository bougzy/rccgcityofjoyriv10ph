import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Devotional from '@/lib/models/Devotional';

export async function GET() {
  try {
    await dbConnect();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Try to find today's devotional
    let devotional = await Devotional.findOne({
      date: { $gte: today, $lt: tomorrow },
      isPublished: true,
    }).lean();

    // If no devotional for today, get the most recent published one
    if (!devotional) {
      devotional = await Devotional.findOne({ isPublished: true })
        .sort('-date')
        .lean();
    }

    if (!devotional) {
      return NextResponse.json({ error: 'No devotional available' }, { status: 404 });
    }

    return NextResponse.json(devotional);
  } catch (error) {
    console.error('GET /api/devotionals/today error:', error);
    return NextResponse.json({ error: 'Failed to fetch devotional' }, { status: 500 });
  }
}
