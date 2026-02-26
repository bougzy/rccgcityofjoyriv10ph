import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/lib/models/Settings';
import { getSessionUser, hasMinimumRole } from '@/lib/auth-helpers';

export async function GET() {
  try {
    await dbConnect();
    const settings = await Settings.findOne({}).lean();
    const liveCounter = (settings as Record<string, unknown>)?.liveCounter || { count: 0, isActive: false, label: 'Live Attendance' };
    return NextResponse.json(liveCounter);
  } catch (error) {
    console.error('GET /api/live-counter error:', error);
    return NextResponse.json({ count: 0, isActive: false, label: 'Live Attendance' });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !hasMinimumRole(user.role || '', 'parish-admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();
    const { count, isActive, label, action } = body;

    const update: Record<string, unknown> = {};
    if (typeof count === 'number') update['liveCounter.count'] = count;
    if (typeof isActive === 'boolean') update['liveCounter.isActive'] = isActive;
    if (label) update['liveCounter.label'] = label;
    if (action === 'increment') update.$inc = { 'liveCounter.count': 1 };
    if (action === 'decrement') update.$inc = { 'liveCounter.count': -1 };
    if (action === 'reset') update['liveCounter.count'] = 0;

    const settings = await Settings.findOneAndUpdate(
      {},
      action === 'increment' || action === 'decrement'
        ? { $inc: { 'liveCounter.count': action === 'increment' ? 1 : -1 } }
        : { $set: update },
      { new: true, upsert: true }
    ).lean();

    const liveCounter = (settings as Record<string, unknown>)?.liveCounter || { count: 0, isActive: false };
    return NextResponse.json(liveCounter);
  } catch (error) {
    console.error('PUT /api/live-counter error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
