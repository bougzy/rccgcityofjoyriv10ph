import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Testimony from '@/lib/models/Testimony';
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

    const testimony = await Testimony.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!testimony) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(testimony);
  } catch (error) {
    console.error('PUT /api/testimonies/[id] error:', error);
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
    await Testimony.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('DELETE /api/testimonies/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
