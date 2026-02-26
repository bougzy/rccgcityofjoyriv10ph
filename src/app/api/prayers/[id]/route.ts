import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PrayerRequest from '@/lib/models/PrayerRequest';
import { getSessionUser, hasMinimumRole } from '@/lib/auth-helpers';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || !hasMinimumRole(user.role || '', 'parish-admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const prayer = await PrayerRequest.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!prayer) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(prayer);
  } catch (error) {
    console.error('PUT /api/prayers/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || !hasMinimumRole(user.role || '', 'parish-admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    await PrayerRequest.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('DELETE /api/prayers/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
