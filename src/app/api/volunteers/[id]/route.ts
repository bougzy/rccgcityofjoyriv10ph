import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import VolunteerProfile from '@/lib/models/VolunteerProfile';
import { getSessionUser, hasMinimumRole } from '@/lib/auth-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const volunteer = await VolunteerProfile.findById(id)
      .populate('parish', 'name')
      .populate('naturalGroups', 'name')
      .lean();
    if (!volunteer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(volunteer);
  } catch (error) {
    console.error('GET /api/volunteers/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

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
    const volunteer = await VolunteerProfile.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!volunteer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(volunteer);
  } catch (error) {
    console.error('PUT /api/volunteers/[id] error:', error);
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
    await VolunteerProfile.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('DELETE /api/volunteers/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
